/*
    Easy functions to help us deal with the ever growing UI... :-)
*/

window.UIHelper = {

    /*
        Manage the application preferences in the UI...
    */
    AppPrefs:{

        ShowPrefs() {
            console.info('TODO -->', 'Display AppRefs-->', AppRefs);
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
                                UIHelper.Logger.Add({
                                    TID: 0,
                                    Type: 707,
                                    DT: new Date(),
                                    Topic: "Local Storage",
                                    Source: "Browser",
                                    Body: "The local storage has been cleared!",
                                });
                            } catch (errLocalStorage) {
                                UIHelper.Logger.Add({
                                    TID: 0,
                                    Type: 0,
                                    DT: new Date(),
                                    Topic: "Local Storage",
                                    Source: "Browser",
                                    Body: errLocalStorage.message
                                });
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
                        console.warn(data.err);
                        debugger;
                    } else {
                        console.log('valid key--', data);
    
    
                        return;
    
    
                        Metro.dialog.create({
                            title: "Valid API Key",
                            content: "<div>Store API Key and state from server to local storage?</div>",
                            actions: [
                                {
                                    caption: "Agree",
                                    cls: "js-dialog-close alert",
                                    onclick: function () {
    
                                        console.log(APIKEY);
    
                                        UIHelper.Logger.Add({
                                            TID: 0,
                                            Type: 707,
                                            DT: new Date(),
                                            Topic: "API Key",
                                            Source: "Browser",
                                            Body: "Testing a new API Key!",
                                        });
    
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
            // console.warn('Error In JSON!', errBadJSON);
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


    CopyToClipboard(containerid) {


        var textArea = document.getElementById(containerid);
        // var textArea = document.createElement("textarea");
        // textArea.value = text;
        // document.body.appendChild(textArea);
        // textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }



    },

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
    }
};



