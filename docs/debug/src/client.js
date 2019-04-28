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
    Wrap up what ya want to make dealing with the UI as easy 
    as possible...
*/
const DebugUI = {


    /*
        The rest is just setting up the UI for the user...
    */
    //Show the server info via HTML in a componet fashion....
    SetSysInfo() {


        //You will find this on the `debug.html` page...
        const SystemInfo = document.getElementById("SystemInfo");

        //Setup a simple function to add html to our DOM... super simple!!!!!!!!!
        function AddInfoElement(InfoText, InfoTip, ElementData) {

            const NewEL = document.createElement('div');
            NewEL.innerHTML = '<span class="SysInfoLabel">' + InfoText + '</span><br>' +
                '<span class="SysInfoValue">' + ElementData + '</span>';
            NewEL.title = InfoTip;
            NewEL.className = "SysInfoItem";
            SystemInfo.appendChild(NewEL);
            // console.log(NewEL)
        }


        //The user info for the client to use...


        if (WebApp.AppPrefs.UserOptions.APIKEY.length > 1) {
            AddInfoElement('Security Level', '', 'Using API Key');
        } else {
            AddInfoElement('Security Status', 'Your current user status from the servers perspective.', 'Not Authenticated');
        }


        AddInfoElement('Access Point', 'The protocal, port, hostname, path, and query string for the current request using for the API',
            '<b>' + window.location.protocol + '</b>//' + window.location.hostname +
            '<b>' + window.location.pathname + '</b>');

        AddInfoElement('Node Version', 'The version of node on this server',
            WebApp.SysInfo.NodeVersion);

        AddInfoElement('Server Version', 'The version of the APIServer.js file.', WebApp.SysInfo.ProjectInfo.Version);

        AddInfoElement('Start Date', 'The date the server started', WebApp.SysInfo.ST.toLocaleDateString() + " " + WebApp.SysInfo.ST.toLocaleTimeString());



    },

    SelectServiceOption(ServiceName) {


        const DebugVerbList_BTN = document.getElementById("DebugVerbList_BTN");

        const DebugSampleList_UL = document.getElementById("DebugSampleList_UL");

        // const SelOpt = this.selectedOptions[0];

        //Quick clear the old stuff...
        DebugSampleList_UL.innerHTML = "";
        // debugger;
        DebugVerbList_BTN.innerHTML = ServiceName;
        DebugVerbList_BTN.ServiceName = ServiceName;



        WebApp.Fetch({
            service: 'help',
            data: {
                topic: 'sample-code-list',
                sampleid: ServiceName

            }
        }).then(data => {
            // console.log('Set default examples---...', data);


            for (let index = 0; index < data.samples.length; index++) {
                const sample = data.samples[index];

                //Set Default...
                if (index == 0) {
                    DebugUI.SelectSampleCodeOption(sample);
                }


                const optUL = document.createElement('li');
                optUL.SampleName = sample;
                optUL.onclick = function () {
                    DebugUI.SelectSampleCodeOption(this.SampleName);
                };
                optUL.innerHTML = '<li><a href="#">' + sample + '</a></li>';
                DebugSampleList_UL.appendChild(optUL);
            }


        }).catch(error => {
            console.warn('Error!');
            console.error(error);
            // debugger;
        });

    },
    SelectSampleCodeOption(SampleCode) {

        const DebugVerbList_BTN = document.getElementById("DebugVerbList_BTN");

        const DebugSampleList_BTN = document.getElementById("DebugSampleList_BTN");

        const displayDateMod = document.getElementById('Date_Downloaded');
        displayDateMod.innerHTML = "";


        //Quick clear the old stuff...
        // DebugSampleList_UL.innerHTML = "";

        DebugSampleList_BTN.innerHTML = SampleCode;


        WebApp.Fetch({
            service: 'help',
            data: {
                topic: 'sample-code-fetch',
                sampleid: SampleCode,
                'target-service': DebugVerbList_BTN.ServiceName
            }
        }).then(data => {

            if (data.err) {
                debugger;
                console.warn(data.err);
            } else {

                UIHelper.Ace.AceEditor.setValue(JSON.stringify(data.code, null, "\t"));

                //Set the cursor so the user can start over again...
                UIHelper.Ace.AceEditor.moveCursorTo(0);
                UIHelper.Ace.AceEditor.resize();


                UIHelper.Ace.AceDisplayRsults.setValue("{}");

                //Set the cursor so the user can start over again...
                UIHelper.Ace.AceDisplayRsults.moveCursorTo(0);
                UIHelper.Ace.AceDisplayRsults.resize();
            }


        }).catch(error => {
            console.error(error);
            debugger;
        });



    },
    //Fill the side bar with options we can use in our debugger...
    FillSideBar() {
        try {


            const DebugVerbList_UL = document.getElementById("DebugVerbList_UL");
            DebugVerbList_UL.innerHTML = "";

            const dbSidebar = document.getElementById('debugger-sidbar');


            for (var n in WebApp.SysInfo.apidata) {

                const namespaceData = WebApp.SysInfo.apidata[n];

                const optUL = document.createElement('li');
                optUL.RecordData = namespaceData;
                optUL.ServiceName = n;
                optUL.onclick = function () {
                    DebugUI.SelectServiceOption(this.ServiceName);
                };
                optUL.innerHTML = '<li><a href="#">' + n + '</a></li>';
                DebugVerbList_UL.appendChild(optUL);

            }

            //Use the default and set the edtor....            
            DebugUI.SelectServiceOption('logger');



        } catch (errFillSideBar) {
            console.warn(errFillSideBar);
            debugger;
        }
    },

    //Use the HTTP to request the data...
    MakeHTTP_PUT_Request() {

        // debugger;
        //Get our contents from the editor...
        const JSONPayload = DebugUI.GetEditorJSON();




        if (JSONPayload) {
            WebApp.Fetch(JSONPayload)
                .then(data => {

                    const resultJSONText = JSON.stringify(data, null, "\t");
                    DebugUI.ShowJSONResult('HTTP', resultJSONText);

                    HistoryLogger.Logger.Add({
                        TID: 0,
                        Type: 200,
                        DT: new Date(),
                        Topic: "HTTP Request",
                        Source: "Browser",
                        Body: "<i>" + resultJSONText + "</i>",
                    });

                }) // JSON-string from `response.json()` call
                .catch(error => {
                    console.warn('Error in running the debug!');
                    console.error(error);
                    // debugger;
                });
        }


    },
    //Use the socket to request the data...
    MakeSocketRequest() {

        const displayDateUP = document.getElementById('Date_Downloaded');
        displayDateUP.innerHTML = "@" + new Date().toLocaleTimeString();

        //Get our contents from the editor...
        const JSONPayload = DebugUI.GetEditorJSON();
        // console.info(JSONPayload);

        // SocketAPI.MasterSocket.WebSocketConnection.send(JSON.stringify(JSONPayload));
        SocketAPI.MasterSocket.WebSocketConnection.SendData(JSONPayload, function (SckData) {
            console.info('call back is good--', SckData);

            DebugUI.ShowJSONResult('Socket', JSON.stringify(SckData, null, "\t"));

        });


    },
    GetEditorJSON() {

        try {
            return JSONPayload = JSON.parse(UIHelper.Ace.AceEditor.getValue());


        } catch (errorJSON) {

            const modalWindow = document.querySelector('#mastermodal');
            const modalWindowTitle = modalWindow.querySelector('.modal-title');
            const modalWindowBody = modalWindow.querySelector('.modal-body');

            modalWindowTitle.innerHTML = "Error in JSON!";

            modalWindowBody.innerHTML = `
            <div>Fix the JSON errors before attempting to call the API!</div> 
            <br> 
            `;

            $('#mastermodal').modal({
                show: true
            });
            return null;
        }

    },
    //Pop a window to show the code!
    ExportCode(TypeOfCode) {


        //Get our contents from the editor...
        const JSONPayload = DebugUI.GetEditorJSON();

        /*
            Define the languages supported and how to help...
        */
        const languages_supported = {
            'curl': function () {

                return {
                    title: 'Command line "curl"',
                    code: `curl --request GET --data '${JSON.stringify(JSONPayload)}' ${window.location.href}`,
                    help: 'Check out the man page for curl for more information.',
                }
            },
            'javascript-fetch': function () {

                return {
                    title: 'Browser javascript',
                    code: `
                var url = '${document.URL}'; 
            
                fetch(url, {
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
                    body: JSON.stringify(${JSON.stringify(JSONPayload)}), // body data type must match "Content-Type" header
                }).then(response => response.json()).then(JSON => {
                    console.info('This is the result of the request!');
                    console.log(JSON);
                    debugger;
                }); // parses JSON response into native Javascript objects 
                 
                
                `,
                    help: 'You can use xhr but I guess fetch is the new thing.',
                }
            },
            'javascript-http-request': function () {
                return {
                    title: 'NodeJS HTTP Request',
                    code: `** SAMPLE CODE for npm "request" **`,
                    help: 'There are many ways to use request objects in Node.',
                }
            },
            'python 3': function () {
                return {
                    title: 'Python 3 Broken Example :-)',
                    code: `

import json
import requests

api_token = 'your_api_token'
api_url_base = '${document.URL}'
headers = {'Content-Type': 'application/json','Authorization': 'Bearer {0}'.format(api_token)}
api_url = '{0}account'.format(api_url_base)
response = requests.get(api_url, headers=headers)
response_data = response.json() 
print(response_data)  

                `,
                    help: 'No Python experts helping us out with this?',
                }
            }
        };



        const active_lang = languages_supported[TypeOfCode]({
            jSON: 'data'
        });

        //User wants to use something we don't know about???
        if (!active_lang) {
            console.warn('somebody update something? Did you check git for the latest code? TypeOfCode"' + TypeOfCode + '" not found!');
        } else {


            Metro.dialog.create({
                title: active_lang.title,
                content: `
                <div>Please help us improve this!</div>
                
                <textarea rows="7 cols="10" style="white-space:nowrap;width:100%;height:100%" id="ExampleCodeDisplay">${active_lang.code}</textarea>
                <br>
                <b><i>${active_lang.help}</i></b>
                `,
                actions: [
                    {
                        caption: "Copy to Clipboard",
                        cls: "js-dialog-close",
                        onclick: function () {
                            UIHelper.CopyToClipboard('ExampleCodeDisplay');
                            // const tblBody = document.getElementById('HistoryLoggerTable');
                            // tblBody.innerHTML = "";
                        }
                    },
                    {
                        caption: "Close",
                        cls: "js-dialog-close",
                        onclick: function () {
                            //All Done...
                        }
                    }
                ]

            });



        }//End if right type of code...
    },
    /*
        Show our TargetURI for the client to call.
    */
    SetTargetURI(TargetURI) {

        const apiURILink = document.getElementById('api-uri-link');

        apiURILink.href = TargetURI;

    },
    ShowJSONResult(JSONSource, JSONText) {
        const displayDateMod = document.getElementById('Date_Downloaded');
        displayDateMod.innerHTML = ' using [' + JSONSource + '] &nbsp;@' + new Date().toLocaleTimeString();

        UIHelper.Ace.AceDisplayRsults.setValue(JSONText);

        //Set the cursor so the user can start over again...
        UIHelper.Ace.AceDisplayRsults.moveCursorTo(0);

        UIHelper.Ace.AceDisplayRsults.resize();

        HistoryLogger.Logger.Add({
            TID: 0,
            Type: 707,
            DT: new Date(),
            Topic: "Display JSON from the server",
            Source: JSONSource,
            Body: "<i>" + JSONText + "</i>",
        });

    }
};


/*
    Simple app prefs manager...
*/
WebApp.GetHelpFile('HistoryLogger.js', function (filecontents) {
    const srcHistoryLogger = document.createElement("script");
    srcHistoryLogger.innerHTML = filecontents.body;
    document.head.appendChild(srcHistoryLogger);

    HistoryLogger.Calendar.AddControl();

});


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

        HistoryLogger.Logger.Add({
            TID: 0,
            Type: 707,
            DT: new Date(),
            Topic: "UI Help",
            Source: "Browser",
            Body: "The JavaScript UI helper has been loaded and we ready to go!",
        });








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
                DebugUI.FillSideBar();

                //Setup all of our ace editors...
                UIHelper.Ace.BuildAceControls();

                UIHelper.AppPrefs.ShowPrefs();


                DebugUI.SetSysInfo();

                // console.log('CHECK THIS-->',WebApp.SysInfo);


            }



        }).catch(error => {
            console.warn('Error!');
            console.error(error);
            // debugger;
        });





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
               Overwrite the events to customize it for 
               this domain and this DEMO!
           */
            SocketAPI.MasterSocket.Events.onmessage = function (jsonData) {
                // const jsonData = JSON.parse(e.data);
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

                //Do not display service messages!
                if (jsonData.TID == 0) {
                    // console.log('Web Socket Service Mesage:', jsonData);                
                    return;
                }

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

        //Set default logger view...
        HistoryLogger.Logger.SetListType('411');


        //If you local host you are most likely debugging.. :-)
        if (document.location.hostname == "localhost") {
            // debugger;
            // UIHelper.ShowTab('TabDebugger');
            UIHelper.ShowTab('HistoryLogger');
            // UIHelper.ShowTab('GitHubLinks');
            // UIHelper.ShowTab('TabAppPrefs');
        }



    }); //end UIHelper....

};
