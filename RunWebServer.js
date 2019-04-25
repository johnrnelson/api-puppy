#!/usr/bin/env node

"use strict";



const fs = require('fs');
const path = require('path');



//Yes.. it's a global!!! 
global.SERVER = {
    Version: '1.10.28',

    Started: new Date(),
    RootFolder: path.join(__dirname, "APIServer"),
    Defender: require("./APIServer/defender/shield"),


    /* 
        This is used in our services to act as a database.
        Of course it gets blown away every time the service
        starts but thats ok because we are JUST A DEMO!!!  :-)
    */
    IN_MEM_DB: {
        fruit: ['apples', 'pears', 'peaches']
    }
};


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
APIServer.StartServer()