/*
    Example of a thread class...
*/

const worker_threads = require('worker_threads');

//Assume false....
var isThreaded = false;
var StandAlone = false;


//If we are debugging or calling this from command line...
if (require.main === module) {
    StandAlone = true;
} else {
    StandAlone = false;
}


/*  
    Put all the actions this thread will support in this
    actions list. Do not nest!!!!
*/
const ObjectActions = {
    Config() {

    },
    RunSQL(MsgData) {
        //Runn this sql...
        setTimeout(() => {

            PostMSG('RunSQL', {
                id: worker_threads.threadId,
                wd: {
                    msg: MsgData
                }
            });
        }, 3000);

    }
};


// Send a message to the main thread.
function PostMSG(MsgType, MsgData) {

    if (!MsgType) {
        MsgType = "error"
    }
    //Use this later, but enforce it now...
    MsgData.type = MsgType;
    MsgData.isThreaded = isThreaded;

    worker_threads.parentPort.postMessage(MsgData);

}

worker_threads.parentPort.on('message', (MsgData) => {
    //Can't see this!!!!
    // console.log(MsgData);
    debugger;

    const action = ObjectActions[MsgData.type];


    if (!MsgData.type) {

        PostMSG('log', {
            id: worker_threads.threadId,
            error: {
                msg: 'unknown message type',
                msgdata: MsgData
            }
        });
        return;
    } else {

        action(MsgData);
    }


});


PostMSG('log', {
    msg: 'Thread is loaded and ready.',
    tid: worker_threads.threadId,
    wd: worker_threads.workerData
});