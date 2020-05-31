
const text_parser = (message, result) => {
    let type = message.type;
    let media_type = message.media_type;
    let mime_type = message.mime_type;
    if (message.actor == undefined && message.from == undefined){
        // console.log(message);
    }
    if (result.types == undefined) {
        result.types = {
            type: [],
            media_type: [],
            mime_type: []
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