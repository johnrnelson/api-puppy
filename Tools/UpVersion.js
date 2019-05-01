#!/usr/bin/env node

"use strict";

/*
    Use this simple script after you have tested all your changed to up the version.
*/
var ThisReleaseVersion;  //Once you get the version this will be set...


function GetVer(OnVer) {
    const fs = require("fs");

    fs.readFile(__dirname + '/../package.json', 'utf8', function (err, fileContents) {

        if (err) {
            console.log('Err Reading file "package.json" ', err.message);
        }
        else {
            try {
 
                // console.log(fileContents);
                const JSONDATA = JSON.parse(fileContents);

                const verItems = JSONDATA.version.split('.');

                verItems[2] = parseInt(verItems[2]) + 1;
                JSONDATA.version = verItems.join('.');
                ThisReleaseVersion = JSONDATA.version;
  
                //Rewrite the package json file....
                fs.writeFile(__dirname + '/../package.json', JSON.stringify(JSONDATA), function (err, fileContents) {
                    // throws an error, you could also catch it here
                    if (err) throw err;

                    OnVer(JSONDATA.version);
                });

            } catch (errJSON) {

            }
        }
    });

}

function CheckInGit(OnCheckIn) {
    // debugger;
    const path = require("path");

    const child_process_exec = require('child_process').exec;


    var path2Project = path.normalize(__dirname);

    var ProdVersionInfo = "Compiled for Production - Version:" + JSON.stringify(ThisReleaseVersion) + "\r\n";
    var cmdCommit = 'git -C "' + path2Project + '" commit -a -m "Updating for new version:' + ThisReleaseVersion + '" ';

     
    child_process_exec(cmdCommit, (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout);
            var cmdPush = 'git -C "' + path2Project + '" push';
            child_process_exec(cmdPush, (error, stdout, stderr) => {
                if (stdout) {
                    console.log(stdout);
                }
                if (stderr) {
                    console.log(stderr);
                }
                OnCheckIn();
            });

        }
        if (stderr) {
            console.log(stderr);
            OnCheckIn();
        }

    });
}

GetVer(function (Info) {
    console.log('Updated "package.json" file.', Info);

    CheckInGit(function(){
        console.log('This NPM has been updated!');
    });
});