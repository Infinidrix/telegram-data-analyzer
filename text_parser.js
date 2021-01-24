const { stringify } = require("JSONStream");

const text_parser = (message, result) => {
    let type = message.type;
    let media_type = message.media_type;
    let mime_type = message.mime_type;
    if (result.types == undefined) {
        result.types = {
            type: [],
            media_type: [],
            mime_type: [],
            text_type: {},
            text_aggregate: {},
        }
    }

    if (message.type == "message"){
        if (result.types.text_type[typeof(message.text)] == undefined){
            result.types.text_type[typeof(message.text)] = message.text;
        }
        if (typeof(message.text) == "string"){
            message.text.split(" ").forEach(element => {
                if (result.types.text_aggregate[element] == undefined){
                    result.types.text_aggregate[element] = 1;
                }
                else result.types.text_aggregate[element]++;
            });
        }
        else{
            for (part in message.text){
                if (typeof(part) == "string"){
                    part.split(" ").forEach(element => {
                        if (result.types.text_aggregate[element] == undefined){
                            result.types.text_aggregate[element] = 1;
                        }
                        else result.types.text_aggregate[element]++;
                    });
                }
            }
        }
    }

    if (type !== undefined && !result.types.type.includes(type)){
        result.types.type.push(type);
    }

    if (media_type !== undefined && !result.types.media_type.includes(media_type)){
        result.types.media_type.push(media_type);
    }

    if (mime_type !== undefined && !result.types.mime_type.includes(mime_type)){
        result.types.mime_type.push(mime_type);
    }
}

module.exports = text_parser;