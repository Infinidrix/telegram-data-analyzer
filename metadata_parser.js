const moment = require("moment");


const meta_parser = (message, stats, temp_stats) => {
    let message_date = moment(message.date);
    let sender;

    // Get sender of message from message.from or message.actor
    if (message.from != undefined){
        sender = message.from;
    }else if (message.from === null){
        sender = "DELETED";
    }else if(message.from == undefined && message.actor != undefined){
        sender = message.actor;
    }else{
        sender = "DELETED";
    }
    
    // Add message to all message counter and all sender message counter
    if (stats.all === undefined){
        stats.all = {messages: {members: {[sender]: 0}, all: 0}};
    }else if(stats.all.messages.members[sender] === undefined){
        stats.all.messages.members[sender] = 0;
    }
    stats.all.messages.members[sender]++;
    stats.all.messages.all++;

    // Parses info in stats.months
    date_parser(message, stats, temp_stats, sender);

    // Parses info in stats.daily
    daily_parser(message, stats, temp_stats, sender);
    
    // Parses info in stats.weeks
    week_parser(message, stats, temp_stats, sender);

    // Parses info in stats.hours
    hour_parser(message, stats, temp_stats, sender);

    // Parses info in temp_stats.ext_times (first and last messages)
    ext_time_parser(message, stats, temp_stats, sender);

    // Parses active_days in stats.all and stats.months.all
    active_days(message, stats, temp_stats, sender);

    // Parses audio in stats.all and stats.months.all
    audio_meta_parser(message, stats, temp_stats, sender);

    // Parses reply_graph in stats.all
    reply_graph_parser(message, stats, temp_stats, sender);
}

const reply_graph_parser = (message, stats, temp_stats, sender) => {
    // Create temp_stats.id_store to relate message_id and sender
    if (temp_stats.id_store == undefined){
        temp_stats.id_store = {};
    }
    temp_stats.id_store[message.id] = sender;

    // Ignore if it's not a reply to a message
    if (message.reply_to_message_id == undefined) return;

    // Increase the count of the relevant node in stats.all.reply_graph (create if absent)
    let reciver = temp_stats.id_store[message.reply_to_message_id];
    if (stats.all.reply_graph == undefined){
        stats.all.reply_graph = {all: 0, members: {}}
    }
    if (stats.all.reply_graph.members[sender] == undefined){
        stats.all.reply_graph.members[sender] = {}
    }
    if (stats.all.reply_graph.members[sender][reciver] == undefined){
        stats.all.reply_graph.members[sender][reciver] = 0;
    }
    stats.all.reply_graph.members[sender][reciver]++;
    stats.all.reply_graph.all++;
}

const audio_meta_parser = (message, stats, temp_stats, sender) => {
    // If it's not a voice message return (don't execute the rest)
    if (message.media_type == undefined || message.media_type != "voice_message"){
        return
    }
    let message_date = moment(message.date);

    // Save stats.all.audio as a moment duration for readablilty
    if (stats.all.audio == undefined){
        stats.all.audio = {
            all: moment.duration(0, 'seconds'),
            members: {}
        };
    }

    // Save stats.all.audio.members[sender] as a date to extract the format as desired
    if (stats.all.audio.members[sender] == undefined){
        stats.all.audio.members[sender] = moment.unix(0).subtract(3, "hours");
    }
    // Add the new duration of time to all
    let duration = message.duration_seconds;
    stats.all.audio.members[sender].add(duration, "seconds");
    stats.all.audio.all.add(duration, "seconds");

    // Add the new message duration to year specific
    if (stats.months[message_date.year()].all.audio == undefined){
        stats.months[message_date.year()].all.audio = {
            all: moment.duration(0, 'seconds'),
            members: {}
        };
    }
    if (stats.months[message_date.year()].all.audio.members[sender] == undefined){
        stats.months[message_date.year()].all.audio.members[sender] = moment.duration(0, "seconds");
    }
    stats.months[message_date.year()].all.audio.members[sender].add(duration, "seconds");
    stats.months[message_date.year()].all.audio.all.add(duration, "seconds");
}

const active_days = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let all_date_gap = moment().diff(message_date, "days");
    // let year_date_gap = message_date.clone().endOf("year").diff(message_date, "days");

    // define active days object
    if (stats.all.active_days == undefined){
        stats.all.active_days = {
            all:{all_days: moment().diff(message_date, "days")}
        };
    }else if(stats.all.active_days.all.all_days < all_date_gap){
        stats.all.active_days.all.all_days = all_date_gap;
    }
    // sender specific info stored in members object
    if (stats.all.active_days.members == undefined){
        stats.all.active_days.members = {};
    }
    
    // from first message till current date
    if (stats.all.active_days.members[sender] == undefined){
        stats.all.active_days.members[sender] = {all_days: moment().diff(message_date, "days")};
    }else if(stats.all.active_days.members[sender].all_days < all_date_gap){
        stats.all.active_days.members[sender].all_days = all_date_gap;
    }

    // if year is undefined
    if (stats.months[message_date.year()].all.active_days == undefined){
    
        // if the message's year is the current year then end date is current date else end of year
        let last_day;
        if (moment().year() == message_date.year()){
            last_day = moment();
        }else{
            last_day = message_date.clone().endOf("year");
        }
        // If the prev year is definied (conversation happened in prev year) then consider days 365 (or 366)
        // otherwise from start of first message of the year
        if (stats.months[message_date.year() - 1] == undefined){
            stats.months[message_date.year()].all.active_days = {
                all:{all_days: last_day.diff(message_date, "days")}
            };
        }else{
            stats.months[message_date.year()].all.active_days = {
                all:{all_days: last_day.diff(message_date.clone().startOf("year"), "days")}
            };
        }
    }

    // inistantiate the yearly members
    if (stats.months[message_date.year()].all.active_days.members == undefined){
        stats.months[message_date.year()].all.active_days.members = {};
    }
    if (stats.months[message_date.year()].all.active_days.members[sender] == undefined){
        // if the message's year is the current year then end date is current date else end of year
        let last_day;
        if (moment().year() == message_date.year()){
            last_day = moment();
        }else{
            last_day = message_date.clone().endOf("year");
        }
        if (stats.months[message_date.year() - 1] == undefined){
            stats.months[message_date.year()].all.active_days.members[sender] = {
                all_days: last_day.diff(message_date, "days")
            };
        }else{
            stats.months[message_date.year()].all.active_days.members[sender] = {
                all_days: last_day.diff(message_date.clone().startOf("year"), "days")
            };
        }
    }
    
}

const ext_time_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    if (temp_stats.ext_times == undefined){
        temp_stats.ext_times = {};
    }
    // Creates a unique key for each date and sets value to the last and first message date values
    let date = message_date.year() + "-" + message_date.month() + "-" + message_date.date();
    if (temp_stats.ext_times[date] == undefined){
        temp_stats.ext_times[date] = {};
    }
    // If this is the first message seen then save as first and last message dates else compare
    if (temp_stats.ext_times[date][sender] == undefined){
        temp_stats.ext_times[date][sender] = {
            first: message_date,
            last: message_date,
        }
    }else if(message_date.isBefore(temp_stats.ext_times[date][sender].first)){
        temp_stats.ext_times[date][sender].first = message_date;
    }else if(message_date.isAfter(temp_stats.ext_times[date][sender].last)){
        temp_stats.ext_times[date][sender].last = message_date;
    }

}

const date_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let date_stats = stats.months;

    if(date_stats[message_date.year()] === undefined){
        date_stats[message_date.year()] = {
            all: {messages: {members: {[sender]: 0}, all: 0}}
        };
    } else if (date_stats[message_date.year()].all.messages.members[sender] === undefined){
        date_stats[message_date.year()].all.messages.members[sender]= 0;
    }
    date_stats[message_date.year()].all.messages.members[sender]++;
    date_stats[message_date.year()].all.messages.all++;

    if (date_stats[message_date.year()][message_date.month()] === undefined){
        date_stats[message_date.year()][message_date.month()] = {
            all: {messages: {members:{[sender]: 0}, all: 0}}
        };
    } else if (date_stats[message_date.year()][message_date.month()].all.messages.members[sender] === undefined){
        date_stats[message_date.year()][message_date.month()].all.messages.members[sender] = 0;
    }
    date_stats[message_date.year()][message_date.month()].all.messages.members[sender]++;
    date_stats[message_date.year()][message_date.month()].all.messages.all++;
}

const daily_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let daily_stats = stats.daily;
    
    try {
        if(daily_stats[message_date.year()] == undefined){
            daily_stats[message_date.year()] = {}
        }
        if (daily_stats[message_date.year()][message_date.dayOfYear()] === undefined ){
            daily_stats[message_date.year()][message_date.dayOfYear()] = {
                all: {messages: {members: {[sender]: 0}, all: 0}}
            };
        }else if(daily_stats[message_date.year()][message_date.dayOfYear()].all.messages.members[sender] === undefined){
            daily_stats[message_date.year()][message_date.dayOfYear()].all.messages.members[sender] = 0;
        }
    }catch (err){
        console.log(stats);
        console.log(daily_stats[message_date.year()][message_date.dayOfYear()].all.messages.members[sender]);
        throw err; 
    }
    daily_stats[message_date.year()][message_date.dayOfYear()].all.messages.members[sender]++;
    daily_stats[message_date.year()][message_date.dayOfYear()].all.messages.all++;

}

const week_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let week_stats = stats.weeks;
    if (week_stats[message_date.weekday()] === undefined){
        week_stats[message_date.weekday()] = {all: {messages: {members: {[sender]: 0}, all: 0}}};
    } else if (week_stats[message_date.weekday()].all.messages.members[sender] === undefined){
        week_stats[message_date.weekday()].all.messages.members[sender] = 0;
    } 
    week_stats[message_date.weekday()].all.messages.members[sender]++;
    week_stats[message_date.weekday()].all.messages.all++;

}

const hour_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let hour_stats = stats.hours;
    if (hour_stats[message_date.hour()] === undefined){
        hour_stats[message_date.hour()] = {all: {messages: {members: {[sender]: 0}, all: 0}}};
    } else if (hour_stats[message_date.hour()].all.messages.members[sender] === undefined){
        hour_stats[message_date.hour()].all.messages.members[sender] = 0;
    } 
    hour_stats[message_date.hour()].all.messages.members[sender]++;
    hour_stats[message_date.hour()].all.messages.all++;
}
module.exports = meta_parser;