/*
    Easy functions to help us deal with the ever growing UI... :-)
*/

window.UIHelper = {
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


};
 



