/*

    Main script for this project. 

    Use the RunWebServer is just testing or 
    debugging...
*/

const fs = require('fs');
const path = require('path');


module.exports = function (ConfigOptoins) {


    global.SERVER = ConfigOptoins;

    //Load up our defender...
    SERVER.Defender = require("./APIServer/defender/shield");

    //The born date of this process...
    SERVER.Started = new Date();


    //Get our server options...
    (function () {
        try {


            // debugger;
            const APIServerOptions = JSON.parse(fs.readFileSync(path.join(SERVER.SECRET, "CONFIG.json"), "utf8"));
            console.log("Setting API Options via the CONFIG File");
            SERVER.CERTS = APIServerOptions.CERTS;
            SERVER.KEYS = APIServerOptions.KEYS;

            SERVER.ServiceLogger = require('./APIServer/ServiceLogger');
            SERVER.ServiceLogger.SetOptions(APIServerOptions.Logger);



        } catch (err) {
            console.log('Please fix your CONFIG.json file in the "SERCRET" folder!');
            process.exit(1);
        }
    })();






    /*
        Save time by just compiling the debug files.. You can always make this a 
        task or use grunt or whatever ya like... :-)
    
        Use the sync since we won't bother starting up the http servers untill
        we have the right debug html.. 
    */
    (function () {

        const path2debug = __dirname + "/docs/debug/";

        var debugHTML = fs.readFileSync(path2debug + "src/debug.html", 'utf8');
        const clientjs = fs.readFileSync(path2debug + "src/client.js", 'utf8');

        debugHTML = debugHTML.replace('/* SERVER REPLACES SCRIPTS */', clientjs);
        fs.writeFileSync(path2debug + 'min/debug.html', debugHTML, { flag: 'w' });
    })();


    const APIServer = require('./APIServer/APIServer');
    APIServer.StartServer();



}

