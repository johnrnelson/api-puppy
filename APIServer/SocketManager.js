/*

*/
const WebSocket = require('ws');
function ServiceSocket(WebServer) {
    // const WebSocket = require('ws');

    const WebSocketServer = new WebSocket.Server({ server: WebServer });

    //Default to zero.. DOH!!!
    WebSocketServer.TotalConnectionAttempts = 0;

    WebSocketServer.on('connection', function connection(ws, req) {

        const ipAddress = req.connection.remoteAddress;

        WebSocketServer.TotalConnectionAttempts = 0;

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

        SERVER.ServiceLogger.WriteWebLog('Socket', {
            IP4Address: ipAddress,
            Topic: 'Connect',
            Body: 'User connected to socket'
        });

        ws.on('message', function (message) {
            if (message.length > 1000) {
                //ignore for now...   
                /*
                      Quick log to see the history of our traffic...
                */
                SERVER.ServiceLogger.WriteWebLog('Socket', {
                    IP4Address: ipAddress,
                    Topic: 'Socket Warning',
                    Body: 'Message was too long! Length:[' + message.length + ']'
                });
                return;
            }
            try {

                const msgDATA = JSON.parse(message);

                SERVER.ServiceLogger.WriteWebLog('Socket', {
                    IP4Address: ipAddress,
                    Topic: 'Socket Message',
                    Body: msgDATA
                });

                ServiceManager.ServiceRequestWeb(ws, msgDATA, function (err, data) {
                    if (!msgDATA.service) {
                        msgDATA.service = "Not Available";
                    }
                    if (err) {



                        SERVER.ServiceLogger.Statistics.Services.AddSiteMapItem(msgDATA.service, "SocketError");
                        ws.send(JSON.stringify({
                            err: 'Socket request to servce was invalid!',
                            msg: msgDATA
                        }));
                    } else {

                        SERVER.ServiceLogger.Statistics.Services.AddSiteMapItem(msgDATA.service, "SocketSuccess");
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

}
exports.ServiceSocket = ServiceSocket;



/*
    This is the master broadcast function. It uses 
    both web server sockets (HTTP/s) unless 
    exluded..
*/
SERVER.SocketBroadcast = function (MSG, Options) {
    if (Options) {

        if (Option.Exclude) {
            //Not using yet?
        }
    }
    if (typeof (MSG) != "string") {
        MSG = JSON.stringify(MSG);
    }


    if (SERVER.WebSocketHTTP) {
        SERVER.WebSocketHTTP.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(MSG);
                SERVER.WebSocketHTTP.TotalConnectionAttempts++;
            }
        });
    }
    if (SERVER.WebSocketHTTPS) {
        SERVER.WebSocketHTTPS.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(MSG);
                SERVER.WebSocketHTTPS.TotalConnectionAttempts++;
            }
        });
    }

};
