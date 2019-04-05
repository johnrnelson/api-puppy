/*
    Simple manager for our threads...
*/


// debugger;


const CONFIG = {
    UseThreading: false,
};

//Keep a map of our running threads...
const WorkerThreads = [];
var TotalWorkerThreads = 0;

function NextAvailable(OnReady) {
    for (let index = 0; index < WorkerThreads.length; index++) {
        const element = WorkerThreads[index];
        if (element.isBusy == false) {
            delete element["OnFinished"];
            OnReady(element);
            return;
        }
    }
    setTimeout(function () {
        NextAvailable(OnReady);
    }, 100);
}

//Get next available thread...
exports.NextAvailable = NextAvailable;

/*
    When debugging we don't use threads so we can 
    step through the process and see whats up...
*/
function SetupWorkers(FarmOptions) {


    // ##########################################

    function startWorker(WorkerConfig, OnMessage) {


        var worker_threads = require('worker_threads');

        let w = new worker_threads.Worker(WorkerConfig.path, WorkerConfig.config);

        w.isBusy = false;

        WorkerThreads.push(w);

        w.on('message', (msg) => {
            w.isBusy = true;
            //Digest the type of callback before rasiing the alarm...
            if (msg.type == "log") {
                OnMessage(null, msg);
                w.isBusy = false;
            } else {
                if (msg.type == "RunSQL") {
                    w.isBusy = false;
                    // debugger;



                    w.OnFinished(msg);


                    // console.log('SQL Has finished...', msg);
                    // FarmOptions.OnFinished();
                }
            }

        });
        w.on('error', OnMessage);
        w.on('exit', (code) => {
            if (code != 0) {
                console.error(new Error(`Worker stopped with exit code ${code}`));
                process.exit(1);
            } else {
                console.log('FINISHED!');
            }
        });
        return w;
    }

    // ##########################################    
    var myWorker = null;

    if (FarmOptions.UseThreading) {
        CONFIG.UseThreading = true;


        const os = require("os");
        const cpus = os.cpus();
        var TotalCPUs = cpus.length;

        //Only use what we have to work with...
        if (TotalCPUs < FarmOptions.MaxThreads) {
            TotalWorkerThreads = TotalCPUs;
        } else {

            TotalWorkerThreads = FarmOptions.MaxThreads;
        }

        console.log('Found ' + TotalCPUs + ' cpus so spawning ' + TotalWorkerThreads);

        //Spin up all the threads...
        for (let counter = 0; counter < TotalWorkerThreads; counter++) {

            const myWorker = startWorker({
                path: FarmOptions.WorkerFilePath,
                config: {
                    workerData: {
                        index: counter
                    }
                }
            }, (err, result) => {
                if (err) return console.error(err);
                console.log(" **  MSG FROM THREAD ** ");
                console.log(result);
                if (result.type == "log") {
                    console.log(result.wd);
                } else {
                    console.log(' ----  WARNING  ---- ');
                    debugger;
                }
            });
        }
    } else {
        
        CONFIG.UseThreading = true;

        myWorker = {};

    }

    return myWorker;
}







/*
    Build our farm based on the options...
*/
function BuildFarm(FarmOptions, OnBuild) {

    //Are we debugging?
    let myWorker = SetupWorkers(FarmOptions);

    // We are finished building all the threads needed....
    OnBuild(WorkerThreads);
}
exports.BuildFarm = BuildFarm;

// =================================================================================

// =================================================================================