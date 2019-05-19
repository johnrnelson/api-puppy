/*
    The actual data service...
    
*/
const DataActions = {



    list(RequestData, OnComplete) {

        try {
            debugger;

            var opts = {
                select: "*",
                from: "ICD10.CODES",
                sort: "CODE, CDesc",
                // limit: 10,
                // page: 1
            };

            // debugger;
            opts.limit = parseInt(RequestData.page.limit);
            opts.page = parseInt(RequestData.page.index);

        } catch (errPaging) {
            debugger;
            OnComplete({
                err: 'Page information not valid!.',
            }, null);
            return
        }


        SERVER.SqlData.ExecuteSQLPaging(opts, function (sqlError, sqlDta) {
            if (sqlError) {
                debugger;
                OnComplete(sqlError, null);
            } else {
                // debugger;
                OnComplete(null, sqlDta);
            }
        });
        // ==========


    },

    search(RequestData, OnComplete) {

        debugger;

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


        try {
            var sqlParts = [];

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
            var opts = {
                select: "*",
                from: "ICD10.CODES",
                where: whereClause,
                sort: "CODE",
                // limit: 10,
                // page: 1
            };

            // debugger;
            opts.limit = parseInt(RequestData.page.limit);
            opts.page = parseInt(RequestData.page.index);

        } catch (errPaging) {
            debugger;
            OnComplete({
                err: 'Page information not valid!.',
            }, null);
            return
        }


        SERVER.SqlData.ExecuteSQLPaging(opts, function (sqlError, sqlDta) {
            if (sqlError) {
                debugger;
                OnComplete(sqlError, null);
            } else {
                // debugger;
                OnComplete(null, sqlDta);
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
                OnComplete(result, null);

            } else {

                task(RequestData, OnComplete);
            }
        } catch (errOnAction) {
            debugger;
            OnComplete(errOnAction);
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

    }



}
exports.ServiceRequest = ServiceRequest;