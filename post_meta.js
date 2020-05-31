const moment = require("moment");

const post_meta_analysis = (meta, temp) => {
    ext_times(meta, temp)
}

const ext_times = (meta, temp) => {
    let current_year = -1;
    let current_month = -1;
    let year_average = {
        sum_first: {}, count_first: {},
        sum_last: {}, count_last: {},
    };
    let month_average = {
        sum_first: {}, count_first: {},
        sum_last: {}, count_last: {},
    };
    let all_average = {
        sum_first: {}, count_first: {},
        sum_last: {}, count_last: {},
    };
    let date_first;
    let date_last;
    let sender;
    for (key of Object.keys(temp.ext_times)){
        for (sender of Object.keys(temp.ext_times[key])){
            // date objects of first and last texts of a day
            date_first = moment(temp.ext_times[key][sender].first)
            date_last = moment(temp.ext_times[key][sender].last);
            
            // if moving to a new month calculate the previous one
            if (current_month !== -1 && current_month != date_first.month()){
                meta.months[current_year][current_month].all.average = {};
                for (sender of Object.keys(month_average.sum_first)){
                    meta.months[current_year][current_month].all.average[sender] = {first: 0, last: 0};
                    meta.months[current_year][current_month].all.average[sender].first = parseTime(month_average.sum_first[sender]/month_average.count_first[sender]);
                    meta.months[current_year][current_month].all.average[sender].last = parseTime(month_average.sum_last[sender]/month_average.count_last[sender]);
                }
                month_average = {
                    sum_first: {}, count_first: {},
                    sum_last: {}, count_last: {},
                };
            }
            // if moving to a new year calculate the previous one
            if (current_year !== -1 && current_year != date_first.year()){
                meta.months[current_year].all.average = {};
                for (sender of Object.keys(year_average.sum_first)){
                    meta.months[current_year].all.average[sender] = {first: 0, last: 0}
                    meta.months[current_year].all.average[sender].first = parseTime(year_average.sum_first[sender]/year_average.count_first[sender]);
                    meta.months[current_year].all.average[sender].last = parseTime(year_average.sum_last[sender]/year_average.count_last[sender]);
                }
                year_average = {
                    sum_first: {}, count_first: {},
                    sum_last: {}, count_last: {},
                };
            }
            current_month = date_first.month();
            current_year = date_first.year();
            let time_first = parseInt(date_first.hours())*3600 + parseInt(date_first.minute())*60 + parseInt(date_first.second());
            let time_last = parseInt(date_last.hours())*3600 + parseInt(date_last.minute())*60 + parseInt(date_last.second());
            if (month_average.sum_first[sender] == undefined){
                month_average.count_first[sender] = 0;
                month_average.sum_first[sender] = 0;
            }
            month_average.sum_first[sender] += time_first;
            month_average.count_first[sender]++;
            if (year_average.sum_first[sender] == undefined){
                year_average.count_first[sender] = 0;
                year_average.sum_first[sender] = 0;
            }
            year_average.sum_first[sender] += time_first;
            year_average.count_first[sender]++;
            if (all_average.sum_first[sender] == undefined){
                all_average.count_first[sender] = 0;
                all_average.sum_first[sender] = 0;
            }
            all_average.sum_first[sender] += time_first;
            all_average.count_first[sender]++;

        
            if (month_average.sum_last[sender] == undefined){
                month_average.count_last[sender] = 0;
                month_average.sum_last[sender] = 0;
            }
            month_average.sum_last[sender] += time_last;
            month_average.count_last[sender]++;
            if (year_average.sum_last[sender] == undefined){
                year_average.count_last[sender] = 0;
                year_average.sum_last[sender] = 0;
            }
            year_average.sum_last[sender] += time_last;
            year_average.count_last[sender]++;
            if (all_average.sum_last[sender] == undefined){
                all_average.count_last[sender] = 0;
                all_average.sum_last[sender] = 0;
            }
            all_average.sum_last[sender] += time_last;
            all_average.count_last[sender]++;
        }
    }
    
    meta.months[date_first.year()][current_month].all.average = {};
    for (sender of Object.keys(month_average.sum_first)){
        meta.months[date_first.year()][current_month].all.average[sender] = {first: 0, last: 0};
        meta.months[date_first.year()][current_month].all.average[sender].first = parseTime(month_average.sum_first[sender]/month_average.count_first[sender]);
        meta.months[date_first.year()][current_month].all.average[sender].last = parseTime(month_average.sum_last[sender]/month_average.count_last[sender]);
    }
    meta.months[date_first.year()].all.average = {};
    for (sender of Object.keys(year_average.sum_first)){
        meta.months[date_first.year()].all.average[sender] = {first: 0, last: 0}
        meta.months[date_first.year()].all.average[sender].first = parseTime(year_average.sum_first[sender]/year_average.count_first[sender]);
        meta.months[date_first.year()].all.average[sender].last = parseTime(year_average.sum_last[sender]/year_average.count_last[sender]);
    }
    meta.all.average = {};
    for (sender of Object.keys(all_average.sum_first)){
        meta.all.average[sender] = {first: 0, last: 0}
        meta.all.average[sender].first = parseTime(all_average.sum_first[sender]/all_average.count_first[sender]);
        meta.all.average[sender].last = parseTime(all_average.sum_last[sender]/all_average.count_last[sender]);
    }
}

const parseTime = (seconds) => {
    let result = Math.floor(seconds/3600) + ":" + Math.floor((seconds % 3600) / 60) + ":" + Math.round(seconds%60);;
    return result;
}

module.exports = post_meta_analysis;