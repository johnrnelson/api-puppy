#!/usr/bin/env node

"use strict";



/*
    Main entry point for the "API" service provider.

    Keep it as simple as possible. Think before
    you "npm install" anything! Please! lol  :-)  

    The only NPM at this time is "ws" @ https://github.com/websockets/ws 

    This file is large and is targeted to be broken up into modules, 
    so after node 12 it will be at the top of the list.
*/



/*
    We will need access to the disk, so load up the libraries 
    needed in nodejs and get what you need....
*/
const fs = require('fs');
const path = require('path');


const ServiceManager = require('./ServiceManager');


/*
    Basic TCP/IP server that will route requests for us...
*/
const IPC = {
    /*
        Create a basic HTTP/HTTPS server and service it's requests. Nothing fancy needed here. 

        The easier you make this code the less headaches your gonna have debugging. :-)
    */
    Start: function () {
        const http = require('http');
        const https = require("https");
        const WebSocket = require('ws');



        console.log('\r\nStart Web Servers using version:' + global.SERVER.Version + ' on ' + SERVER.Started.toLocaleString());



        SERVER.SocketBroadcast = function (MSG, Options) {
            if (Options) {

                if (Option.Exclude) {

                }
            }
            if (typeof (MSG) != "string") {
                MSG = JSON.stringify(MSG);
            }
            WebSocketServer.TotalConnectionAttempts = 0;
            if (SERVER.WebSocketHTTP) {
                SERVER.WebSocketHTTP.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(MSG);
                        WebSocketServer.TotalConnectionAttempts++;
                    }
                });
            }
            if (SERVER.WebSocketHTTPS) {
                SERVER.WebSocketHTTPS.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(MSG);
                        WebSocketServer.TotalConnectionAttempts++;
                    }
                });
            }

        };


        var httpServer = http.createServer(function (requset, response) {
            IPC.ServiceWeb(requset, response);
        });




        SERVER.WebSocketHTTP = IPC.ServiceSocket(httpServer);




        //Lets start our server..
        httpServer.listen(SERVER.Network.PORT_HTTP, SERVER.Network.IPADDRESS, function () {
            console.log("Web Server Ready : http://" + SERVER.Network.IPADDRESS + ":" + SERVER.Network.PORT_HTTP);
            IPC.StartDate = new Date();

        });





        /*
            Support SSL/HTTPS otherwise your not popular on the internet.             
        */

        try {
            var certsFolder = path.join(__dirname, "/../", "SECRET", "CERTS", SERVER.CERTS.path)

            // setup our credentials...
            const credentials = {
                key: fs.readFileSync(certsFolder + '/privkey.pem', 'utf8'),
                cert: fs.readFileSync(certsFolder + '/cert.pem', 'utf8'),
                ca: fs.readFileSync(certsFolder + '/chain.pem', 'utf8')
            };
            const httpsServer = https.createServer(credentials, function (requset, response) {
                IPC.ServiceWeb(requset, response);
            });


            SERVER.WebSocketHTTPS = IPC.ServiceSocket(httpsServer);


            //Lets start our server..
            httpsServer.listen(SERVER.Network.PORT_HTTPS, SERVER.Network.IPADDRESS, function () {
                console.log("SSL Web Server Ready : https://" + SERVER.Network.IPADDRESS + ":" + SERVER.Network.PORT_HTTPS);
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
            "Content-Type": "text/html"
        });


        /*
            Notice that it's the MIN version! 

            Just read our debug.html file and spit it back out. 
                                   
            Nice and easy...  :-)
        */
        fs.readFile(__dirname + "/../docs/debug/min/debug.html", "utf8", function (err, debugHTML) {
            if (err) {
                SendError('debug.html');
            } else {
                response.end(debugHTML);
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
            const errObj = {
                err: ErrorInformation
            };
            ResponseObject.end(JSON.stringify(errObj));
        }
    },

    /*
        Take care of our web socket via the web server...
    */
    ServiceSocket(WebServer) {
        const WebSocket = require('ws');

        const WebSocketServer = new WebSocket.Server({ server: WebServer });

        //Default to zero.. DOH!!!
        WebSocketServer.TotalConnectionAttempts = 0;

        WebSocketServer.on('connection', function connection(ws, req) {

            const ipAddress = req.connection.remoteAddress;


            WebSocketServer.clients.forEach(function each(client) {
                // console.log('Client.ID: ' + client);
                WebSocketServer.TotalConnectionAttempts++;
            });

            //Do not give away the users complete IP address over the internet!  :-)
            const displayAddress = ipAddress.split('.').slice(0, 2).join('.') + "**";


            ws.User = {
                //Using an API key or what???
                RemoteIP: ipAddress,
                ClientAgent: "WebSocket",
                SecurityLevel: 0,
                ProfileID: 0,
                Type: "Socket"
            }

            SERVER.ServiceLogger.WriteLog('Socket', {
                IP4Address: ipAddress,
                Title: 'Connect',
                Body: 'User connected to socket'
            });

            ws.on('message', function (message) {
                if (message.length > 1000) {
                    //ignore for now...   
                    /*
                          Quick log to see the history of our traffic...
                    */
                    SERVER.ServiceLogger.WriteLog('Socket', {
                        IP4Address: ipAddress,
                        Title: 'Socket Warning',
                        Body: 'Message was too long! Length:[' + message.length + ']'
                    });
                    return;
                }
                try {

                    const msgDATA = JSON.parse(message);

                    SERVER.ServiceLogger.WriteLog('Socket', {
                        IP4Address: ipAddress,
                        Title: 'Socket Message',
                        Body: msgDATA
                    });

                    ServiceManager.ServiceRequestWeb(ws, msgDATA, function (err, data) {
                        if (err) {
                            console.log(err);
                            ws.send(JSON.stringify({
                                err: 'Socket request to servce was invalid!',
                                msg: msgDATA
                            }));
                        } else {
                            //Add back the TID...
                            data.TID = msgDATA.TID;
                            ws.send(JSON.stringify(data));
                        }
                    });
                } catch (errJSON) {
                    ws.send(JSON.stringify({
                        err: 'Bad JSON!'
                    }));
                }

            });

            ws.send(JSON.stringify({
                TID: 0,
                service: 'APIServer',
                msg: 'You have connected to the web socket!'
            }));

            //Let everyone know whats up! :-)
            SERVER.SocketBroadcast({
                TID: 0, //System message   
                service: 'APIServer',
                msg: "Welcome new tester from :" + displayAddress + ". Total Connections [" +
                    WebSocketServer.TotalConnectionAttempts + "]"
            });


        });

        return WebSocketServer;

    },

    /*
        This is the actual method called when a request comes from the server. 
        
        Use this chance to build state and enforce rules that you expect all 
        of your clients to follow. 
    */
    ServiceWeb(request, response) {

        //ignore this request. We are not a real web server!
        if (request.url == "/favicon.ico") {
            response.end();
            return;
        }

        //ignore this request. We are not a real web server!
        if (request.url == "/robots.txt") {
            response.end("User-agent: * \r\n" + "Disallow: /");
            return;
        }


        //ignore this request. We are not a real web server!
        if (request.url == "/sitemap.xml") {
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
            // 'Content-Type': 'application/json',
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
            ProfileID: 0,
            Type: "HTTP"
        };


        // Use this only when you need to!!!
        // console.log('Serving User:',request.User);




        /*
            Use our little defender module to check the request
            and make sure we can do the work they want us to do.
        */
        SERVER.Defender.CheckRequest(request, response, function (CheckRequestError) {

            if (CheckRequestError) {

                response.SendError(response, CheckRequestError);
                // debugger;
                return;
            }


            try {

                var body = '';
                request.on('data', function (data) {
                    body += data;
                    /* 
                        Too much POST data, kill the connection! 
                        Don't even bother letting them know anything.
                    */
                    if (body.length > 8500) response.connection.destroy();

                    // Use this if you are more generous..  :-)
                    // if (body.length > 1e6) response.connection.destroy();
                });


                request.on('end', function () {


                    /*
                        Now work with the body of the request. 
                    */
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




                    /*
                        Add to the `RequestData` whatever they put in the
                        querystring. Object dot notation is best but of 
                        course you don't have to use it...
                    */
                    try {
                        for (var p in request.QueryData) {

                            var currentObject = request.RequestData;

                            const objValue = request.QueryData[p];
                            const parts = p.split('.');

                            for (let index = 0; index < parts.length; index++) {
                                const objName = parts[index];

                                if (!currentObject[objName]) {
                                    currentObject[objName] = {}
                                }

                                if (index == parts.length - 1) {
                                    currentObject[objName] = objValue;
                                } else {
                                    //Step to next object...
                                    currentObject = currentObject[objName];
                                }
                            }

                        }

                    } catch (QStoJSON) {

                        SERVER.ServiceLogger.WriteLog("WebErrors", {
                            IP4Address: request.connection.remoteAddress,
                            Topic: request.method,
                            Body: {
                                qryData: request.QueryData,
                                err: QStoJSON.message
                            }
                        });
                        // console.log(QStoJSON);
                        debugger;
                    }





                    //only send debug UI on emtpy request...
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





                        //Is this a multi-request????
                        if (request.RequestData.service == "*") {

                            const tasks = request.RequestData.tasks;
                            const resultObj = {};
                            var totalFinished = 0;

                            if (!tasks.length) {
                                response.SendError(response, {
                                    err: "No taskes defined!"
                                });
                                return;
                            }

                            /*
                                Go through all the tasks and execute them....
                            */
                            for (let index = 0; index < tasks.length; index++) {
                                const aSingleRequest = tasks[index];

                                //By the time you get here.. you want a true web api request...
                                ServiceManager.ServiceRequestWeb(request, aSingleRequest.request, function (ServiceError, ResponseJSON) {
                                    totalFinished++;


                                    resultObj[aSingleRequest.reqID] = ResponseJSON;

                                    if (ServiceError) {
                                        resultObj[aSingleRequest.reqID] = ServiceError;

                                    } else {
                                        resultObj[aSingleRequest.reqID] = ResponseJSON;
                                    }
                                    if (totalFinished == tasks.length) {
                                        resultObj["TotalTasks"] = totalFinished;
                                        response.end(JSON.stringify(resultObj));
                                    }

                                });

                            }

                        } else {

                            //By the time you get here.. you want a true web api request...
                            ServiceManager.ServiceRequestWeb(request, request.RequestData, function (ServiceError, ResponseJSON) {
                                if (ServiceError) {
                                    SERVER.Statistics.Services.TotalError++;


                                    response.SendError(response, ServiceError);

                                    //Send the ServiceErrorInformation instead of the bubbled up error!!!
                                    // response.SendError(response, ServiceErrorInformation);

                                } else {
                                    SERVER.Statistics.Services.TotalSuccess++;
                                    response.end(JSON.stringify(ResponseJSON));
                                }
                            });
                        }



                    }
                    catch (errEndReq) {
                        /* 
                            Use this if you are debugging from the server. It's helpful 
                            to put things in context...
                        */
                        const DebugInformation = {
                            URL: request.url,
                            err: errEndReq.message,
                            body: body
                        };
                        // console.log(DebugInformation);
                        // debugger;


                        SERVER.ServiceLogger.WriteLog("WebErrors", {
                            IP4Address: request.connection.remoteAddress,
                            Topic: request.method,
                            Body: DebugInformation
                        });

                        SERVER.Statistics.System.TotalError++;

                        //Give the client some idea of what went wrong...
                        var resp = {
                            msg: 'Error in request!',
                            err: 'Please send us a message about what went wrong.'
                        };

                        response.end(JSON.stringify(resp));






                    }//End catching an error...



                });
            }
            catch (errPUT) {

                debugger;
                /*
                      Quick log to see the history of our traffic...
                */
                SERVER.ServiceLogger.WriteLog("WebErrors", {
                    IP4Address: request.connection.remoteAddress,

                    HTTPVERB: request.method,
                    URL: request.url,
                    Body: body
                });

                //Some bad juju happend so we just pass it off to our generic error handler...
                response.SendError(response, {
                    err: errPUT.message
                });
            }//End Reading Request... 




        });//end check request... 

    }//End Service Web Request...
};



/*
    Simple stub while this file is being broken down
    into smaller modules... maybe... lol  :-)
*/
function StartServer() {


    IPC.Start();

}
exports.StartServer = StartServer;