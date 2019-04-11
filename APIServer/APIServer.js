#!/usr/bin/env node

"use strict";



/*
    Main entry point for the "API" service provider.

    Keep it as simple as possible. Think before
    you "npm install" anything! Please! lol  :-)  
*/


//Yes.. it's a global!!! 
global.SERVER = {
    Version: '1.01b',
    CERTS: {
        //Change this for your own domain!
        path: 'demo.tektology.com'
    },
    Started: new Date(),
    RootFolder: __dirname
}


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
    // Selected port because 80 and 443 are normally used for webby stuff. 
    PORT_HTTP: 9080,
    PORT_HTTPS: 9443,
    // IPADDRESS: '127.0.0.1',  // Localhost is a safe play!    
    IPADDRESS: '0.0.0.0',       // This binds us to any NIC on the server. Becareful with this!!!

    /*
        Create a basic HTTP/HTTPS server and service it's requests. Nothing fancy needed here. 

        The easier you make this code the less headaches your gonna have debugging. :-)
    */
    Start: function () {
        const http = require('http');
        const https = require("https");


        console.log('\r\nStart Web Servers using version:' + global.SERVER.Version + ' on ' + SERVER.Started.toLocaleString());


        var httpServer = http.createServer(function (requset, response) {
            IPC.ServiceWeb(requset, response);
        });
        //Lets start our server..
        httpServer.listen(IPC.PORT_HTTP, IPC.IPADDRESS, function () {
            console.log("Web Server Ready : http://" + IPC.IPADDRESS + ":" + IPC.PORT_HTTP);
            IPC.StartDate = new Date();
        });







        /*
            Support SSL/HTTPS otherwise your not popular on the internet.             
        */

        try {
            var certsFolder = __dirname + "/../CERTS/" + SERVER.CERTS.path;

            // setup our credentials...
            const credentials = {
                key: fs.readFileSync(certsFolder + '/privkey.pem', 'utf8'),
                cert: fs.readFileSync(certsFolder + '/cert.pem', 'utf8'),
                ca: fs.readFileSync(certsFolder + '/chain.pem', 'utf8')
            };
            const httpsServer = https.createServer(credentials, function (requset, response) {
                IPC.ServiceWeb(requset, response);
            });


            //Lets start our server..
            httpsServer.listen(IPC.PORT_HTTPS, IPC.IPADDRESS, function () {
                console.log("SSL Web Server Ready : https://" + IPC.IPADDRESS + ":" + IPC.PORT_HTTPS);
                IPC.StartDate = new Date();
            });


        } catch (errCerts) {
            console.log('Error reading cert files.\r\n');
            console.log(errCerts.message);
        }

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
            "Content-Type": "text/html",
            //CSP Policy
            //  "Content-Security-Policy": "default-src http:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'",



        });



        /*
            Sure we are nesting calls.. maybe it looks ugly but its not blocking
            the main thread which we need to service the api requests other users
            make on the server...
        */
        fs.readFile(__dirname + "/debug/min/debug.html", "utf8", function (err, debugHTML) {
            if (err) {
                SendError('debug.html');

            } else {

                fs.readFile(__dirname + "/debug/API_HELP.json", "utf8", function (err, API_HELP) {
                    if (err) {
                        SendError('API_HELP.json');

                    } else {


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
`;

                        //Our debug HTML is a great way to make sure our stuff works. :-)
                        debugHTML = debugHTML.replace('//SERVER-SIDE-REPLACE!!!', debugdata);


                        response.end(debugHTML);
                        //  *** SEND THE END RESPONSE!!!!



                    }
                });//End API_HELP data...

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
            OnComplete('No service defined! ', null);
        } else {

            var finalServicePath = "";

            try {
                //Do not allow ".." in the path!!!!
                const servicePath = RequestData.service.replace(/\./g, '');

                finalServicePath = path.resolve(path.join(__dirname, "services", path.normalize(path.join(servicePath, 'index.js'))));

                const route2Take = require(finalServicePath);

                //Insert dagger here!!!!
                route2Take.ServiceRequest(RequestObj, RequestData, function (ServiceError, ResponseJSON) {
                    if (ServiceError) {
                        debugger;
                    }
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


        // console.log(request.QueryPath, ' --- ', request.method.toUpperCase());


        //We alwasy use JSON for everything.. 
        response.writeHead(200, {
            'Content-Type': 'application/json',
            //CSP Policy
            // "Content-Security-Policy": "default-src http:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'",

            //CORB...
            "Access-Control-Allow-Origin": "*",
            // GET,PUT,POST,DELETE
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
            // "Access-Control-Allow-Headers": "Content-Type, Authorization"
        });

        if (request.method.toUpperCase() == "OPTIONS") {
            // console.log(request.headers);
            response.end("");
            return;
        }


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
                // if (body.length > 1e6) response.connection.destroy();
                if (body.length > 8500) response.connection.destroy();
            });


            request.on('end', function () {

                /*
                      Quick log to see the history of our traffic...
                  */
                //    SERVER.Started 
                const ipLogItem = "@" + SERVER.Started.toISOString() + " " +
                    request.connection.remoteAddress +
                    "[" + request.method + "]" +
                    "" + request.url + " ** " + body + "\r\n";

                fs.appendFile(__dirname + '/../SECRET/IPLog-' + SERVER.Started.toLocaleTimeString().replace(/\s/g, '') + '.log', ipLogItem, function (err) {
                    if (err) throw err;

                });



                if (body == '') {
                    request.RequestData = {};
                }
                else {
                    try {

                        request.RequestData = JSON.parse(body);

                    } catch (badJSON) {
                        //Special error if the JSON is not formed well...
                        response.SendError(response, {
                            err: badJSON
                        });
                        return;
                    }
                }


                //only send debug on emtpy request...
                if ((request.url == "/") && (!request.RequestData.service)) {
                    IPC.ServeDebugAPP(request, response);
                    return;
                }


                try {

                    /*
                        Use the path to figure out what the user wants if they didn't
                        use the body to post JSON to...
                    */
                    request.PathParts = request.QueryPath.split('/').filter(Boolean);
                    if (request.PathParts.length) {
                        //Set this for the basic routing of the module...
                        request.RequestData.service = request.PathParts[0];

                    }

                    const ServiceErrorInformation = {
                        msg: "Service Error!",
                        service: request.RequestData.service
                    };



                    //Is this a multi-request????
                    if (request.RequestData.service == "*") {

                        const tasks = request.RequestData.tasks;
                        const resultObj = {};
                        var totalFinished = 0;

                        for (let index = 0; index < tasks.length; index++) {
                            const aSingleRequest = tasks[index];

                            //By the time you get here.. you want a true web api request...
                            IPC.ServiceRequest(request, aSingleRequest.request, function (ServiceError, ResponseJSON) {
                                totalFinished++;


                                resultObj[aSingleRequest.reqID] = ResponseJSON;

                                if (ServiceError) {
                                    resultObj[aSingleRequest.reqID] = ServiceErrorInformation;

                                } else {
                                    resultObj[aSingleRequest.reqID] = ResponseJSON
                                    // reqJSONArray.push(ResponseJSON);

                                }
                                if (totalFinished == tasks.length) {
                                    resultObj["TotalTasks"] = totalFinished;
                                    response.end(JSON.stringify(resultObj));
                                }

                            });

                        }

                    } else {

                        //By the time you get here.. you want a true web api request...
                        IPC.ServiceRequest(request, request.RequestData, function (ServiceError, ResponseJSON) {
                            if (ServiceError) {
                                //Don't leak this!! lol
                                // response.SendError(response, ServiceError);
                                response.SendError(response, ServiceErrorInformation);
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
                    debugger;

                    //Give the client some idea of what went wrong...
                    var resp = {
                        msg: 'Error in request!',
                        err: errEndReq.message
                    };

                    response.end(JSON.stringify(resp));
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


/*
    Save time by just compiling the debug files.. You can always make this a 
    task or use grunt or whatever ya like... :-)
*/
function CompileDebugFiles(OnComplete) {

    const path2debug = __dirname + "/debug/";

    /*
        Sure we are nesting calls.. maybe it looks ugly but its not blocking
        the main thread which we need to service the api requests other users
        make on the server...
    */
    fs.readFile(path2debug + "src/debug.html", "utf8", function (err, debugHTML) {
        if (err) {
            console.log('debug.html', err);

        } else {

            fs.readFile(path2debug + "src/client.js", "utf8", function (err, clientjs) {
                if (err) {
                    console.log('client.js', err);

                } else {
                    fs.readFile(path2debug + "src/debug.css", "utf8", function (err, debugCSS) {
                        if (err) {
                            console.log('debug.css', err);

                        } else {
                            //


                            debugHTML = debugHTML.replace('/* SERVER REPLACES STYLES */', debugCSS);
                            debugHTML = debugHTML.replace('/* SERVER REPLACES SCRIPTS */', clientjs);



                            fs.writeFileSync(path2debug + 'min/debug.html', debugHTML, { flag: 'w' });

                            OnComplete(null, 'Client HTML ready for requests...');

                            // response.end(debugHTML);
                            //  *** SEND THE END RESPONSE!!!!



                        }
                    });

                }

            });//End Clientside javascript...
        }
    });//end debug html....


}


/*
    Compile the debug files to make life simple by staticly serving what you 
    can and dynamicly adujusting what ya need. :-)   lol
*/
CompileDebugFiles(function (err, DebugFileStatus) {
    if (err) {
        console.log(err);

    } else {
        // console.log(DebugFileStatus);

        //Lets get this party started. :-)
        IPC.Start();
    }
});
