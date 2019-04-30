/*
    Simple WebApp.SocketAPI code to handle the events form the socket...
*/



// const SWebApp.SocketAPI = {
WebApp.SocketAPI = {
    MasterSocket: {
        URL: false,
        //Make sure you overwrite the events in your own script!
        Events: {
            onmessage() {
                console.info('Msg from Client');
            },
            onopen() {
                console.info('Socket was opened but not handeled by the client...');
            },
            onerror(error) {
                console.info('WebSocket error:', error);
            },
            onclose() {
                console.info('WebSocket has closed!');
            }
        },
        MsgQue: {
            __AllMsgs: {},
            Add(TID, CallBackFunction) {
                WebApp.SocketAPI.MasterSocket.MsgQue.__AllMsgs[TID] = CallBackFunction;
            }
        },
        /**
         * Connects the websocket to the server.
         */
        Connnect() {
            //

            if (!WebApp.SocketAPI.MasterSocket.URL) {

                if (document.location.protocol == "https:") {
                    WebApp.SocketAPI.MasterSocket.URL = 'wss://' + document.location.hostname + ":" + document.location.port;
                } else {
                    WebApp.SocketAPI.MasterSocket.URL = 'ws://' + document.location.hostname + ":" + document.location.port;
                }

            }
            WebApp.SocketAPI.MasterSocket.WebSocketConnection = new WebSocket(WebApp.SocketAPI.MasterSocket.URL);





            WebApp.SocketAPI.MasterSocket.WebSocketConnection.SendData = function (JSONData, OnResult) {
                if (typeof (JSONData) == "string") {
                    JSONData = JSON.parse(JSONData);
                }
                if (!JSONData.TID) {
                    JSONData.TID = "Evt-" + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }

                if (OnResult) {
                    //
                    WebApp.SocketAPI.MasterSocket.MsgQue.Add(JSONData.TID, OnResult);
                }

                WebApp.SocketAPI.MasterSocket.WebSocketConnection.send(JSON.stringify(JSONData));


            };





            /*
                Wire up the events...
            */
            WebApp.SocketAPI.MasterSocket.WebSocketConnection.onclose = function (evt) {
                WebApp.SocketAPI.MasterSocket.Events.onclose(evt);
            };
            WebApp.SocketAPI.MasterSocket.WebSocketConnection.onerror = error => {
                WebApp.SocketAPI.MasterSocket.Events.onmessage(error);
            };
            WebApp.SocketAPI.MasterSocket.WebSocketConnection.onmessage = e => {
                /*
                    Make sure you use TID to setup the call backs...
                */
                const jsonData = JSON.parse(e.data);
                if (jsonData.TID) {
                    //Make the call back...
                    WebApp.SocketAPI.MasterSocket.MsgQue.__AllMsgs[jsonData.TID](jsonData);

                    //Delete it from the que since we are done with it...
                    delete WebApp.SocketAPI.MasterSocket.MsgQue.__AllMsgs[jsonData.TID];
                } else {
                    //No TID then it's not a call back so just process the message...
                    WebApp.SocketAPI.MasterSocket.Events.onmessage(jsonData);
                }
            };
            WebApp.SocketAPI.MasterSocket.WebSocketConnection.onopen = () => {
                WebApp.SocketAPI.MasterSocket.Events.onopen();
            };



        }
    },

};


