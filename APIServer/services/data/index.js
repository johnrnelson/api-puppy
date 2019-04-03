/*
    The actual data service...
    
*/
const MySQLDataModel = {
    test(Result, RequestData, OnComplete) {
        const SQL = "SELECT 5;";
        SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
            if (SQLResult.err) {
                Result.err = SQLResult.err.message;
                // debugger;
            } else {
                Result.data = SQLResult.rows;
            }
            OnComplete(null,Result);
        });
    },
    AllAssets(Result, RequestData, OnComplete) {
        const SQL = "SELECT * FROM `asset-inventory`.AllAssets limit 30;";
        SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
            if (SQLResult.err) {
                Result.err = SQLResult.err.message;
                // debugger;
            } else {
                Result.data = SQLResult.rows;
            }
            OnComplete(null,Result);
        });
    },
    TableTotals(Result, RequestData, OnComplete) {
        const SQL = "SELECT count(*) TotalAssets FROM `asset-inventory`.AllAssets limit 30;";
        SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
            if (SQLResult.err) {
                Result.err = SQLResult.err.message;
                // debugger;
            } else {
                Result.data = SQLResult.rows;
            }
            OnComplete(null,Result);
        });
    }
};

//Change this!!!
function ServiceRequest(RequestObj, RequestData, OnComplete) {

    /*
        Now if your chance to setup a default record for this service...
    */
    const result = {
        // put what you need in here to help the user debug any issues...
        debug: {
            User: RequestObj.User,
            QueryData: RequestObj.QueryData,
            QueryPath: RequestObj.QueryPath,
        }
    };


    //Debug  - Let us know what the client sent...
    // console.log(request.RequestData);/


    if (!RequestData.view) {
        OnComplete('No database view!', null);        
        return;
    }

    //See if we can support the view requested from the client....
    const modelViewService = MySQLDataModel[RequestData.view];
    if (!modelViewService) {
        OnComplete('View "' + RequestData.view + '" Not Found!', null);

    } else { 
        modelViewService(result, RequestData, OnComplete);
    }


}
exports.ServiceRequest = ServiceRequest;