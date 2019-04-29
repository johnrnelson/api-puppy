/*
    Easy functions to help us deal with the ever growing UI... :-)
*/






window.UIHelper = {
    // ********************************************************************
    /*
    Quick and easy stub to show we are working on stuff...
    */
    NA() {
        Metro.dialog.create({
            title: "This feature is not yet available",
            content: "<div>Working on fixing whatever you just did! :-)</div>",
            actions: [
                {
                    caption: "OK",
                    cls: "js-dialog-close alert",
                    onclick: function () {

                    }
                }
            ]
        });
    },
    // ********************************************************************

    /*
        Manage the application preferences in the UI...
    */
    AppPrefs: {

        ShowPrefs() {
            // console.info('TODO -->', 'Display AppRefs-->', AppRefs);
            // WebApp.AppPrefs.UserOptions.APIKEY

            const inputCtrl = document.getElementById("APIKeyInput");

            inputCtrl.value = WebApp.AppPrefs.UserOptions.APIKEY;


        },
        ClearPrefs() {


            Metro.dialog.create({
                title: "Clear the local storage?",
                content: "<div>Are you sure you want to do this?</div>",
                actions: [
                    {
                        caption: "Agree",
                        cls: "js-dialog-close alert",
                        onclick: function () {
                            try {
                                localStorage.clear();
                                Metro.toast.create("The local storage has been cleared!", null, null, "info");
                                HistoryLogger.Logger.Add({
                                    TID: 0,
                                    Type: 707,
                                    DT: new Date(),
                                    Topic: "Local Storage",
                                    Source: "Browser",
                                    Body: "The local storage has been cleared!",
                                });
                            } catch (errLocalStorage) {
                                Metro.toast.create("Error clearing the local storage!", null, null, "info");

                            }


                        }
                    },
                    {
                        caption: "Disagree",
                        cls: "js-dialog-close"
                    }
                ]
            });

        },

        //Test the key before you use it...
        TestKey(APIKEY) {

            function ValidateKey() {

                if (!APIKEY) {
                    return false;
                }

                if (typeof (APIKEY) == "string") {

                    return true;

                } else {
                    //Not supporting anything other than strings for the moment...
                    return false;
                }
            }





            if (ValidateKey()) {

                WebApp.Fetch({
                    service: 'help',
                    data: {
                        topic: 'validate-key',
                        key: APIKEY
                    }
                }).then(data => {
                    if (data.err) {
                        console.warn(data.err.msg);



                    } else {
                        console.log('valid key--', data);



                        Metro.dialog.create({
                            title: "Valid API Key",
                            content: "<div>Store API Key and state from server to local storage?</div>",
                            actions: [
                                {
                                    caption: "Agree",
                                    cls: "js-dialog-close alert",
                                    onclick: function () {

                                        console.log(APIKEY);
                                        WebApp.AppPrefs.UserOptions.APIKEY = APIKEY;

                                        localStorage.setItem('UserOptions', JSON.stringify(WebApp.AppPrefs.UserOptions));


                                    }
                                },
                                {
                                    caption: "Disagree",
                                    cls: "js-dialog-close"
                                }
                            ]
                        });




                    }


                }).catch(error => {
                    console.warn('Error!');
                    console.error(error);
                    // debugger;
                });




            } else {
                alert('fix yo key!  :-)');
            }


        }
    },


    /*
        Take a JSON object and create a natural query string
        then setup our UI to show the results....
    */
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
                    WebApp.DebugUI.SetTargetURI("**EMPTY**");
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
                WebApp.DebugUI.SetTargetURI('/' + selectedService + '?' + basicOptions.join('&'));

            } else {
                WebApp.DebugUI.SetTargetURI("**ERROR**");

            }

        } catch (errBadJSON) {
            // console.warn('Error In JSON!', errBadJSON);
            WebApp.DebugUI.SetTargetURI("** bad json **");
        }

    },
    Ace: {
        //Set this in code when you are ready...
        AceEditor: null,
        //Set this in code when you are ready...        
        AceDisplayRsults: null,

        /*
            This lets you add new items to the drop down on 
            code complete...
        */
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

        /*
            Build all the ace editors we need to support the basic editing 
            needs of our UI.  
            
            No need to get crazy with this. Most people use a "real" editor
            like visual stduio code or sublime so just do the basics....
        */
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
            UIHelper.ActiveTabButton.classList.add("selected-maintab");
        } else {
            UIHelper.ActiveTab.style.display = "none";
            UIHelper.ActiveTab.style.display = "none";
            UIHelper.ActiveTab = TabElement;
            UIHelper.ActiveTabButton.classList.remove("selected-maintab");

            UIHelper.ActiveTabButton = BTNElement;
            UIHelper.ActiveTabButton.classList.add("selected-maintab");
        }

        UIHelper.ActiveTab.style.display = "block";

    },

    /*
        Copy a HTML element's body in to the clipboard..
    */
    CopyToClipboard(containerid) {


        var textArea = document.getElementById(containerid);
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
    },











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





    // ********************************************************************
    // ********************************************************************


};








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



        //Setup all of our ace editors...
        UIHelper.Ace.BuildAceControls();

        UIHelper.AppPrefs.ShowPrefs();


        //Setup our UI parts...
        WebApp.DebugUI.FillVerbList();

        //Use the default and set the edtor....            
        WebApp.DebugUI.SelectServiceOption('time');


        UIHelper.SetSysInfo();

        // console.log('CHECK THIS-->',WebApp.SysInfo);

        WebApp.HelpDisplay.AddErrorsChart();

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
