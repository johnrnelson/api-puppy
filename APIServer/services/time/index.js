/*
    Simple time service...
    
*/
 
function ServiceRequest(RequestObj,RequestData,  OnComplete) {
    
    const rightNOW = new Date();    

    OnComplete(null,{
        dt:rightNOW.toISOString()
    });

}
exports.ServiceRequest = ServiceRequest;