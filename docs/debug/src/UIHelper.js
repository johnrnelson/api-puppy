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
                WebApp.DebugUI.QueryStringBuilder(editorJSON);
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

        // Only load the debugger tool if they want to use it. 
        if (Tab2Show == "TabDebugger") {


            //Have I alredy loaded this?
            if (!WebApp.DebugUI) {

                /*
                    Load our debugger ui supporting javascript...
                */
                WebApp.GetHelpFile('DebuggerUI.js', function (DebuggerUICode) {

                    window.eval(DebuggerUICode);


                    WebApp.GetHelpFile('DebuggerUI.css', function (filecontents) {
                        const CSSFile = document.createElement("style");
                        CSSFile.type = "text/css";
                        CSSFile.innerHTML = filecontents;
                        document.head.appendChild(CSSFile);
                    });



                    //Setup all of our ace editors...
                    UIHelper.Ace.BuildAceControls();

                    //Setup our UI parts...
                    WebApp.DebugUI.FillVerbList();

                    //Use the default and set the edtor....            
                    console.info('Setting default service......');
                    WebApp.DebugUI.SelectServiceOption('healthcare');


                    UIHelper.ActiveTab.style.display = "block";


                });

            } else {
                UIHelper.ActiveTab.style.display = "block";
            }

        } else {
            UIHelper.ActiveTab.style.display = "block";
        }
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

        AddInfoElement('Server Version', 'The version of the APIServer.js file.',
            WebApp.SysInfo.ProjectInfo.Version + ' ' + WebApp.SysInfo.ProjectInfo.VersionName);

        AddInfoElement('Start Date', 'The date the server started', WebApp.SysInfo.ST.toLocaleDateString() + " " + WebApp.SysInfo.ST.toLocaleTimeString());



    },





    // ********************************************************************
    // ********************************************************************


};








WebApp.HistoryLogger.Logger.Add({
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



        //Supporting chart code...
        WebApp.GetHelpFile('AppPrefs.js', function (AppPrefsCode) {
            window.eval(AppPrefsCode);
            WebApp.AppPrefsManager.ShowPrefs();
        });



        UIHelper.SetSysInfo();

        // console.log('CHECK THIS-->',WebApp.SysInfo);

        WebApp.AppCharts.AddErrorsChart();
        WebApp.AppCharts.AddServicesStatChart();

    }//end if no error...

});//end SysInfo call....





WebApp.HistoryLogger.Logger.Add({
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
WebApp.GetHelpFile('SocketAPI.js', function (SocketAPICode) {
    window.eval(SocketAPICode);
    WebApp.GetHelpFile('SocketClient.js', function (SocketClientCode) {
        window.eval(SocketClientCode);
    });
});




//Which screen do you want to show first? Are you debugging the debugger? lol
UIHelper.ShowTab('TabMain');




//If you local host you are most likely debugging.. :-)
if (document.location.hostname == "localhost") {
    // debugger;
    console.info('Set the debugging default panel to work with... ');
    setTimeout(() => {

        // UIHelper.ShowTab('TabDebugger');
    }, 500);
    UIHelper.ShowTab('HistoryLogger');
    // UIHelper.ShowTab('GitHubLinks');
    // UIHelper.ShowTab('TabAppPrefs');
    // UIHelper.ShowTab('AppCharts');
}
