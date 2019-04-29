/*
    Simple webapp for our documentation pages to be dynamic as possible.
*/
const WebApp = {

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
        SocketAPI.MasterSocket.Events.onmessage = function (jsonData) {

            var displaymsg;
            if (jsonData.msg) {
                displaymsg = jsonData.msg;
            } else {
                displaymsg = jsonData;
            }

            // console.log('Web Socket Service Mesage:', jsonData);

            UIHelper.ShowSocketStatus();

        };

        //Once connected...
        SocketAPI.MasterSocket.Events.onopen = function () {

            console.log('Socket is open');
        };

        //After events are rewired, connect the socket...
        SocketAPI.MasterSocket.Connnect();
    }
};
const UIHelper = {
    ShowServerStatus() {

        const elServerStatus = document.getElementById('ServerStatus');

        const elDisplayServerStatus = elServerStatus.querySelector('#DisplayServerStatus')
        const elDisplayServerDate = elServerStatus.querySelector('#DisplayServerDate');
        const elDisplayServerVersion = elServerStatus.querySelector('#DisplayServerVersion');


        elDisplayServerStatus.innerHTML = "Checking...";



        try {

            WebApp.xhr('PUT', 'https://demo.tektology.com/', {
                service: 'help',
                data: {
                    topic: 'SysInfo'
                }
            }, function (ServerResponse) {

                WebApp.SysInfo = ServerResponse;

                try {
                    WebApp.SysInfo.ST = new Date(WebApp.SysInfo.ST);

                    const dispServerTime = moment(WebApp.SysInfo.ST);
                    const dispServerStarted = moment(WebApp.SysInfo.started);

                    elServerStatus.title = " " + dispServerTime.format('dddd, MMMM Do YYYY, h:mm:ss a');
                    elDisplayServerDate.innerHTML = dispServerStarted.fromNow();
                    elDisplayServerStatus.innerHTML = `
                        <span class="fas fa-thumbs-up"></span> It's UP!
                    `;
 
                    elDisplayServerVersion.innerHTML = WebApp.SysInfo.ProjectInfo.Version +
                        " " + WebApp.SysInfo.ProjectInfo.VersionName;


                    WebApp.OpenSocket();
                } catch (errSrvResponse) {
                    debugger;
                    console.warn('Error in Web Page! Please let us know about this. :-)', errSrvResponse.message);

                }


            }, function (ErrorInfo) {
                console.warn("Error in request!");
                console.info(ErrorInfo);
                elDisplayServerStatus.innerHTML = `
                    <span class="fas fa-thumbs-down"></span> It's down! :-(
                `;

            });

        } catch (errWTF) {
            console.warn('ERROR');
            console.warn(errWTF);
        }

    },
    ShowSocketStatus() {
        const elServerStatus = document.getElementById('SocketStatus');

        const elSckTotalUsers = elServerStatus.querySelector('#SckTotalUsers')
        const elSckLastUser = elServerStatus.querySelector('#SckLastUser');

        elSckTotalUsers.innerHTML = "&nbsp;" + WebApp.SysInfo.Sockets.Total;
        elSckLastUser.innerHTML = "N/A";
    }
};
window.onload = function () {

    UIHelper.ShowServerStatus();

}