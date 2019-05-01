(function () {



    /*
        When it's not a call back, it's a broadcast from
        a service. Use this a means to handle those events...                
    */
    WebApp.SocketAPI.MasterSocket.ServiceEvents = {
        "data": function (SocketData) {
            Metro.toast.create(SocketData.msg, null, null, "info");
        },
        "APIServer": function (SocketData) {
            Metro.toast.create(SocketData.msg, null, null, "info");
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
    };

    //When disconected...
    WebApp.SocketAPI.MasterSocket.Events.onclose = function () {


        Metro.dialog.create({
            title: "The websocket has closed!",
            content: "<div>If the socket died, it's best to just refresh, but you can try to just reconnect or ignore and just use REST.</div>",
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






        Metro.toast.create('Socket has disconnected', null, null, "alert");

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