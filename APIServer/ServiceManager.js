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


    //If this is a stateless connection, check the api key!!!!
    if (RequestObj.User.Type == "HTTP") {
        //Check the api key...
        if (RequestData.APIKEY) {
            // console.log('CHECK--', RequestObj.User, RequestData.APIKEY);
            if (SERVER.Defender.CheckAPIKey(RequestData.APIKEY)) {
                RequestObj.User.SecurityLevel = 100;
            }
        }

    }

    // We need at least a service name to work with...
    if (!RequestData.service) {
        OnComplete('No service defined! ', null);
    } else {

        var finalServicePath = "";
        var servicePath = "";

        try {
            //Do not allow ".." in the path!!!!
            // servicePath = RequestData.service.replace(/\./g, '');
            servicePath = RequestData.service;
 

            finalServicePath = path.resolve(path.join(SERVER.ServicesFolder, "services", path.normalize(path.join(servicePath, 'index.js'))));

            const route2Take = require(finalServicePath);

            //Insert dagger here!!!!
            route2Take.ServiceRequest(RequestObj, RequestData, function (ServiceError, ResponseJSON) {
                if (ServiceError) {
                    const checkThisLater = finalServicePath;
                    const debuginfo = {
                        err: {
                            fnl: finalServicePath,
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


            /*
                A major error in the service has happened so 
                send a quick message to our logger before 
                we update the user....
            */
            SERVER.ServiceLogger.WriteLog("WebErrors", {
                IP4Address: RequestObj.User.RemoteIP,
                Topic: RequestObj.method,
                Body: RequestData
            });




            OnComplete({
                err: 'Unable to service this request!',
                service: servicePath

            }, null);
        }

    }


}

exports.ServiceRequestWeb = ServiceRequestWeb;