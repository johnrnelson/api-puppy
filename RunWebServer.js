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
const api_puppy = require('./index');



const package_data = JSON.parse(fs.readFileSync("./package.json", 'utf8'));


/*
    Yes.. it's a global!!! 

    Change the info you need below for your own server. 
*/


var MySERVER = {

    ProjectInfo: {
        Title: 'api-puppy Demo',
        Version: package_data.version,
        VersionName: 'Ver-Crazy'
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
    SECRET: path.join(__dirname, 'SECRET'),

    //Setup the folder we want to log to...
    LoggerConfig: {
        Folder: path.join(__dirname, 'SECRET', "LOGS"),
        ignore: {
            IP4: [
                "127.0.0.1"
            ]
        }
    },

    //Basic counters for our api services...
    Statistics: {
        Services: {
            TotalSuccess: 0,
            TotalError: 0,
            StatMap: {
                //This gets added to by each service...

                //REMOVE AFTER TESTING!!!!!!
                "help": {
                    Success: 0,
                    Errors: 0
                },
                "data": {
                    Success: 0,
                    Errors: 0
                },
                "logger": {
                    Success: 0,
                    Errors: 0
                }
            },
            AddSiteMapItem(MapName, ItemName) {
                if (!SERVER.Statistics.Services.StatMap[MapName]) {
                    SERVER.Statistics.Services.StatMap[MapName] = {};
                }
                const mapItem = SERVER.Statistics.Services.StatMap[MapName];

                if (!mapItem[ItemName]) {
                    mapItem[ItemName] = 1;
                } else {
                    mapItem[ItemName]++;
                }


            }
        },
        System: {
            TotalSuccess: 0,
            TotalError: 0,
        },
    },




    /*
        Kind of confusing, but the root folder is actually the 
        "APIServer" folder. Thats the "root" of where the 
        files live and left over from old code. :-)
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


/*
    Call the puppy with your server configs...
*/
api_puppy(MySERVER);


