/*
    Service to provide the logger info...
    
*/


const LoggerActions = {

    //get the actual sample file...
    'ReadLogs': function (RequestObj, RequestData, OnComplete) {
 
        debugger;

        var opts = {
            select: "*",
            from: "WebLog.EventLog",
            sort: "Created",
            // limit: 10,
            // page: 1
        };

        SERVER.ServiceLogger.ReadLog(RequestData.type, function (ReadError, LogData) {

            if (ReadError) {
                OnComplete({
                    message: 'Error reading the log file.'
                }, null);
            } else {

                if (!LogData) {
                    OnComplete({
                        file: RequestData.logfile,
                        msg: 'Unable to get the contents of that log file.'
                    }, null);
                } else {
                    // debugger;

                    var LogDataFilter = [];

                    for (let index = 0; index < LogData.length; index++) {
                        const aLine = LogData[index];
                        if (RequestObj.User.SecurityLevel < 1) {

                            if (aLine.IP4Address == RequestObj.User.RemoteIP) {
                                LogDataFilter.push(aLine);
                            }

                        } else {
                            LogDataFilter.push(aLine);
                        }
                    }


                    OnComplete(null, {
                        // file: RequestData.logfile,
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
            SERVER.Statistics.Services.AddSiteMapItem("logger", "Errors");
        } else {
            const requestedAction = LoggerActions[RequestData.action];

            if (!requestedAction) {
                OnComplete(null, {
                    msg: 'The action was not found! [' + RequestData.action + ']'
                });

            } else {
                try {
                    requestedAction(RequestObj, RequestData, OnComplete);
                    SERVER.Statistics.Services.AddSiteMapItem("logger", "Success");

                } catch (topicError) {
                    OnComplete('Error in Logger Service!', null);
                    SERVER.Statistics.Services.AddSiteMapItem("logger", "Errors");
                }
            }
        }
    }
    catch (errorService) {
        OnComplete(errorService.message, null);
        SERVER.Statistics.Services.AddSiteMapItem("logger", "Errors");
    }

}
exports.ServiceRequest = ServiceRequest;