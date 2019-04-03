#!/usr/bin/env node

"use strict";



/*
    Main entry point for the "/api" proxy app.

    Keep it as simple as possible. Think before
    you "npm install" anything! Please! lol  :-)  
*/


//Yes.. it's a global!!! 
global.SERVER = {
    Started: new Date(),
    RootFolder: __dirname
}

//Load up our mysql server code....
SERVER.SqlData = require('../LIB/MySQLData');


/*
    We will need access to the disk, so load up the libraries 
    needed in nodejs and get what you need....
*/
const fs = require('fs');
const path = require('path');


/*
    Basic TCP/IP server that will route requests for us...
*/
const IPC = {
    PORT: 9118,                 // Selected port because 80 and 443 are normally used for webby stuff. 
    // IPADDRESS: '127.0.0.1',  // Localhost is a safe play!    
    IPADDRESS: '0.0.0.0',       // This binds us to any NIC on the server. Becareful with this!!!

    /*
        Create a basic HTTP server and service it's requests. Nothing fancy needed here. 

        The easier you make this code the less headaches your gonna have debugging. :-)
    */
    Start: function () {
        var http = require('http');
        var server = http.createServer(function (requset, response) {
            IPC.ServiceWeb(requset, response);
        });
        //Lets start our server..
        server.listen(IPC.PORT, IPC.IPADDRESS, function () {
            console.log("Web Server Ready : http://" + IPC.IPADDRESS + ":" + IPC.PORT);
            IPC.StartDate = new Date();
        });
    },


    /*
        This is what you get from the browser when you are looking for help or 
        debugging. By the time you do this the client is assumed to be a browser.
    */
    ServeDebugAPP(request, response) {

        // Special error sending because its HTML not JSON!!
        function SendError(PageThatFailed) {
            response.end("Unable to load debug page. " + PageThatFailed + " not found!");
        }

        /*
            No matter what they submit.. if it's a GET then they are using a 
            browser. It's not smart to use GET because of the limitations of 
            query string values.  :-)
        */
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });

        /*
            Sure we are nesting calls.. maybe it looks ugly but its not blocking
            the main thread which we need to service the api requests other users
            make on the server...
        */
        fs.readFile(__dirname + "/debug/debug.html", "utf8", function (err, debugHTML) {
            if (err) {
                SendError('debug.html');

            } else {

                fs.readFile(__dirname + "/debug/client.js", "utf8", function (err, clientjs) {
                    if (err) {
                        SendError('client.js');

                    } else {

                        fs.readFile(__dirname + "/debug/API_HELP.json", "utf8", function (err, API_HELP) {
                            if (err) {
                                SendError('API_HELP.json');

                            } else {
                                fs.readFile(__dirname + "/debug/debug.css", "utf8", function (err, debugCSS) {
                                    if (err) {
                                        SendError('debug.css');

                                    } else {
                                        //




                                        //  *** SEND THE END RESPONSE!!!!
                                        const debugdata = `
window.debugdata = {
    UserInfo:${JSON.stringify(request.User)},
    NodeVersion:"${process.version}",
    port:${IPC.PORT},
    apidata:${API_HELP},
    ST: new Date('${IPC.StartDate.toLocaleString()}'),
    QueryData:${JSON.stringify(request.QueryData)}

};
`+ clientjs;

                                        //Our debug HTML is a great way to make sure our stuff works. :-)
                                        debugHTML = debugHTML.replace('//SERVER-SIDE-REPLACE!!!', debugdata);
                                        debugHTML = debugHTML.replace('/* SERVER REPLACES STYLES */', debugCSS);

                                        response.end(debugHTML);
                                        //  *** SEND THE END RESPONSE!!!!



                                    }
                                });




                            }
                        });//End API_HELP data...
                    }

                });//End Clientside javascript...
            }
        });//end debug html....

    },


    /*
        Generic error information that any service can call to for dumping
        the data back to the cient as json...
    */
    SendError(ResponseObject, ErrorInformation) {
        //be forgiving by accepting a string or an actual error object!
        if (typeof (ErrorInformation) == "string") {
            ResponseObject.end(JSON.stringify({
                err: ErrorInformation
            }));
        } else {
            ResponseObject.end(JSON.stringify(ErrorInformation));
        }
    },

    /*
        Actually run the code needed to service the request! There may be 
        multiple requests so just do your part and call back when finished...
    */
    ServiceRequest(RequestObj, RequestData, OnComplete) {


        // We need at least a service name to work with...
        if (!RequestData.service) {
            OnComplete('No service defined!', null)

        } else {

            var finalServicePath = "";

            try {
                //Do not allow ".." in the path!!!!
                const servicePath = RequestData.service.replace(/\./g, '');

                finalServicePath = path.resolve(path.join(__dirname, "services", path.normalize(path.join(servicePath, 'index.js'))));

                const route2Take = require(finalServicePath);

                //Insert dagger here!!!!
                route2Take.ServiceRequest(RequestObj, RequestData, function (ServiceError, ResponseJSON) {
                    OnComplete(ServiceError, ResponseJSON);

                });
            } catch (errinService) {
                OnComplete(errinService.message, null);
            }

        }


    },

    /*
        This is the actual method called when a request comes from the server. 
        
        Use this chance to build state and enforce rules that you expect all 
        of your clients to follow. 
    */
    ServiceWeb: function (request, response) {

        //ignore this request. We are not a real web server!
        if (request.url == "/favicon.ico") {
            response.end();
            return;
        }


        const querystring = require('querystring');
        const url = require('url');


        const RequestURLData = url.parse(request.url);

        //Any Querystring they submit gets attached to the request object as an object not a string..
        request.QueryData = querystring.parse(RequestURLData.query);
        request.QueryPath = RequestURLData.pathname;



        //Give the response and easy way out for errors...
        response.SendError = IPC.SendError;

        //This should always be local host since it's proxy from NGINX...
        request.HostOrigin = request.headers["origin"];
        request.Host = request.headers["host"];


        //Default to a basic profile. Upgrade later if you get more infor about the connection...
        request.User = {
            //Using an API key or what???
            isAuthenticated: false,

            //The proxy (nginx) will supply this as a header not the client!!!
            IPAddress: request.headers["x-real-ip"],

            RemoteIP: request.connection.remoteAddress,

            ClientAgent: request.headers["user-agent"],
            URL: request.url,
            SecurityLevel: 0,
            ProfileID: 0
        };


        // Use this only when you need to!!!
        // console.log('Serving User:',request.User);


        try {

            var body = '';
            request.on('data', function (data) {
                body += data;
                // Too much POST data, kill the connection!
                if (body.length > 1e6) response.connection.destroy();
            });


            request.on('end', function () {
                if (body == '') {
                    IPC.ServeDebugAPP(request, response);
                }
                else {
                    request.RequestData = {};

                    //We alwasy use JSON for everything.. 
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });

                    try {

                        //Special error if the JSON is not formed well...
                        try {
                            request.RequestData = JSON.parse(body);

                        } catch (badJSON) {
                            response.SendError(response, {
                                err: badJSON
                            });

                        }


                        //Is this an object or an array of object?
                        if (request.RequestData.length) {
                            function FinishedAllRequests() {

                            }
                            var totalFinished = 0;
                            const resultObj = {};
                            for (let index = 0; index < request.RequestData.length; index++) {
                                const aSingleRequest = request.RequestData[index];

                                //By the time you get here.. you want a true web api request...
                                IPC.ServiceRequest(request, aSingleRequest.request, function (ServiceError, ResponseJSON) {
                                    totalFinished++;


                                    resultObj[aSingleRequest.reqID] = ResponseJSON;

                                    if (ServiceError) {
                                        resultObj[aSingleRequest.reqID] = ServiceError
                                        // reqJSONArray.push(ServiceError);
                                        // response.SendError(response, ServiceError);

                                    } else {
                                        resultObj[aSingleRequest.reqID] = ResponseJSON
                                        // reqJSONArray.push(ResponseJSON);

                                    }
                                    if (totalFinished == request.RequestData.length) {
                                        resultObj["Total"] = totalFinished;
                                        response.end(JSON.stringify(resultObj));
                                    }

                                });

                            }
                            // response.end(JSON.stringify({
                            //     err: 'Multi Service Ready!'
                            // }));
                            // return;
                        } else {

                            //By the time you get here.. you want a true web api request...
                            IPC.ServiceRequest(request, request.RequestData, function (ServiceError, ResponseJSON) {
                                if (ServiceError) {
                                    response.SendError(response, ServiceError);
                                } else {
                                    const doh = ResponseJSON;
                                    response.end(JSON.stringify(ResponseJSON));
                                }
                            });
                        }



                    }
                    catch (errEndReq) {
                        // console.log("REQUEST ERROR!");
                        // console.log("URL", request.url);
                        // console.log(errEndReq.message);
                        // console.log(body);
                        // debugger;

                        //Give the client some idea of what went wrong...
                        var resp = {
                            msg: 'Error in request!',
                            err: errEndReq.message
                        };

                        response.end(JSON.stringify(resp));
                    }
                }
            });
        }
        catch (errPUT) {
            //Some bad juju happend so we just pass it off to our generic error handler...
            response.SendError(response, {
                err: errPUT.message
            });
        }//End Reading Request... 




    }//End Service Web Request...
};



// Async step by step becaues it's easier to debug... They say.. :-)
(async () => {

    try {
        const DATA_FOLDER = require("../LIB/DATA_FOLDER");

        /*
            Open our Mysql server...
        */
        const ConfigFileText = fs.readFileSync(DATA_FOLDER.CONFIG_INFO.SecretFolder + "mysql.json", "utf8");
        const ConfigFileData = JSON.parse(ConfigFileText);
        const PoolReq = await SERVER.SqlData.OpenPoolSync(ConfigFileData);

        if (PoolReq.err) {
            console.log(PoolReq.err);
            console.log('\r\n\t ****** Check your connection to the server!');


        } else {
            //

        }

        //Lets get this party started. :-)
        IPC.Start();


    } catch (errorNoSQLServer) {
        console.log('Critical Error!');
        console.log(errorNoSQLServer);
        process.exit(2);
    }

})();