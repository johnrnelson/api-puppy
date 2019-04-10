/*
    The actual data service...
    
*/

 
function ServiceRequest(RequestObj, RequestData, OnComplete) {

    /*
        Now if your chance to setup a default record for this service...
    */
    const result = {
        err: 'No database object to view! We are working on this though. :-)',
        // put what you need in here to help the user debug any issues...
        debug: {
            User: RequestObj.User,
            QueryData: RequestObj.QueryData,
            QueryPath: RequestObj.QueryPath,
        }
    };


    //Debug  - Let us know what the client sent...
    // console.log(request.RequestData);/


    OnComplete(null,result);





}
exports.ServiceRequest = ServiceRequest;