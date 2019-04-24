/*
    Service to provide the logger info...
    
*/

const LoggerActions = {

    //get the actual sample file...
    'log-file-fetch': function (RequestObj, RequestData, OnComplete) {

        const fs = require('fs');



        SERVER.ServiceLogger.ReadLog(RequestData.logfile, function (ReadError, LogData) {

            if (ReadError) {
                OnComplete(ReadError, null);
            } else {

                if (!LogData) {
                    OnComplete({
                        file: RequestData.logfile,
                        msg: 'Unable to get the contents of that log file.'
                    }, null);
                } else {



                    const linesOfData = LogData.split('\r\n');
                    const LogDataFilter = [];

                    // console.log(RequestObj.User.RemoteIP);

                    for (let index = 0; index < linesOfData.length; index++) {
                        const aLine = linesOfData[index];
                        if (aLine) {
                            const datLine = JSON.parse(aLine);
                            if (datLine.IP4Address == RequestObj.User.RemoteIP) {
                                LogDataFilter.push(datLine);
                            }
                        }
                    }


                    OnComplete(null, {
                        file: RequestData.logfile,
                        logs: LogDataFilter
                    });
                }
            }
        });

    },
    'list-log-files': function (RequestObj, RequestData, OnComplete) {
        // debugger;
        SERVER.ServiceLogger.ListLogs(function (LogList) {
            OnComplete(null, {
                logs: LogList
            });
        });
    }
};


function ServiceRequest(RequestObj, RequestData, OnComplete) {

    var RequestData = RequestData;

    try {

        if (!RequestData) {
            RequestData = RequestObj.PathParts;
        }

        if (!RequestData.action) {
            OnComplete('Please supply a action!', null);
        } else {
            const requestedAction = LoggerActions[RequestData.action];

            if (!requestedAction) {
                OnComplete(null, {
                    msg: 'The action was not found! [' + RequestData.action + ']'
                });

            } else {
                try {
                    requestedAction(RequestObj, RequestData, OnComplete);

                } catch (topicError) {
                    OnComplete('Error in Logger Service!', null);
                }
            }
        }
    }
    catch (errorService) {
        OnComplete(errorService.message, null);
    }

}
exports.ServiceRequest = ServiceRequest;