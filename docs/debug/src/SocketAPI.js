/*
    Simple SocketAPI code to handle the events form the socket...
*/


const SocketAPI = {
    MasterSocket: {
        URL: false,
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

            if (!SocketAPI.MasterSocket.URL) {

                if (document.location.protocol == "https:") {
                    SocketAPI.MasterSocket.URL = 'wss://' + document.location.hostname + ":" + document.location.port;
                } else {
                    SocketAPI.MasterSocket.URL = 'ws://' + document.location.hostname + ":" + document.location.port;
                }

            }
            SocketAPI.MasterSocket.WebSocketConnection = new WebSocket(SocketAPI.MasterSocket.URL)

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
