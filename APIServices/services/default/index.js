/*
    default service and temptate you can use.
    
*/
 
function ServiceRequest(RequestObj,RequestData,  OnComplete) {

    OnComplete(null,{
        msg:'Hi there!'
    });

}
exports.ServiceRequest = ServiceRequest;