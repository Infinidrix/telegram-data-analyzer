

const beautify = (result, config) => {
    let answer = "This chat consists of: ";
    let members = []
    for (member of Object.keys(result.all.messages.members)){
        members.push(member);
    }
    answer = answer + members.join(", ");
    let all_messages = "\nThe number of messages between us two is: " + result.all.messages.all + " and divided between the members: \n";
    for (member of members){
        let message_count = result.all.messages.members[member];
        all_messages += `${member}: ${"█".repeat(Math.round(message_count*10/result.all.messages.all))} ${Math.round(message_count*100/result.all.messages.all)}% - ${message_count}\n`;
    } 
    answer += all_messages;
    let chatful_days = `\nIt has been ${result.all.active_days.all.all_days} days since we started chatting and we've chatted for ${result.all.active_days.all.active_days} days since.\n\n`;
    let hourly_analysis = "Looking at the hourly division of your chats:\n";
    for (hour in result.hours){
        let messages = result.hours[hour].all.messages.all;
        hourly_analysis += `${hour}: ${"█".repeat(Math.round(messages*100/result.all.messages.all))} ${Math.round(messages*100/result.all.messages.all)}% - ${messages}\n`
    }
    answer += chatful_days;
    answer += hourly_analysis;
    let average = `\nThrough out this time, the average first and last text times were:\n`;
    for (member of members){
        if (result.all.average[member] == undefined) continue;
        average += `${member} - first text: ${result.all.average[member].first}\n`;
        average += `${member} - last text: ${result.all.average[member].last}\n`;
    }
    answer += average;
    if (result.all.audio){
        let audio = `\n\nAnd in this chat we've have sent each other ${result.all.audio.all} of audio messages which is divided as:\n`;
        for (member of members){
            audio += `${member}: ${result.all.audio.members[member]}\n`;
        }
        answer += audio;
    }
    return answer;
}
module.exports = beautify;