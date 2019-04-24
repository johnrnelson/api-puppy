/*
    ServiceManager to manage the services by providing the
    payload and routing.
*/

/*
    Actually run the code needed to service the request! There may be 
    multiple requests so just do your part and call back when finished...
*/

function ServiceRequestWeb(RequestObj, RequestData, OnComplete) {
    const path = require('path');

    // We need at least a service name to work with...
    if (!RequestData.service) {
        OnComplete('No service defined! ', null);
    } else {

        var finalServicePath = "";
        var servicePath = "";

        try {
            //Do not allow ".." in the path!!!!
            servicePath = RequestData.service.replace(/\./g, '');

            finalServicePath = path.resolve(path.join(__dirname, "services", path.normalize(path.join(servicePath, 'index.js'))));

            const route2Take = require(finalServicePath);

            //Insert dagger here!!!!
            route2Take.ServiceRequest(RequestObj, RequestData, function (ServiceError, ResponseJSON) {
                if (ServiceError) {
                    const checkThisLater = finalServicePath;
                    const debuginfo = {
                        err: {
                            fnl:finalServicePath,
                            path: servicePath,
                            source: ServiceError
                        }
                    };
                    // debugger;
                    OnComplete(ServiceError, null);
                } else {
                    OnComplete(null, ResponseJSON);
                }

            });
        } catch (errinService) {
            OnComplete(null, {
                err: 'Unable to service this request!',
                service: servicePath

            });
        }

    }


}

exports.ServiceRequestWeb = ServiceRequestWeb;