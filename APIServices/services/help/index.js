

const topics = {
    //Get a list of sample files to work with....
    'sample-code-list': function (RequestData, OnComplete) {

        // console.log(sampleid);

        const fs = require('fs');
        const path = require('path');



        //Make sure there is not funky monkey going on with their request!!! 
        const sampleid = path.normalize(RequestData.sampleid.replace(/\./g, ''));


        const examplesFolder = path.join(SERVER.RootFolder, "/../", "APIServices", "services", sampleid, 'examples');


        fs.readdir(examplesFolder, function (err, items) {
            if (err) {


                OnComplete(null, {
                    err: sampleid + " was not found!"
                });

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


    'list-log-files': function (RequestData, OnComplete) {
        // debugger;
        SERVER.ServiceLogger.ListLogs(function (LogList) {

            OnComplete(null, {
                logs: LogList
            });
        });
    },
    'validate-key': function (RequestData, OnComplete) {
        // debugger;
        const valKey = RequestData.key;

        if (valKey == "abc123") {
            //The key in the sample code!!!
            OnComplete({
                msg: 'The "abc123" key is reserved for an example!',
            }, null);
        } else {

            const isvalid = SERVER.Defender.CheckAPIKey(valKey);

            if (!isvalid) {                
                OnComplete({
                    msg: 'No key found!',
                }, null);

            } else {                
                OnComplete(null, {
                    msg: 'Key is valid!!',
                });
            }

        }


    },
    'SysInfo': function (RequestData, OnComplete) {
        // debugger;



        /// get socket users....

        const fs = require('fs');
        var TotalSocks = SERVER.WebSocketHTTP.TotalConnectionAttempts + SERVER.WebSocketHTTPS.TotalConnectionAttempts;


        var SysInfoData = {
            ProjectInfo: SERVER.ProjectInfo,
            NodeVersion: process.version,
            ServerVersion: SERVER.Version,
            ST: new Date(SERVER.Started.toLocaleString()),
            shame: SERVER.Defender.ShameList,
            SERVERStatistics: SERVER.ServiceLogger.Statistics,
            Sockets: {
                msg: 'working on this!',
                Total: TotalSocks
            }
        };

        fs.readFile(SERVER.ServicesFolder + "/API_HELP.json", "utf8", function (err, API_HELP) {
            if (err) {
                
                OnComplete({
                    msg: 'No API_HELP.json file found!',
                }, null);
            } else {
                SysInfoData.apidata = JSON.parse(API_HELP);

                
                OnComplete(null, SysInfoData);
            }
        });


    },//End SysInfo...
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
                OnComplete({
                    msg: 'The topic was not found! [' + RequestData.topic + ']'
                }, null);
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