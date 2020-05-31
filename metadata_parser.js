const moment = require("moment");


const meta_parser = (message, stats) => {
    let message_date = moment(message.date);
    let sender = message.from;
    
    if (stats.all === undefined){
        stats.all = {[sender]: 0};
    }else if(stats.all[sender] === undefined){
        stats.all[sender] = 0;
    }
    stats.all[sender]++;

    let date_stats = stats.days;

    if(date_stats[message_date.year()] === undefined){
        date_stats[message_date.year()] = {
            all: {[sender]: 0}
        };
    } else if (date_stats[message_date.year()].all[sender] === undefined){
        date_stats[message_date.year()].all[sender]= 0;
    }
    date_stats[message_date.year()].all[sender]++;

    if (date_stats[message_date.year()][message_date.month()] === undefined){
        date_stats[message_date.year()][message_date.month()] = {
            all: {[sender]: 0}
        };
    } else if (date_stats[message_date.year()][message_date.month()].all[sender] === undefined){
        date_stats[message_date.year()][message_date.month()].all[sender] = 0;
    }
    date_stats[message_date.year()][message_date.month()].all[sender]++;

    let daily_stats = stats.daily;
    
    try {
        if (daily_stats[message_date.dayOfYear()] === undefined ){
            daily_stats[message_date.dayOfYear()] = {
                all: {[sender]: 0}
            };
        }else if(daily_stats[message_date.dayOfYear()].all[sender] === undefined){
            daily_stats[message_date.dayOfYear()].all[sender] = 0;
        }
    }catch (err){
        console.log(stats);
        console.log(daily_stats[message_date.dayOfYear()].all[sender]);
        throw err; 
    }
    daily_stats[message_date.dayOfYear()].all[sender]++;

    let week_stats = stats.weeks;
    if (week_stats[message_date.weekday()] === undefined){
        week_stats[message_date.weekday()] = {all: {[sender]: 0}};
    } else if (week_stats[message_date.weekday()].all[sender] === undefined){
        week_stats[message_date.weekday()].all[sender] = 0;
    } 
    week_stats[message_date.weekday()].all[sender]++;

    let hour_stats = stats.hours;
    if (hour_stats[message_date.hour()] === undefined){
        hour_stats[message_date.hour()] = {all: {[sender]: 0}};
    } else if (hour_stats[message_date.hour()].all[sender] === undefined){
        hour_stats[message_date.hour()].all[sender] = 0;
    } 
    hour_stats[message_date.hour()].all[sender]++;
}

module.exports = meta_parser;