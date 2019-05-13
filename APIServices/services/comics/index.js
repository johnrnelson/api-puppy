/*
    The actual data service...
    
*/
const DataActions = {


    list(RequestData, OnComplete) {

        const SQL = "SELECT * FROM comics.ComicPrices order by Publisher, CTitle, Cost DESC limit 250;";
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

    search(RequestData, OnComplete) {


        function stripit(StripString) {
            return StripString.replace(/[^0-9a-z]/gi, '');
        }
        if (!RequestData.qry) {
            OnComplete({
                err: 'Search service was not able to understand the "qry" object in your request.',
                debug: RequestData
            }, null);
            return;
        }
        var sql = "SELECT * FROM comics.ComicPrices where ";
        var sqlParts = [];
        // debugger;
        for (let index = 0; index < RequestData.qry.length; index++) {
            const qryObj = RequestData.qry[index];

            if ((qryObj.op == ">") ||
                (qryObj.op == "<") ||
                (qryObj.op == "*") ||
                (qryObj.op == "=")) {

                // fix the like for sql type dbs... :-)        
                if (qryObj.op == "*") {
                    qryObj.op = " like ";
                    sqlParts.push(stripit(qryObj.field) + qryObj.op + "'%" + stripit(qryObj.value) + "%'");;
                } else {
                    sqlParts.push(stripit(qryObj.field) + qryObj.op + "'" + parseFloat(qryObj.value) + "'");;
                }

            } else {
                debugger;
                OnComplete({
                    err: 'Bad qry request!.',
                }, null);
                return
            }
        }

        const whereClause = sqlParts.join(' and ');
        // debugger;
        sql += whereClause;
        SERVER.SqlData.ExecuteSQL(sql, function (SQLResult) {
            if (SQLResult.err) {
                debugger;
                OnComplete({
                    err: 'Comic service was not able to understand you.',
                    debug: RequestData
                }, null);
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