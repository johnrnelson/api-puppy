/*
    Service to provide the logger info...
    
*/


const LoggerActions = {

    //get the actual sample file...
    'ReadLogs': function (RequestObj, RequestData, OnComplete) {


        if (!RequestData.type) {
            OnComplete({
                message: 'You must supply a valid type for the logs.'
            }, null);
            return;
        }


        if (!RequestData.page) {
            OnComplete({
                message: 'You must supply the paging data.'
            }, null);
            return;
        }

        if (!RequestData.date) {
            OnComplete({
                message: 'You must supply the paging data.'
            }, null);
            return;
        }


        // debugger;
        // console.log('ad date!');

        var ReadOpts = {
            type: RequestData.type,
            date: new Date(RequestData.date),
            //Standard paging...
            sort: "Created",
            limit: parseInt(RequestData.page.limit),
            page: parseInt(RequestData.page.index),

        };

        SERVER.ServiceLogger.ReadWebLog(ReadOpts, function (ReadError, LogData) {

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


                    var LogDataFilter = [];

                    for (let index = 0; index < LogData.rows.length; index++) {
                        const aLine = LogData.rows[index];
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
                        logs: LogDataFilter,
                        type: RequestData.type,
                        total: LogData.total,
                    });
                }
            }
        });








    },
    'list-log-files': function (RequestObj, RequestData, OnComplete) {
        // debugger;
        OnComplete(null, {
            msg: 'N/A'
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
                OnComplete({
                    msg: 'The action was not found! [' + RequestData.action + ']'
                }, null);

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