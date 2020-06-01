const moment = require("moment");


const meta_parser = (message, stats, temp_stats) => {
    let message_date = moment(message.date);
    let sender;

    if (message.from != undefined){
        sender = message.from;
    }else if (message.from === null){
        sender = "DELETED";
    }else if(message.from == undefined && message.actor != undefined){
        sender = message.actor;
    }else{
        sender = "DELETED";
    }
    
    if (stats.all === undefined){
        stats.all = {messages: {members: {[sender]: 0}, all: 0}};
    }else if(stats.all.messages.members[sender] === undefined){
        stats.all.messages.members[sender] = 0;
    }
    stats.all.messages.members[sender]++;
    stats.all.messages.all++;

    date_parser(message, stats, temp_stats, sender);

    daily_parser(message, stats, temp_stats, sender);
    
    week_parser(message, stats, temp_stats, sender);

    hour_parser(message, stats, temp_stats, sender);

    ext_time_parser(message, stats, temp_stats, sender);

    active_days(message, stats, temp_stats, sender);

    audio_meta_parser(message, stats, temp_stats, sender);
}

const audio_meta_parser = (message, stats, temp_stats, sender) => {
    if (message.media_type == undefined || message.media_type != "voice_message"){
        return
    }
    let message_date = moment(message.date);

    if (stats.all.audio == undefined){
        stats.all.audio = {
            all: moment.duration(0, 'seconds'),
            members: {}
        };
    }
    if (stats.all.audio.members[sender] == undefined){
        stats.all.audio.members[sender] = moment.unix(0).subtract(3, "hours");
    }
    let duration = message.duration_seconds;
    stats.all.audio.members[sender].add(duration, "seconds");
    stats.all.audio.all.add(duration, "seconds");
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
    // if new message happened earlier than the other messages before it 
    // else if (stats.months[message_date.year()].all.active_days.all.all_days < year_date_gap){
    //     stats.months[message_date.year()].all.active_days.all.all_days = year_date_gap;
    // }
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
    // else if(stats.months[message_date.year()].all.active_days.members[sender].all_days < year_date_gap){
    //     stats.months[message_date.year()].all.active_days.members[sender].all_days = year_date_gap;
    // }
    // console.log("Done");
    
}

const ext_time_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    if (temp_stats.ext_times == undefined){
        temp_stats.ext_times = {};
    }
    // let me = message_date.month();
    // let mw = message_date.date();
    let date = message_date.year() + "-" + message_date.month() + "-" + message_date.date();
    if (temp_stats.ext_times[date] == undefined){
        temp_stats.ext_times[date] = {};
    }
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