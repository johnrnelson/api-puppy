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

    MaxThreads: 3,

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
    ThreadFarm.NextAvailable(function (myWorker) {
 
        myWorker.OnFinished = function (DataResult) {
            console.info('Workiner', DataResult);
            debugger;
        };

        myWorker.postMessage({
            type: "RunSQL",
            sql: "select 1"
        });




    });

    //Get the next worker...
    ThreadFarm.NextAvailable(function (myWorker) {
        myWorker.OnFinished = function (DataResult) {
            console.info('xxxx-----', DataResult.wd.msg);
            debugger;
        };

        myWorker.postMessage({
            type: "RunSQL",
            sql: "select * from ddd"
        });
    });
});