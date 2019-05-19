/*
    The actual data service...
    
*/
const DataActions = {



    list(RequestData, OnComplete) {
        var opts = false;

        try {
            // debugger;
            if (RequestData.target == "icd10") {
                opts = {
                    select: "*",
                    from: "healthcare.ICD10Codes",
                    sort: "CODE, CDesc",
                    // limit: 10,
                    // page: 1
                };
            }
            if (RequestData.target == "cpt") {
                opts = {
                    select: "*",
                    from: "healthcare.CPTCodes",
                    sort: "CODE, CDesc",
                    // limit: 10,
                    // page: 1
                };
            }


            if (!opts) {
                OnComplete({
                    err: 'Unable to set the options. Please check your target.',
                }, null);
                return
            }

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

        // debugger;

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
        if (!RequestData.target) {
            OnComplete({
                err: 'Please put in a target for your request.',
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
                        err: 'Bad qry request! Check your operator.',
                    }, null);
                    return
                }
            }


            const whereClause = sqlParts.join(' and ');
            var opts = false;

            if (RequestData.target == "icd10") {
                opts = {
                    select: "*",
                    from: "healthcare.ICD10Codes",
                    where: whereClause,
                    sort: "CODE, CDesc",
                };
            }
            if (RequestData.target == "cpt") {
                opts = {
                    select: "*",
                    from: "healthcare.CPTCodes",
                    where: whereClause,
                    sort: "CODE, CDesc",
                    // limit: 10,
                    // page: 1
                };
            }


            if (!opts) {
                OnComplete({
                    err: 'Unable to set the options. Please check your target.',
                }, null);
                return
            }

            // var opts = {
            //     select: "*",
            //     from: "ICD10.CODES",
            //     where: whereClause,
            //     sort: "CODE",
            //     // limit: 10,
            //     // page: 1
            // };

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