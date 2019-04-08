/*
    The actual data service...
    
*/


//Change this!!!
function ServiceRequest(RequestObj, RequestData, OnComplete) {

    /*
        Now if your chance to setup a default record for this service...
    */
    const result = {
        err: 'No database object view!',
        // put what you need in here to help the user debug any issues...
        debug: {
            User: RequestObj.User,
            QueryData: RequestObj.QueryData,
            QueryPath: RequestObj.QueryPath,
        }
    };


    //Debug  - Let us know what the client sent...
    // console.log(request.RequestData);/


    OnComplete(result, null);





}
exports.ServiceRequest = ServiceRequest;