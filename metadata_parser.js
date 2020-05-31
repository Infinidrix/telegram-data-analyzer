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
        stats.all = {members: {[sender]: 0, all: 0}};
    }else if(stats.all.members[sender] === undefined){
        stats.all.members[sender] = 0;
    }
    stats.all.members[sender]++;
    stats.all.members.all++;

    date_parser(message, stats, temp_stats, sender);

    daily_parser(message, stats, temp_stats, sender);
    
    week_parser(message, stats, temp_stats, sender);

    hour_parser(message, stats, temp_stats, sender);

    ext_time_parser(message, stats, temp_stats, sender);
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
            all: {members: {[sender]: 0, all: 0}}
        };
    } else if (date_stats[message_date.year()].all.members[sender] === undefined){
        date_stats[message_date.year()].all.members[sender]= 0;
    }
    date_stats[message_date.year()].all.members[sender]++;
    date_stats[message_date.year()].all.members.all++;

    if (date_stats[message_date.year()][message_date.month()] === undefined){
        date_stats[message_date.year()][message_date.month()] = {
            all: {members:{[sender]: 0, all: 0}}
        };
    } else if (date_stats[message_date.year()][message_date.month()].all.members[sender] === undefined){
        date_stats[message_date.year()][message_date.month()].all.members[sender] = 0;
    }
    date_stats[message_date.year()][message_date.month()].all.members[sender]++;
    date_stats[message_date.year()][message_date.month()].all.members.all++;
}

const daily_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let daily_stats = stats.daily;
    
    try {
        if (daily_stats[message_date.dayOfYear()] === undefined ){
            daily_stats[message_date.dayOfYear()] = {
                all: {members: {[sender]: 0, all: 0}}
            };
        }else if(daily_stats[message_date.dayOfYear()].all.members[sender] === undefined){
            daily_stats[message_date.dayOfYear()].all.members[sender] = 0;
        }
    }catch (err){
        console.log(stats);
        console.log(daily_stats[message_date.dayOfYear()].all.members[sender]);
        throw err; 
    }
    daily_stats[message_date.dayOfYear()].all.members[sender]++;
    daily_stats[message_date.dayOfYear()].all.members.all++;

}

const week_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let week_stats = stats.weeks;
    if (week_stats[message_date.weekday()] === undefined){
        week_stats[message_date.weekday()] = {all: {members: {[sender]: 0, all: 0}}};
    } else if (week_stats[message_date.weekday()].all.members[sender] === undefined){
        week_stats[message_date.weekday()].all.members[sender] = 0;
    } 
    week_stats[message_date.weekday()].all.members[sender]++;
    week_stats[message_date.weekday()].all.members.all++;

}

const hour_parser = (message, stats, temp_stats, sender) => {
    let message_date = moment(message.date);
    let hour_stats = stats.hours;
    if (hour_stats[message_date.hour()] === undefined){
        hour_stats[message_date.hour()] = {all: {members: {[sender]: 0, all: 0}}};
    } else if (hour_stats[message_date.hour()].all.members[sender] === undefined){
        hour_stats[message_date.hour()].all.members[sender] = 0;
    } 
    hour_stats[message_date.hour()].all.members[sender]++;
    hour_stats[message_date.hour()].all.members.all++;
}
module.exports = meta_parser;