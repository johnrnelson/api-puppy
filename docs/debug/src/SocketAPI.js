/*
    Simple SocketAPI code to handle the events form the socket...
*/
 

const SocketAPI = {
    MasterSocket: {
        //Make sure you overwrite the events in your own script!
        Events: {
            onmessage() {

            },
            onopen() {
                console.info('Socket was opened but not handeled by the client...');
            }
        },
        Connnect() {
            //



            // WEBSOCKET
            var SocketURL;
            if (document.location.protocol == "https:") {
                SocketURL = 'wss://' + document.location.hostname + ":" + document.location.port;
            } else {
                SocketURL = 'ws://' + document.location.hostname + ":" + document.location.port;
            }
            SocketAPI.MasterSocket.WebSocketConnection = new WebSocket(SocketURL)

            SocketAPI.MasterSocket.WebSocketConnection.onerror = error => {
                console.log(`WebSocket error: ${error}`)
            };
            SocketAPI.MasterSocket.WebSocketConnection.onmessage = e => {
                SocketAPI.MasterSocket.Events.onmessage(e);
            };
            SocketAPI.MasterSocket.WebSocketConnection.onopen = () => {
                SocketAPI.MasterSocket.Events.onopen();

                //An example...
                /*
                SocketAPI.MasterSocket.WebSocketConnection.send(JSON.stringify({
                    service: "time"
                }));
                */

            };






        }
    },

};
