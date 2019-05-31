(function () {



    /*
        When it's not a call back, it's a broadcast from
        a service. Use this a means to handle those events...                
    */
    WebApp.SocketAPI.MasterSocket.ServiceEvents = {
        "data": function (SocketData) {
            UIHelper.QuickAlert(SocketData.msg, "info");
        },
        "APIServer": function (SocketData) {
            UIHelper.QuickAlert(SocketData.msg, "info");
        },
    };

    /*
       Overwrite the events to customize it for 
       this domain and this DEMO!
    */
    WebApp.SocketAPI.MasterSocket.Events.onmessage = function (jsonData) {
        // const jsonData = JSON.parse(e.data);

        const srvEvt = WebApp.SocketAPI.MasterSocket.ServiceEvents[jsonData.service];
        if (srvEvt) {
            srvEvt(jsonData);
        }

        var displaymsg;

        if (jsonData.msg) {
            displaymsg = jsonData.msg;
        } else {
            displaymsg = jsonData;
        }

        if (!displaymsg) {
            debugger;
        }


        WebApp.HistoryLogger.Logger.Add({
            Type: 466,
            TID: 505,
            DT: new Date(),
            Topic: "Socket Traffic",
            Source: "Socket",
            Body: displaymsg
        });

    };

    //Once connected...
    WebApp.SocketAPI.MasterSocket.Events.onopen = function () {

        WebApp.HistoryLogger.Logger.Add({
            Type: 411,
            TID: 0,
            DT: new Date(),
            Topic: "Socket Connected!",
            Source: "Browser",
            Body: "The web socket is connected and ready to go!",
        });



        //Join channels...
        console.warn('Fix join channels!!!!!!');



        const SocketOptions = WebApp.AppPrefs.UserOptions.Socket;

        if (SocketOptions.Ignore == true) {
            //They don't want to join any channels!
            return;
        }

        const JSONPayload = {
            "event": "join",
            "topics": SocketOptions.Topics
        };

        WebApp.SocketAPI.MasterSocket.WebSocketConnection.SendData(JSONPayload, function (SckData) {

            //Remove the TID before showing it to the user...            

            console.log(JSON.stringify(SckData, null, "\t"));
        });


    };

    //When disconected...
    WebApp.SocketAPI.MasterSocket.Events.onclose = function () {


        Metro.dialog.create({
            title: "The websocket has disconnected!",
            content: "<div>It's best to just refresh, reconnect the browser, or ignore to just use REST.</div>",
            actions: [
                {
                    caption: "Reconnect Socket",
                    cls: "js-dialog-close info",
                    onclick: function () {

                        WebApp.SocketAPI.MasterSocket.Connnect();
                    }
                },
                {
                    caption: "Refresh Browser",
                    cls: "js-dialog-close alert",
                    onclick: function () {

                        window.location = window.location;
                    }
                },
                {
                    caption: "Ignore",
                    cls: "js-dialog-close"
                }
            ]
        });






        UIHelper.QuickAlert('Socket has disconnected', "alert");

        WebApp.HistoryLogger.Logger.Add({
            Type: 411,
            TID: 0,
            DT: new Date(),
            Topic: "Socket Closed!",
            Source: "Browser",
            Body: "The web socket has disconnected!",
        });

        console.info('ask to re-connect...');
    };

    //After events are rewired, connect the socket...
    WebApp.SocketAPI.MasterSocket.Connnect();







})();
