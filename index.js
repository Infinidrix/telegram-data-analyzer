const fs = require("fs");
const path = require("path");
const JSONSteam = require("JSONStream");
const meta_parser = require("./metadata_parser");
const text_parser = require("./text_parser");
const post_meta = require("./post_meta");
const beautify = require("./beautify");

const use_config = async (config) => {
    let config_data;
    try{
        config_data = JSON.parse(config);
    } catch (err){
        throw new Error("The config.json has some errors:\n" + err);
    }
    
    try{
        console.time("analyze-text");
        let stream = JSONSteam.parse(["chats", "list", true]);
        let count = 0;
        let result;
        stream.on('data', function(data) {
            if (true){
                result = {
                    months: {},
                    daily: {},
                    weeks: {},
                    hours: {}
                };
                temp_stats = {}
                data.messages.forEach(message => meta_parser(message, result, temp_stats));
                data.messages.forEach(message => text_parser(message, result, temp_stats));
                post_meta(result, temp_stats); 
                let filename = data.name + "_" + data.id +".json";
                fs.writeFile(path.join(__dirname, ...config_data.output, filename), JSON.stringify(result, null, 2), (err) =>{                
                    if (err) console.log(err);
                    console.log(`Finished writing ${data.name} to output...`);
                });
                filename = data.name + "_" + data.id +".txt";
                fs.writeFile(path.join(__dirname, ...config_data.formatted_text, filename), beautify(result, config), (err) =>{                
                    if (err) console.log(err);
                    console.log(`Finished writing ${data.name} to formatted output...`);
                });
                
            }
          });
          //emits anything from _before_ the first match
          stream.on('header', function (data) {
            console.log('header:', data);
          });
        stream.on("close", ()=>{
            console.timeEnd("analyze-text");
        });
        fs.createReadStream(path.join(__dirname, ...config_data.filepath))
        .pipe(stream);
    } catch (err){
        throw err;
    }

};

fs.readFile(path.join(__dirname, "config.json"), async (err, data) => {
    if (err) throw err;
    
    await use_config(data);
})