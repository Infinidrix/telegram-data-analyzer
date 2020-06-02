

const beautify = (result, config) => {
    let answer = "This chat consists of: ";
    let members = []
    for (member of Object.keys(result.all.messages.members)){
        members.push(member);
    }
    answer = answer + members.join(", ");
    let all_messages = "\nThe number of messages between us is: " + result.all.messages.all + " and divided between the members: \n";
    let sortable = [];
    for (member of members){
        sortable.push([member, result.all.messages.members[member]]);
    }
    sortable.sort((a, b) => b[1] - a[1])
    for (member of sortable){
        all_messages += `${member[0].split(" ")[0]}: ${"█".repeat(Math.round(member[1]*10/result.all.messages.all))} ${Math.round(member[1]*100/result.all.messages.all)}% - ${member[1]}\n`;
    } 
    answer += all_messages;
    let chatful_days = `\nIt has been ${result.all.active_days.all.all_days} days since we started chatting and we've chatted for ${result.all.active_days.all.active_days} days since.\n\n`;
    let hourly_analysis = "Looking at the hourly division of our chats:\n";
    for (hour in result.hours){
        let messages = result.hours[hour].all.messages.all;
        hour = (hour.length == 1) ? hour + " " : hour;
        hourly_analysis += `${hour}: ${"█".repeat(Math.round(messages*100/result.all.messages.all))} ${Math.round(messages*100/result.all.messages.all)}% - ${messages}\n`
    }
    answer += chatful_days;
    answer += hourly_analysis;
    let average = `\nThrough out this time, the average first and last text times were:\n`;
    for (member of members){
        if (result.all.average[member] == undefined) continue;
        average += `${member.split(" ")[0]} - first text: ${result.all.average[member].first}\n`;
        average += `${member.split(" ")[0]} - last text: ${result.all.average[member].last}\n`;
    }
    answer += average;
    if (result.all.audio){
        let audio = `\n\nAnd in this chat we've have sent each other ${result.all.audio.all} of audio messages which is divided as:\n`;
        for (member of Object.keys(result.all.audio.members)){
            audio += `${member.split(" ")[0]}: ${result.all.audio.members[member]}\n`;
        }
        answer += audio;
    }

    let yearly_breakdown = "\nLooking at the monthly breakdown of our chat:\n";
    for (year of Object.keys(result.months)){
        if (year === "all") continue
        for (month of Object.keys(result.months[year])){
            if (month === "all") continue
            let message_count = result.months[year][month].all.messages.all;
            month = (parseInt(month) < 9) ? parseInt(month) + 1 + " " : parseInt(month) + 1;
            yearly_breakdown += `${year}-${month}: ${"█".repeat(Math.round(message_count*100/result.all.messages.all))} ${Math.round(message_count*100/result.all.messages.all)}% - ${message_count}\n`;
        }
    }
    answer += yearly_breakdown;

    let weekly_breakdown = "\n\nLooking at the breakdown by days of the week:\n";
    let week_names = {
        "0": "Sunday   ",
        "1": "Monday   ",
        "2": "Tuesday  ",
        "3": "Wednesday",
        "4": "Thursday ",
        "5": "Friday   ",
        "6": "Saturday ",
    }
    for (weekday of Object.keys(result.weeks)){
        let message_count = result.weeks[weekday].all.messages.all;
        weekly_breakdown += `${week_names[weekday]}: ${"█".repeat(Math.round(message_count*10/result.all.messages.all))} ${Math.round(message_count*100/result.all.messages.all)}% - ${message_count}\n`
    }
    answer += weekly_breakdown;
    if (result.all.reply_graph){
        let reply_graph = "\n\nAnd to see who replied to who the most (replier -> repliee - Number)\n";
        let reply_aggregate = [];
        let reply_all = result.all.reply_graph.all;
        for (replier of Object.keys(result.all.reply_graph.members)){
            for (repliee of Object.keys(result.all.reply_graph.members[replier])){
                reply_aggregate.push([`${replier.split(" ")[0]} -> ${repliee.split(" ")[0]}`, result.all.reply_graph.members[replier][repliee]]);
            }
        }
        reply_aggregate.sort((a, b) => b[1] - a[1]);
        reply_aggregate = reply_aggregate.slice(0, 10);
        for (reply_pair of reply_aggregate){
            reply_graph += `${reply_pair[0]} - ${reply_pair[1]}\n`
        }
        answer += reply_graph
    }
    return answer;
}
module.exports = beautify;