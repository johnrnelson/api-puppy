/*
    Simple wrapper to test the API using the browser.

    Adding in whatever you can to help the user actually use the API!
*/

const WebApp = {
    /*
        Quick and easy way to get data from our api...
        Ex: WebApp.Fetch
    */
    Fetch(data = {}) {
        const url = document.URL + '';

        // console.info('Add key to Data->',WebApp.AppPrefs.UserOptions.APIKEY);

        //Allways add the APIKEY to outbound requests to the server...
        data.APIKEY = WebApp.AppPrefs.UserOptions.APIKEY;


        return fetch(url, {
            method: "PUT", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "omit", // include, *same-origin, omit

            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        }).then(response => response.json()); // parses JSON response into native Javascript objects 

    },
    GetHelpFile(FilePath, OnFetch) {
        // WebApp.GetHelpFile('',function(){});

        WebApp.Fetch({
            service: 'help',
            data: {
                topic: 'debug-code-fetch',
                filepath: FilePath
            }
        }).then(data => {
            if (data.err) {
                console.warn(data.err);
            } else {
                OnFetch(data);
            }


        }).catch(error => {
            console.warn('Error!');
            console.error(error);
            // debugger;
        });

    },

    //Your local app preferences...
    AppPrefs: {
        UserOptions: {
            APIKEY: '',
            UserID: '',
            TargetAPI: {
                url: document.URL,
                opts: {
                    favor: 'put'
                }
            }
        },
    }
};


if (localStorage) {
    const UserOptionsText = localStorage.getItem('UserOptions');

    if (UserOptionsText) {
        console.info('Reloading App options....');
        WebApp.AppPrefs.UserOptions = JSON.parse(UserOptionsText);
    } else {
        console.info('Storing (local) App options....');
        localStorage.setItem("UserOptions", JSON.stringify(WebApp.AppPrefs.UserOptions));
    }

} else {
    alert('No Local Storage!');
}


/* 
    Go grab our styles using the API to show an example of
    another way to use it. Of course you don't want to 
    actually get your CSS files this way, but it's yet
    another example of how to use a web API...
*/
WebApp.GetHelpFile('debug.css', function (filecontents) {
    const CSSFile = document.createElement("style");
    CSSFile.type = "text/css";
    CSSFile.innerHTML = filecontents.body;
    document.head.appendChild(CSSFile);
});


/*
    Load our debugger ui supporting javascript...
*/
WebApp.GetHelpFile('DebuggerUI.js', function (filecontents) {
    const srcScript = document.createElement("script");
    srcScript.innerHTML = filecontents.body;
    document.head.appendChild(srcScript);
});




/*
    History Logger UI supporting javascript...
*/
WebApp.GetHelpFile('HistoryLogger.js', function (filecontents) {
    const srcScript = document.createElement("script");
    srcScript.innerHTML = filecontents.body;
    document.head.appendChild(srcScript);
    HistoryLogger.Calendar.AddControl();
});




//Stuff our help display since it's so big and the least dynamic.. :-)
WebApp.GetHelpFile('HelpDisplay.html', function (filecontents) {
    document.getElementById("TabMain").innerHTML = filecontents.body;
    //Now show the sys info in the main display...

});




/*
    After page has loaded, you can be sure that everything you need
    is already loaded and ready to go...
*/
window.onload = function () {

    /* 
        Extra Helper code...
    */
    WebApp.GetHelpFile('UIHelper.js', function (filecontents) {

        // debugger;
        window.eval(filecontents.body);



        WebApp.Fetch({
            service: 'help',
            data: {
                topic: 'SysInfo'
            }
        }).then(data => {
            if (data.err) {
                console.warn(data.err.msg);
                debugger;



            } else {

                WebApp.SysInfo = data;
                WebApp.SysInfo.ST = new Date(WebApp.SysInfo.ST);



                // debugger;
                WebApp.AppPrefs.Title = WebApp.SysInfo.ProjectInfo.Title;

                document.title = WebApp.AppPrefs.Title;

                //Setup our UI parts...
                UIHelper.FillSideBar();

                //Setup all of our ace editors...
                UIHelper.Ace.BuildAceControls();

                UIHelper.AppPrefs.ShowPrefs();


                UIHelper.SetSysInfo();

                // console.log('CHECK THIS-->',WebApp.SysInfo);



                (function () {

                    // **********



                    const chartColors = {
                        red: 'rgb(255, 99, 132)',
                        orange: 'rgb(255, 159, 64)',
                        yellow: 'rgb(255, 205, 86)',
                        green: 'rgb(75, 192, 192)',
                        blue: 'rgb(54, 162, 235)',
                        purple: 'rgb(153, 102, 255)',
                        grey: 'rgb(201, 203, 207)'
                    };




                    var MONTHS = ['HTTP/S', 'System'];
                    var color = Chart.helpers.color;
                    var barChartData = {
                        labels: ['HTTP/S', 'System'],
                        datasets: [{
                            label: 'Errors',
                            backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
                            borderColor: chartColors.red,
                            borderWidth: 1,
                            data: [
                                (-1) * WebApp.SysInfo.SERVERStatistics.Services.TotalError,
                                (-1) * WebApp.SysInfo.SERVERStatistics.System.TotalError
                            ]
                        }, {
                            label: 'Success',
                            backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
                            borderColor: chartColors.blue,
                            borderWidth: 1,
                            data: [
                                WebApp.SysInfo.SERVERStatistics.Services.TotalSuccess,
                                WebApp.SysInfo.SERVERStatistics.System.TotalSuccess

                            ]
                        }]

                    };

                    var ctx = document.getElementById('canvas').getContext('2d');
                    window.myBar = new Chart(ctx, {
                        type: 'bar',
                        data: barChartData,
                        options: {
                            responsive: true,
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'API Success/Error Rates'
                            }
                        }
                    });

                    // **********
                })();

            }//end if no error...

        });//end SysInfo call....




        /*
            Use the help service to get the Socket API code. 
            It's just another way to use the API and shows
            how you can do this own a seperate domain and 
            still get the updates...
        */
        WebApp.GetHelpFile('SocketAPI.js', function (filecontents) {
            const srcSocketAPI = document.createElement("script");
            srcSocketAPI.innerHTML = filecontents.body;
            document.head.appendChild(srcSocketAPI);

            /*
                When it's not a call back, it's a broadcast from
                a service. Use this a means to handle those events...                
            */
            SocketAPI.MasterSocket.ServiceEvents = {
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
            SocketAPI.MasterSocket.Events.onmessage = function (jsonData) {
                // const jsonData = JSON.parse(e.data);

                const srvEvt = SocketAPI.MasterSocket.ServiceEvents[jsonData.service];
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


                HistoryLogger.Logger.Add({
                    Type: 466,
                    TID: 505,
                    DT: new Date(),
                    Topic: "Socket Traffic",
                    Source: "Socket",
                    Body: displaymsg
                });

            };

            //Once connected...
            SocketAPI.MasterSocket.Events.onopen = function () {

                HistoryLogger.Logger.Add({
                    Type: 411,
                    TID: 0,
                    DT: new Date(),
                    Topic: "Socket Connected!",
                    Source: "Browser",
                    Body: "The web socket is connected and ready to go!",
                });
            };

            //When disconected...
            SocketAPI.MasterSocket.Events.onclose = function () {

                Metro.toast.create('Socket has disconnected', null, null, "alert");

                HistoryLogger.Logger.Add({
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
            SocketAPI.MasterSocket.Connnect();
        });




        HistoryLogger.Logger.Add({
            TID: 0,
            Type: 707,
            DT: new Date(),
            Topic: "UI Status",
            Source: "Browser",
            Body: "The browser UI should be loaded and ready to go!",
        });



        //Which screen do you want to show first? Are you debugging the debugger? lol
        UIHelper.ShowTab('TabMain');



        //If you local host you are most likely debugging.. :-)
        if (document.location.hostname == "localhost") {
            // debugger;
            // UIHelper.ShowTab('TabDebugger');
            // UIHelper.ShowTab('HistoryLogger');
            // UIHelper.ShowTab('GitHubLinks');
            // UIHelper.ShowTab('TabAppPrefs');
        }


    }); //end UIHelper....

};
