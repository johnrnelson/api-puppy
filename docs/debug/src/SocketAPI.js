/*
    Simple SocketAPI code to handle the events form the socket...
*/



const SocketAPI = {
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
        MsgQue:{
            __AllMsgs:{},
            Add(TID,CallBackFunction){
                SocketAPI.MasterSocket.MsgQue.__AllMsgs[TID] = CallBackFunction;
            }
        },
        /**
         * Connects the websocket to the server.
         */
        Connnect() {
            //

            if (!SocketAPI.MasterSocket.URL) {

                if (document.location.protocol == "https:") {
                    SocketAPI.MasterSocket.URL = 'wss://' + document.location.hostname + ":" + document.location.port;
                } else {
                    SocketAPI.MasterSocket.URL = 'ws://' + document.location.hostname + ":" + document.location.port;
                }

            }
            SocketAPI.MasterSocket.WebSocketConnection = new WebSocket(SocketAPI.MasterSocket.URL);





            SocketAPI.MasterSocket.WebSocketConnection.SendData = function (JSONData, OnResult) {
                if (typeof (JSONData) == "string") {
                    JSONData = JSON.parse(JSONData);
                }
                if (!JSONData.TID) {
                    JSONData.TID = "Evt-" + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }

                if (OnResult) {
                    //
                    SocketAPI.MasterSocket.MsgQue.Add(JSONData.TID,OnResult);
                }

                SocketAPI.MasterSocket.WebSocketConnection.send(JSON.stringify(JSONData));


            };





            /*
                Wire up the events...
            */
            SocketAPI.MasterSocket.WebSocketConnection.onclose = function (evt) {
                SocketAPI.MasterSocket.Events.onclose(evt);
            };
            SocketAPI.MasterSocket.WebSocketConnection.onerror = error => {
                SocketAPI.MasterSocket.Events.onmessage(error);
            };
            SocketAPI.MasterSocket.WebSocketConnection.onmessage = e => {
                /*
                    Make sure you use TID to setup the call backs...
                */
                const jsonData = JSON.parse(e.data);
                if(jsonData.TID){
                    //Make the call back...
                    SocketAPI.MasterSocket.MsgQue.__AllMsgs[jsonData.TID](jsonData);

                    //Delete it from the que since we are done with it...
                    delete SocketAPI.MasterSocket.MsgQue.__AllMsgs[jsonData.TID];
                }else{
                    //No TID then it's not a call back so just process the message...
                    SocketAPI.MasterSocket.Events.onmessage(jsonData);
                }
            };
            SocketAPI.MasterSocket.WebSocketConnection.onopen = () => {
                SocketAPI.MasterSocket.Events.onopen();
            };



        }
    },

};



function TESTME(){

    
    console.info('ok');
    debugger;
    
    import sckTest from "https://api-puppy.johnrnelson.com/debug/src/SocketModule.js"
    console.log(sckTest);

    
}
TESTME();