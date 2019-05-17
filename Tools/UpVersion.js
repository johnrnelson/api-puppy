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

                const JSONDATA = JSON.parse(fileContents);

                const today = new Date();
                const this_year = today.getFullYear();
                const this_month = today.getMonth() + 1;
                const this_day = today.getDate();




                const verItems = JSONDATA.version.split('.');
                const ver_year = verItems[0];
                const ver_month = verItems[1];
                const ver_day = verItems[2];


                if ((this_year != ver_year) ||
                    (this_month != ver_month) ||
                    (this_day != ver_day)
                ) {
                    debugger;
                    //set the new date!
                    verItems[0] = this_year;
                    verItems[1] = this_month;
                    verItems[2] = this_day;

                    //If new date then this is a fresh revision.
                    verItems[3] = 1;
                } else {
                    //Increment the rev number...
                    verItems[3] = parseInt(verItems[3]) + 1;

                }

                //Repair the version and save it...
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

    CheckInGit(function () {
        console.log('This NPM has been updated!');
        
        // see https://git-scm.com/book/en/v2/Git-Basics-Tagging  for more info...  :-)

        console.log('git tag -a v' + Info + ' -m "Test Tag"');
        console.log('git push origin --tags');
        console.log('git push origin --delete v'+ThisReleaseVersion);
    });
});