const fs = require("fs");
const path = require("path");
const JSONSteam = require("JSONStream");
const meta_parser = require("./metadata_parser");

const use_config = async (config) => {
    let config_data;
    try{
        config_data = JSON.parse(config);
    } catch (err){
        throw new Error("The config.json has some errors:\n" + err);
    }
    
    try{
        let stream = JSONSteam.parse(["chats", "list", true]);
        let count = 0;
        let result;
        stream.on('data', function(data) {
            if (data.name === "nahom"){
                result = {
                    days: {},
                    daily: {},
                    weeks: {},
                    hours: {}
                };
                data.messages.forEach(message => meta_parser(message, result))
            }
            console.log(++count); 
          });
          //emits anything from _before_ the first match
          stream.on('header', function (data) {
            console.log('header:', data) // => {"total_rows":129,"offset":0}
          });
        stream.on("close", ()=>{
            console.log("we are done");
            fs.writeFile(path.join(__dirname, ...config_data.output), JSON.stringify(result, null, 2), (err) =>{                if (err) throw err
                console.log("Finished writing to output...");
                
            });
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