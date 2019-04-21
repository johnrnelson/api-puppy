#!/usr/bin/env node

"use strict";


var fs = require("fs");
var path = require("path");

const SETUP_PATHS = {
    CERTS_FOLDER: path.join(__dirname, "CERTS"),
    SECRETS_FOLDER: path.join(__dirname, "SECRET"),
    LOGS_FOLDER: path.join(__dirname, "SECRET", "LOGS"),
}

/*
    Do they have the folder?
*/

if (!fs.existsSync(SETUP_PATHS.CERTS_FOLDER)) {
    console.log('Creating the "CERTS" folder!');
    fs.mkdirSync(SETUP_PATHS.CERTS_FOLDER);
}
if (!fs.existsSync(SETUP_PATHS.SECRETS_FOLDER)) {
    console.log('Creating the "SECRET" folder!');
    fs.mkdirSync(SETUP_PATHS.SECRETS_FOLDER);
    const FileData = {
        CERTS: {
            //Change this for your own domain!
            path: 'demo.tektology.com'
        },
       
    }
    fs.writeFileSync(path.join(SETUP_PATHS.SECRETS_FOLDER, "CONFIG.json"), JSON.stringify(FileData, null, "\t"), { flag: 'w' });
}
if (!fs.existsSync(SETUP_PATHS.LOGS_FOLDER)) {
    console.log('Creating the "LOGS" folder in "SECRET"!');
    fs.mkdirSync(SETUP_PATHS.LOGS_FOLDER);
}
 
console.log('\r\nOk you are all set up. :-)');
