const WebApp = {
    //Quick and easy way to get data from our api...

    /*
        Generic http request to get something from the web. Since this app is local 
        we can get from a file on the HD just as easy as we an from any other host 
        on the internet. 
    */
    xhr(VERB, ROUTE, SENDMSG, OnData, OnError) {

        var xhttp = new XMLHttpRequest();


        xhttp.onreadystatechange = function () {

            if (this.readyState == 3) {
                if (this.responseText.length) {
                    try {
                        const srvData = JSON.parse(this.responseText);
                        OnData(srvData);
                    } catch (errBadJSON) {
                        OnData({
                            err: "Bad JSON!",
                            body: this.responseText
                        });

                    }

                } else {
                    OnData({
                        err: 'xhr empty data!',
                        v: VERB,
                        r: ROUTE,
                        s: SENDMSG
                    });

                }
            }


            // if (this.readyState == 4 && this.status == 200) {
            //     try {
            //         OnData(this.responseText);
            //     } catch (badJSON) {
            //         OnData(this.responseText);
            //     }
            // }
        };
        xhttp.onerror = function () {
            if (!OnError) {
                console.warn('Error XHR:' + VERB + ':' + ROUTE + ' ST:' + xhttp.status);
                debugger;
            } else {
                OnError({
                    VERB: VERB,
                    ROUTE: ROUTE,
                });
            }
            console.log("** An error occurred during the transaction");
        };

        xhttp.open(VERB, ROUTE, true);
        
        // CORS stuff...       
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhttp.setRequestHeader("Access-Control-Allow-Headers", "*");

        try {
            //Trying to trap the network errors?
            xhttp.send(JSON.stringify(SENDMSG));

        } catch (e) {
            debugger;
            console.log('gesh');
        }
    },
    OpenSocket() {

        SocketAPI.MasterSocket.URL = "wss://demo.tektology.com";
        /*
            Overwrite the events to customize it for 
            this domain and this DEMO!
        */
        SocketAPI.MasterSocket.Events.onmessage = function (e) {
            const jsonData = JSON.parse(e.data);
            var displaymsg;
            if (jsonData.msg) {
                displaymsg = jsonData.msg;
            } else {
                displaymsg = e.data;
            }

            console.log('Web Socket Service Mesage:', jsonData);



        };

        //Once connected...
        SocketAPI.MasterSocket.Events.onopen = function () {

            console.log('Socket is open');
        };

        //After events are rewired, connect the socket...
        SocketAPI.MasterSocket.Connnect();
    }
};

window.onload = function () {



    const elDisplayServerStatus = document.getElementById('DisplayServerStatus');


    elDisplayServerStatus.innerHTML = "Checking...";






    try {

        WebApp.xhr('PUT', 'https://demo.tektology.com/', {
            "service": "time"
        }, function (ServerResponse) {
            const dispServerTime = moment(ServerResponse.dt).format('dddd, MMMM Do YYYY, h:mm:ss a');
            // elDisplayServerStatus.innerHTML = "" + dispServerTime + "";
            elDisplayServerStatus.title = dispServerTime;
            elDisplayServerStatus.innerHTML = `
                <span class="fas fa-thumbs-up"></span> It's UP!
            `;
            WebApp.OpenSocket();

        }, function (ErrorInfo) {
            console.warn("Error in request!");
            console.info(ErrorInfo);
            elDisplayServerStatus.innerHTML = `
                <span class="fas fa-thumbs-down"></span> It's down! :-(
            `;
         
        }, function (errOHMY) {
            console.warn('EEEEE');
            console.warn(errOHMY);
            debugger;
        });

    } catch (errWTF) {
        console.warn('ERROR');
        console.warn(errWTF);
    }





}