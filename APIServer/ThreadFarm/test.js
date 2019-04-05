#!/usr/bin/env node

"use strict";

/*

*/

console.log('Server using Node Version :' + process.version);


const ThreadFarm = require('./ThreadFarm');



const FarmOptions = {
    //Path to the worker...
    WorkerFilePath: __dirname + '/ThreadWorker.js',

    UseThreading: true,

    MaxThreads: 2,

    //Finally do this...
    OnFinished() {
        console.log('done');
        process.exit(0);
    }
};


const TESTSQL = [
    {
        sql: 'select 1'
    }
];

//Start the farming...
ThreadFarm.BuildFarm(FarmOptions, function (ThreadMap) {

    //Get the next worker...
    var myWorker = ThreadFarm.NextAvailable();

    if (!myWorker) {
        console.log('No worker!');
        process.exit(1);
    }


    myWorker.postMessage({
        type: "RunSQL",
        sql: "select 1"
    });

    //Get the next worker...
    myWorker = ThreadFarm.NextAvailable();

    myWorker.postMessage({
        type: "RunSQL",
        sql: "select * from ddd"
    });
});