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
            debugger;

            if(this.responseText.length){
                const srvData = JSON.parse(ServerResponse);            
                OnData(srvData);

            }else{
                OnData({
                    err:'xhr empty data!',
                    v:VERB, 
                    r:ROUTE, 
                    s:SENDMSG
                });

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
        debugger;
        xhttp.open(VERB, ROUTE, true);
        try {
            //Trying to trap the network errors?
            xhttp.send(JSON.stringify(SENDMSG));

        } catch (e) {
            debugger;
            console.log('gesh');
        }
    },
};

window.onload = function () {



    const elDisplayServerStatus = document.getElementById('DisplayServerStatus');

    if(window.location.hostname=="127.0.0.1"){
        elDisplayServerStatus.innerHTML = "Local Host!";
        return
    }   
    elDisplayServerStatus.innerHTML = "Checking...";

    // WebApp.xhr('PUT', 'http://0.0.0.0:9080/', {
    WebApp.xhr('PUT', 'http://demo.tektology.com:9080/', {
        "service": "time"
    }, function (ServerResponse) {
     
        debugger;
        console.info(ServerResponse);
    }, function (ErrorInfo) {
        debugger;
        console.info({
            err: ErrorInfo
        });
    },function(errOHMY){
        console.warn('EEEEE');
        console.warn(errOHMY);
    });

    // WebApp.Fetch('http://0.0.0.0:9080/', {
    //     "service": "time"
    // }, function (JSONData) {
    //     debugger;
    //     elDisplayServerStatus.innerHTML = "ok";


    // });

    try {

        console.info('load?')
        return;
        WebApp.Fetch('http://0.0.0.0:9080/', {
            service: 'timex',
        }).then(data => {
            console.log('Set default examples---...', data);


        }).catch(error => {
            console.warn('Error!');
            console.warn(data);
            console.error(error);
            // debugger;
        });

    } catch (errWTF) {
        console.warn('ERROR');
        console.warn(errWTF);
    }





}