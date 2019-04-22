const topics = {
    //Get a list of sample files to work with....
    'sample-code-list': function (RequestData, OnComplete) {

        // console.log(sampleid);

        const fs = require('fs');
        const path = require('path');



        //Make sure there is not funky monkey going on with their request!!! 
        const sampleid = path.normalize(RequestData.sampleid.replace(/\./g, ''));




        const examplesFolder = path.join(SERVER.RootFolder, "/../", "APIServices", "services", sampleid, 'examples');


        // console.log(examplesFolder);

        fs.readdir(examplesFolder, function (err, items) {
            if (err) {
                debugger;

                OnComplete(sampleid + " was not found!", null);

            } else {


                const sampleFiles = [];

                for (var i = 0; i < items.length; i++) {

                    var stripFileName = items[i].replace('.json', '');

                    sampleFiles.push(stripFileName);
                }

                OnComplete(null, {
                    samples: sampleFiles
                });
            }


        });

    },
    //get the actual sample file...
    'sample-code-fetch': function (RequestData, OnComplete) {

        const fs = require('fs');
        const path = require('path');

        //Make sure there is not funky monkey going on with their request!!! 
        const sampleid = path.normalize(RequestData.sampleid.replace(/\./g, ''));


        const targetService = path.normalize(RequestData["target-service"].replace(/\./g, ''));

        const examplesFilePath = path.join(SERVER.RootFolder, "/../", "APIServices", "services", targetService, 'examples', sampleid + ".json");


        fs.readFile(examplesFilePath, 'utf8', function (err, data) {
            if (err) {
                debugger;
                console.log(RequestData);
                console.log(sampleid);
                console.log(examplesFilePath);

                OnComplete(null, {
                    err: 'Unable to get that file!',
                    file: path.basename(examplesFilePath),
                    debug: RequestData
                });
            } else {
                OnComplete(null, {
                    msg: "Have fun with this code!",
                    code: JSON.parse(data),
                });
            }
        });//End reading file...
    },
    //get the actual sample file...
    'debug-code-fetch': function (RequestData, OnComplete) {

        const fs = require('fs');
        const path = require('path');

        /* 
            Make sure there is not funky monkey going on with their request!!! 

            This means all files must go in the debug/src folder!!!!
        */
        const filepath = path.basename(RequestData.filepath);

        const examplesFilePath = path.join(SERVER.RootFolder, "/../", "docs", "debug", "src", filepath);


        fs.readFile(examplesFilePath, 'utf8', function (err, data) {
            if (err) {
                debugger;
                OnComplete(null, {
                    path: examplesFilePath,
                    err: err.message,
                    debug: RequestData
                });
            } else {
                OnComplete(null, {
                    body: data,
                });
            }
        });//End reading file...
    },
    'list-log-files': function (RequestData, OnComplete) {
        // debugger;
        SERVER.ServiceLogger.ListLogs(function (LogList) {
            OnComplete(null,{
                logs: LogList
            });
        });
    }
};


//Change this!!!
function ServiceRequest(RequestObj, RequestData, OnComplete) {


    var RequestData = RequestData.data;

    try {

        if (!RequestData) {
            RequestData = RequestObj.PathParts;
        }

        if (!RequestData.topic) {
            OnComplete('Please supply a topic!', null);
        } else {
            const activeTopic = topics[RequestData.topic];

            if (!activeTopic) {
                OnComplete('Ok now write help about this topic <b>' + RequestData.topic + '<b>! lol', null);

            } else {
                try {
                    activeTopic(RequestData, OnComplete);

                } catch (topicError) {
                    OnComplete('Error in topic!', null);
                }
            }
        }
    }
    catch (errorService) {
        OnComplete(errorService.message, null);
    }
}
exports.ServiceRequest = ServiceRequest;