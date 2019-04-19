/*
    Simple wrapper to test the API using the browser.

    Adding in whatever you can to help the user actually use the API!
*/

const DebugUI = {
    //Quick and easy way to get data from our api...
    Fetch(data = {}) {
        const url = document.URL + '';

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
            NewEL.innerHTML = '<b>' + InfoText + '</b> : ' + ElementData;
            NewEL.title = InfoTip;
            NewEL.className = "FooterSysInfo";
            SystemInfo.appendChild(NewEL);
        }


        //The user info for the client to use...
        // console.log(debugdata.UserInfo);

        if (debugdata.UserInfo.isAuthenticated) {
            AddInfoElement('Security Level', 'Level of permissions on the server', debugdata.UserInfo.SecurityLevel);
        } else {
            AddInfoElement('Security Status', 'Your current user status from the servers perspective.', 'Not Authenticated');
        }


        AddInfoElement('Access Point', 'The protocal, port, hostname, path, and query string for the current request using for the API',
            '<b>' + window.location.protocol + '</b>//' + window.location.hostname +
            '<b>' + debugdata.UserInfo.URL + '</b>');

        AddInfoElement('Node Version', 'The version of node on this server',
            debugdata.NodeVersion);

        AddInfoElement('Server Version', 'The version of the APIServer.js file.',
            debugdata.ServerVersion);

        AddInfoElement('Start Date', 'The date the server started', debugdata.ST.toLocaleDateString() + " " + debugdata.ST.toLocaleTimeString());


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



        DebugUI.Fetch({
            service: 'help',
            data: {
                topic: 'sample-code-list',
                sampleid: ServiceName

            }
        }).then(data => {
            console.log('Set default examples---...', data);

            
            for (let index = 0; index < data.samples.length; index++) {
                const sample = data.samples[index];

                //Set Default...
                if(index==0){
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
 

        }) // JSON-string from `response.json()` call
            .catch(error => {
                console.warn('Error!');
                console.error(error);
                // debugger;
            });

    },
    SelectSampleCodeOption(SampleCode) {

        const DebugVerbList_BTN = document.getElementById("DebugVerbList_BTN");

        const DebugSampleList_BTN = document.getElementById("DebugSampleList_BTN");

       
        //Quick clear the old stuff...
        DebugSampleList_UL.innerHTML = "";
    
        DebugSampleList_BTN.innerHTML = SampleCode;

 
        DebugUI.Fetch({
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


        }) // JSON-string from `response.json()` call
            .catch(error => {
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
 
 
            for (var n in debugdata.apidata) {

                const namespaceData = debugdata.apidata[n];
 
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
            DebugUI.SelectServiceOption('data');
            


        } catch (errFillSideBar) {
            console.warn(errFillSideBar);
            debugger;
        }
    },
    OpenDialog(DialogInfo) {
        // debugger;


        console.info('ok kill it')
        Metro.dialog.create({
            title: DialogInfo.title,
            content: DialogInfo.body,
            closeButton: true
        });

    },
    xxxxxx____xxxx__MakeHTTP_GET_Request() {
        console.info('ok')
    },
    //Use the HTTP to request the data...
    MakeHTTP_PUT_Request() {

        // debugger;
        //Get our contents from the editor...
        const JSONPayload = DebugUI.GetEditorJSON();




        if (JSONPayload) {
            DebugUI.Fetch(JSONPayload)
                .then(data => {

                    const resultJSONText = JSON.stringify(data, null, "\t");
                    DebugUI.ShowJSONResult('HTTP', resultJSONText);

                    UIHelper.Logger.Add({
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
        SocketAPI.MasterSocket.WebSocketConnection.send(JSON.stringify(JSONPayload));


    },
    /*
        Toggle the result panel if we are too lazy to check out the 
        window console. lol  :-)
    */
    ToggleResult(ShowFlag) {

        debugger;

        const APIDebugResultsElement = document.getElementById("APIDebugResults");
        const AceEditorElement = document.getElementById("PayloadEditor");

        //Toggle if no falg defined!
        if (!ShowFlag) {
            if (APIDebugResultsElement.style.display == "none") {
                ShowFlag = true;
            } else {
                ShowFlag = false;
            }
        }

        debugger;
        if (ShowFlag) {
            APIDebugResultsElement.style.display = "";
            // AceEditorElement.style.bottom = "200px";
        } else {
            APIDebugResultsElement.style.display = "none";
            // AceEditorElement.style.bottom = "0";
        }

        //Make sure the Ace editor knows it's been resized...
        UIHelper.Ace.AceEditor.resize();
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

            DebugUI.OpenDialog({
                title: active_lang.title,
                body: `
                <div>Please help us improve this!</div>
                <pre><code>${active_lang.code.replace(/\n/g, '<br>')}</code></pre>
                <br>
                <b><i>${active_lang.help}</i></b>
                `
            });


        }//End if right type of code...
    },
    /*
        Show our TargetURI for the client to call.
    */
    SetTargetURI(TargetURI) {

        // const apiURIAddress = document.getElementById('api-uri-address');
        const apiURILink = document.getElementById('api-uri-link');


        // const displayDateDOWN = document.getElementById('Date_Uploaded');
        // displayDateDOWN.innerHTML = "@" + new Date().toLocaleTimeString();


        // apiURIAddress.value = TargetURI;
        apiURILink.href = TargetURI;



    },
    ShowJSONResult(JSONSource, JSONText) {
        const displayDateMod = document.getElementById('Date_Downloaded');
        displayDateMod.innerHTML = ' from [' + JSONSource + '] &nbsp;@' + new Date().toLocaleTimeString();

        UIHelper.Ace.AceDisplayRsults.setValue(JSONText);

        //Set the cursor so the user can start over again...
        UIHelper.Ace.AceDisplayRsults.moveCursorTo(0);

        UIHelper.Ace.AceDisplayRsults.resize();

        UIHelper.Logger.Add({
            TID: 0,
            Type: 707,
            DT: new Date(),
            Topic: "Display JSON from the server",
            Source: "Browser",
            Body: "<i>" + JSONText + "</i>",
        });

    }
};


/*
    Easy functions to help us deal with the ever growing UI... :-)
*/
const UIHelper = {
    QueryStringBuilder(JSONData) {

        //Simple function to serialize the json into array for query string...
        function DigestQS(Prefix, QSObject, QSArray) {

            // debugger;

            for (var o in QSObject) {
                if (typeof (QSObject[o]) == "object") {
                    if (Prefix) {
                        DigestQS(Prefix + o, QSObject[o], QSArray);
                    } else {
                        DigestQS(o + ".", QSObject[o], QSArray);
                    }

                } else {
                    if (QSObject[o] != "") {
                        if (Prefix) {
                            QSArray.push(Prefix + o + "=" + QSObject[o]);
                        } else {
                            QSArray.push(o + "=" + QSObject[o]);

                        }

                    }

                }


            }
        }

        try {
            if (typeof (JSONData) == "string") {
                if (JSONData.length == 0) {
                    DebugUI.SetTargetURI("**EMPTY**");
                    return;
                }
                JSONData = JSON.parse(JSONData);;
            }


            if (JSONData.service) {

                var selectedService = JSONData.service;
                delete JSONData["service"];

                const basicOptions = [];


                DigestQS("", JSONData, basicOptions);


                // if (basicOptions.length) {
                // }
                DebugUI.SetTargetURI('/' + selectedService + '?' + basicOptions.join('&'));

            } else {
                DebugUI.SetTargetURI("**ERROR**");

            }

        } catch (errBadJSON) {
            console.warn('Error In JSON!', errBadJSON);
            DebugUI.SetTargetURI("** bad json **");
        }

    },
    Ace: {
        AceEditor: null, //Set this in code when you are ready...
        AceDisplayRsults: null, //Set this in code when you are ready...        
        SetCompleters(Editor2Complete) {


            var langTools = ace.require("ace/ext/language_tools");

            Editor2Complete.Completer = {
                getCompletions: (editor, session, caretPosition2d, prefix, callback) => {

                    var currline = editor.getSelectionRange().start.row;
                    var content = editor.session.getLine(currline);


                    const WordList = [];
                    WordList.push({
                        caption: 'service',
                        meta: '',
                        score: 10,
                    });

                    WordList.push({
                        caption: 'FunStuff',
                        meta: '',
                        score: 10,
                    });
                    WordList.push({
                        caption: 'demo',
                        meta: '',
                        score: 30,
                    });


                    callback(null, WordList.map((s) => {
                        return {
                            // name: s.caption,
                            value: s.caption,
                            score: 100,
                            meta: s.meta,
                        }
                    }))
                },
            }
            langTools.addCompleter(Editor2Complete.Completer);
        },

        //Make sure we deal with change to the editor...
        HookEvents(Editor2Hook) {
            Editor2Hook.getSession().on('change', function (delta) {
                const editorJSON = Editor2Hook.getValue();
                UIHelper.QueryStringBuilder(editorJSON);
            });
        },

        //Setup some defaults...
        SetupAceEditorDefaults(ParentHTMLTagID) {

            //Ace Editor is awesome! 
            var aceEditor = ace.edit(ParentHTMLTagID);

            // Go here for more options... https://github.com/ajaxorg/ace/wiki/Configuring-Ace
            aceEditor.setOption("mode", "ace/mode/json");
            aceEditor.setOption("autoScrollEditorIntoView", true);
            aceEditor.setOption("showPrintMargin", false);
            aceEditor.setOption("fontSize", 15);
            aceEditor.$blockScrolling = Infinity;

            return aceEditor;
        },

        BuildAceControls() {


            UIHelper.Ace.AceEditor = UIHelper.Ace.SetupAceEditorDefaults('PayloadEditor');
            UIHelper.Ace.AceDisplayRsults = UIHelper.Ace.SetupAceEditorDefaults('APIDebugResults');

            //Make sure display is read only!
            UIHelper.Ace.AceDisplayRsults.setReadOnly(true);

            UIHelper.Ace.AceDisplayRsults.setTheme("ace/theme/monokai");

            //Only hook the actual editor!!!!!
            UIHelper.Ace.HookEvents(UIHelper.Ace.AceEditor);



            //Add your own stuff to the drop downs...
            UIHelper.Ace.SetCompleters(UIHelper.Ace.AceEditor);


            UIHelper.Ace.AceEditor.setOptions({
                enableBasicAutocompletion: UIHelper.Ace.AceEditor.Completer,
                enableLiveAutocompletion: true,
                enableSnippets: true,
            });


        }
    },

    //Simple show tab...
    ShowTab(Tab2Show) {
        var TabElement;
        var BTNElement;

        if (typeof (Tab2Show) == "string") {
            TabElement = document.getElementById(Tab2Show);
            BTNElement = document.getElementById(Tab2Show + "-BTN");
        } else {
            console.warn('ShowTab Error!', '"Tab2Show" must be a string!');
            debugger;
        }

        if (!UIHelper.ActiveTab) {
            UIHelper.ActiveTab = TabElement;
            UIHelper.ActiveTabButton = BTNElement;
            // UIHelper.ActiveTabButton.style.backgroundColor = "blue";
            // UIHelper.ActiveTabButton.addCl('selected')
            UIHelper.ActiveTabButton.classList.add("selected-maintab");
        } else {
            UIHelper.ActiveTab.style.display = "none";
            UIHelper.ActiveTab.style.display = "none";
            UIHelper.ActiveTab = TabElement;
            // UIHelper.ActiveTabButton.style.backgroundColor = "transparent";
            UIHelper.ActiveTabButton.classList.remove("selected-maintab");



            UIHelper.ActiveTabButton = BTNElement;
            // UIHelper.ActiveTabButton.style.backgroundColor = "blue";
            UIHelper.ActiveTabButton.classList.add("selected-maintab");
        }

        UIHelper.ActiveTab.style.display = "block";

    },

    Logger: {
        Clear() {

            Metro.dialog.create({
                title: "Clear the history?",
                content: "<div>Are you sure you want to do this?</div>",
                actions: [
                    {
                        caption: "Agree",
                        cls: "js-dialog-close alert",
                        onclick: function () {
                            const tblBody = document.getElementById('HistoryLoggerTable');
                            tblBody.innerHTML = "";
                        }
                    },
                    {
                        caption: "Disagree",
                        cls: "js-dialog-close",
                        onclick: function () {
                            console.info("History was not deleted!");
                        }
                    }
                ]
            });


        },
        Add(LogMSG) {


            try {
                if (!LogMSG.Type) {
                    LogMSG.Type = 0;
                }

                function CellBuider(HostRow, ID, Title, ClassName, HTMLValue) {
                    const newCell = document.createElement('td');
                    newCell.title = Title;
                    newCell.className = ClassName;
                    newCell.innerHTML = HTMLValue;
                    newCell.vAlign = "top";
                    newCell.align = "left";

                    HostRow.appendChild(newCell)
                    // return newCell
                }

                if (!LogMSG.DT) {
                    LogMSG.DT = new Date()
                }

                const displayDT = moment(LogMSG.DT);
                var dispLogType;
                if (LogMSG.Type < 0) {
                    dispLogType = '<i class="fas fa-globe fa-lg"></i>';
                }
                if (LogMSG.Type == 0) {
                    dispLogType = '<i class="fas fa-disk fa-lg"></i>';
                }
                if (LogMSG.Type > 0) {
                    dispLogType = '<i class="fas fa-file fa-lg"></i>';
                }

                if (LogMSG.Type == 200) {
                    dispLogType = '<i class="fas fa-globe-americas fa-lg"></i>';
                }

                if (LogMSG.Type == 411) {
                    dispLogType = '<i class="fas fa-info-circle fa-lg"></i>';
                }

                if (LogMSG.Type == 466) {
                    dispLogType = '<i class="fas fa-share-alt fa-lg"></i>';
                }

                if (LogMSG.Type == 707) {
                    dispLogType = '<i class="far fa-eye fa-lg"></i>';
                }



                const tblBody = document.getElementById('HistoryLoggerTable');

                const tr = document.createElement('tr');

                // debugger;

                // CellBuider(tr, "", "TID Help", "", LogMSG.TID);
                CellBuider(tr, "", "Type Of Log Item [" + LogMSG.Type + "]", "", dispLogType);
                CellBuider(tr, "", displayDT.format("dddd, MMMM Do YYYY, h:mm:ss a"), "", displayDT.format("h:mm:ss a"));
                CellBuider(tr, "", "", "", LogMSG.Topic);
                CellBuider(tr, "", "", "", LogMSG.Source);
                CellBuider(tr, "", "", "", LogMSG.Body);

                tblBody.appendChild(tr);
            } catch (errAddLogItem) {
                alert('Error adding to the log!!!\r\n' + errAddLogItem.message);
            }


        }
    },
    GetHelpFile(FilePath, OnFetch) {
        // UIHelper.GetHelpFile('',function(){});

        DebugUI.Fetch({
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


        }) // JSON-string from `response.json()` call
            .catch(error => {
                console.warn('Error!');
                console.error(error);
                // debugger;
            });

    }

};



/* 
    Go grab our style using the API to show an example of
    another way to use it. Of course you don't want to 
    actually get your CSS files this way, but it's yet
    another example of how to use a web API...
*/
UIHelper.GetHelpFile('debug.css', function (filecontents) {
    const CSSFile = document.createElement("style");
    CSSFile.type = "text/css";
    CSSFile.innerHTML = filecontents.body;
    document.body.appendChild(CSSFile);
    UIHelper.Logger.Add({
        TID: 0,
        Type: 707,
        DT: new Date(),
        Topic: "UI Styles",
        Source: "Browser",
        Body: "The extra stryles [<b>debug.css</b>] have been set via the API. :-) ",
    });
});


UIHelper.GetHelpFile('HelpDisplay.html', function (filecontents) {
    const MainDisplay = document.getElementById("TabMain");

    MainDisplay.innerHTML = filecontents.body;

    UIHelper.Logger.Add({
        TID: 0,
        Type: 707,
        DT: new Date(),
        Topic: "UI Set Main Help",
        Source: "Browser",
        Body: "Basic help HTML has been set!",
    });

    //Now show the sys info in the main display...
    DebugUI.SetSysInfo();

});



/*
    After page has loaded, you can be sure that everything you need
    is already loaded and ready to go...
*/
window.onload = function () {









    UIHelper.Logger.Add({
        TID: 0,
        Type: 707,
        DT: new Date(),
        Topic: "UI Status",
        Source: "Browser",
        Body: "The browser UI should be loaded and ready to go!",
    });


    /*
        Use the help service to get the Socket API code. 
        It's just another way to use the API and shows
        how you can do this own a seperate domain and 
        still get the updates...
    */
    UIHelper.GetHelpFile('SocketAPI.js', function (filecontents) {
        const srcSocketAPI = document.createElement("script");
        srcSocketAPI.innerHTML = filecontents.body;
        document.body.appendChild(srcSocketAPI);

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

            UIHelper.Logger.Add({
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

            DebugUI.ShowJSONResult('HTTP', JSON.stringify(jsonData, null, "\t"));

        };

        //Once connected...
        SocketAPI.MasterSocket.Events.onopen = function () {

            UIHelper.Logger.Add({
                Type: 411,
                TID: 0,
                DT: new Date(),
                Topic: "Socket Connected!",
                Source: "Browser",
                Body: "The web socket is connected and ready to go!",
            });

        };

        //After events are rewired, connect the socket...
        SocketAPI.MasterSocket.Connnect();
    });









    //Setup our UI parts...
    DebugUI.FillSideBar();


    //Setup all of our ace editors...
    UIHelper.Ace.BuildAceControls();




    /*
        This is only available to the debug client. We 
        don't put this in normal requests from users... 
    */
    console.info(`    
        Use : "ServerAPI" for easy code to help with testing.
        Use : "debugdata" in the console for the api data help.    
    `);



    //Which screen do you want to show first? Are you debugging the debugger? lol
    UIHelper.ShowTab('TabMain');
    // debugger;
    UIHelper.ShowTab('TabDebugger');
    // UIHelper.ShowTab('HistoryLogger');
    // UIHelper.ShowTab('GitHubLinks');












};
