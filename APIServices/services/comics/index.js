/*
    The actual data service...
    
*/
const DataActions = {


    list(RequestData, OnComplete) {

        /*
        
                
        http://feeds.feedburner.com/comiclistfeed - this week
        http://feeds.feedburner.com/ncrl - this week plain text
        http://feeds.feedburner.com/comiclistnextweek - next week
        http://feeds.feedburner.com/comiclistbeyondnextweek - extended forecast

        */
        const SQL = "SELECT * FROM comics.Comics limit 50;";
        SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
            if (SQLResult.err) {
                debugger;
                OnComplete(null, {
                    err: 'Comic service not able to understand you.',
                    debug: RequestData
                });
            } else {

                OnComplete(null, SQLResult.rows);
            }

        }); 



    },

};

function ServiceRequest(RequestObj, RequestData, OnComplete) {




    if (RequestData.action) {
        try {
            const task = DataActions[RequestData.action];
            if (!task) {
                const result = {
                    err: 'Action was not found! ' + RequestData.action,
                };
                OnComplete(null, result);
                SERVER.Statistics.Services.AddSiteMapItem("comics", "Errors");
            } else {

                SERVER.Statistics.Services.AddSiteMapItem("comics", "Success");
                task(RequestData, OnComplete);
            }
        } catch (errOnAction) {
            debugger;
            const result = {
                err: 'Error in Action! ',
            };
            SERVER.Statistics.Services.AddSiteMapItem("comics", "Errors");
            OnComplete(null, result);
        }

    } else {
        const result = {
            err: 'No database action! We are working on this though. :-)',
            // put what you need in here to help the user debug any issues...
            debug: {
                User: RequestObj.User,
                QueryData: RequestObj.QueryData,
                QueryPath: RequestObj.QueryPath,
            },
        };


        OnComplete(null, result);
        SERVER.Statistics.Services.AddSiteMapItem("comics", "Errors");
    }



}
exports.ServiceRequest = ServiceRequest;