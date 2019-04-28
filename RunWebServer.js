#!/usr/bin/env node

"use strict";

/*
    This script is for setting up the web server and making 
    sure all preferences and options are loaded.

    Use the "SERVER" global variable sparingly but don't 
    be afraid to use it. :-)
*/


const fs = require('fs');
const path = require('path');



/*
    Yes.. it's a global!!! 

    Change the info you need below for your own server. 
*/

global.SERVER = {
    ProjectInfo: {
        Title: 'api-puppy Demo',
        Version: '1.10.37',
    },
    Network: {
        /* 
            Selected port because 80 and 443 are normally used for webby stuff. 
            See (https://github.com/johnrnelson/api-puppy/blob/master/Notes/Server/iptables.md)
            for more info on how to setup iptables to the other ports...
        */
        PORT_HTTP: 9080,
        PORT_HTTPS: 9443,

        // IPADDRESS: '127.0.0.1',  // Localhost is a safe play!    

        // This binds us to any NIC on the server. Becareful with this!!!
        IPADDRESS: '0.0.0.0',
    },
    Statistics: {
        Services: {
            TotalSuccess: 0,
            TotalError: 0,
        },
        System: {
            TotalSuccess: 0,
            TotalError: 0,
        },        
    },

    /*
        Kind of confusing, but the root folder is actually the "APIServer" folder...
    */
    RootFolder: path.join(__dirname, "APIServer"),

    /*
        Where are your services located?
    */
    ServicesFolder: path.join(__dirname, "APIServices"),

    /* 
        This is used in our services to act as a database.
        Of course it gets blown away every time the service
        starts but thats ok because we are JUST A DEMO!!!  :-)
    */
    IN_MEM_DB: {
        fruit: ['apples', 'pears', 'peaches']
    }
};




//Load up our defender...
SERVER.Defender = require("./APIServer/defender/shield");

//The born date of this process...
SERVER.Started = new Date();


//Get our server options...
(function () {
    try {

        const APIServerOptions = JSON.parse(fs.readFileSync(path.join(__dirname, "SECRET", "CONFIG.json"), "utf8"));
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

