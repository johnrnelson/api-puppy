/*
    Simple wrapper to test the API using the browser.

    Adding in whatever you can to help the user actually use the API!
*/

const DebugUI = {
    //Quick and easy way to get data from our api...
    Fetch(data = {}) {
        const url = document.URL + 'api/';

        return fetch(url, {
            method: "PUT", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit

            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        }).then(response => response.json()); // parses JSON response into native Javascript objects 

    },


    /*
        The rest is just setting up the UI for the user...
    */

    //Build an HTML table with all the api help.. 
    SetHelpTable(DisplayHTMLELement) {
        DebugUI.DisplayTestingActions = document.getElementById(DisplayHTMLELement);


        //Clear any old stuff...
        DebugUI.DisplayTestingActions.innerHTML = "";

        // debugger;

        for (var n in debugdata.apidata) {
            const namespace = debugdata.apidata[n];
            AddTestingRow(n, namespace);
        }


        function AddTestingRow(NameSpace, RowData) {



            //for each test record we have....
            for (var t in RowData.test) {
                const test = RowData.test[t];

                // console.log(test);

                const TestActionRow = document.createElement('tr');
                TestActionRow.title = "NameSpace:" + NameSpace;

                const TestActionColA = document.createElement('td');
                const TestActionColB = document.createElement('td');

                TestActionColA.innerHTML = test.text;
                TestActionColB.innerHTML = test.title;

                // TestActionColA.className = "buttonclick";

                //Let children reference the test record....
                TestActionRow.DataRecord = test;

                //Set DOM links for easy scripting access....
                TestActionColA.RowElement = TestActionRow;
                TestActionColB.RowElement = TestActionRow;


                TestActionRow.appendChild(TestActionColA);
                TestActionRow.appendChild(TestActionColB);
                DebugUI.DisplayTestingActions.appendChild(TestActionRow);


            }


        }


    },
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


        AddInfoElement('Host:Port', 'The hostname and port the server is using for the API',
            '' + window.location.hostname + ':' + debugdata.port);

        AddInfoElement('NodeVersion', 'The version of node on this server',
            debugdata.NodeVersion);

        AddInfoElement('Start Date', 'The date the server started', debugdata.ST.toLocaleDateString() + " " + debugdata.ST.toLocaleTimeString());


    },
    /*
        Fill the side bar with options we can use in our debugger...
    */
    FillSideBar() {

        const dbSidebar = document.getElementById('debugger-sidbar');
        const DebugVerbList = dbSidebar.querySelector("#DebugVerbList");
        const ExampleCodeList = dbSidebar.querySelector("#ExampleCodeList");

        //When the user selects something different...
        DebugVerbList.onchange = function () {

            const SelOpt = this.selectedOptions[0];

            //Quick clear the old stuff...
            ExampleCodeList.innerHTML = "";
            // debugger;



            DebugUI.Fetch({
                service: 'help',
                data: {
                    topic: 'sample-code-list',
                    sampleid: SelOpt.value

                }
            }).then(data => {
                // console.log('Set default examples---...', data);

                for (let index = 0; index < data.samples.length; index++) {
                    const sample = data.samples[index];
                    const opt = document.createElement('option');
                    opt.value = sample;
                    opt.innerHTML = sample;
                    ExampleCodeList.appendChild(opt);
                }

                ExampleCodeList.onchange();

            }) // JSON-string from `response.json()` call
                .catch(error => {
                    console.warn('Error!');
                    console.warn(data);
                    console.error(error);
                    // debugger;
                });


        };


        //When the user selects something different...
        ExampleCodeList.onchange = function () {

            const SelVerb = DebugVerbList.selectedOptions[0];

            const SelOpt = this.selectedOptions[0];

            DebugUI.Fetch({
                service: 'help',
                data: {
                    topic: 'sample-code-fetch',
                    sampleid: SelOpt.innerHTML,
                    'target-service': SelVerb.innerHTML
                }
            }).then(data => {

                if (data.err) {
                    debugger;
                    console.warn(data.err);
                } else {

                    UIHelper.AceEditor.setValue(JSON.stringify(data.code, null, "\t"));

                    //Set the cursor so the user can start over again...
                    UIHelper.AceEditor.moveCursorTo(0);


                    UIHelper.AceDisplayRsults.setValue("{}");

                    //Set the cursor so the user can start over again...
                    UIHelper.AceDisplayRsults.moveCursorTo(0);
                }


            }) // JSON-string from `response.json()` call
                .catch(error => {
                    console.error(error);
                    debugger;
                });


        };


        for (var n in debugdata.apidata) {
            //We don't add the default here!
            if (n != "default") {
                const namespaceData = debugdata.apidata[n];

                const optEl = document.createElement('option');
                optEl.RecordData = namespaceData;
                optEl.value = n;
                optEl.innerHTML = n;
                DebugVerbList.appendChild(optEl);

            }
        }

        //Use the default and set the edtor....
        DebugVerbList.onchange();

    },
    OpenDialog(DialogInfo) {
        // debugger;



        const modalWindow = document.querySelector('#mastermodal');
        const modalWindowTitle = modalWindow.querySelector('.modal-title');
        const modalWindowBody = modalWindow.querySelector('.modal-body');

        modalWindowTitle.innerHTML = DialogInfo.title;
        modalWindowBody.innerHTML = DialogInfo.body;

        $('#mastermodal').modal({
            show: true
        });

    },
    RunDebug() {
        console.clear();
        console.info('\r\nRun the debug code!');


        // debugger;
        //Get our contents from the editor...
        const JSONPayload = DebugUI.GetEditorJSON();

        if (JSONPayload) {
            DebugUI.Fetch(JSONPayload)
                .then(data => {



                    /*
                    if (data.err) {
                        DebugUI.OpenDialog({
                            title: "Error runing the service",
                            body: `
                            <div>Please report this to support!</div>
                            <b>Error Message</b> : ${data.err}
                            `
                        }); 
                    }
                    */
 
 
                    UIHelper.AceDisplayRsults.setValue(JSON.stringify(data, null, "\t"));

                    //Set the cursor so the user can start over again...
                    UIHelper.AceDisplayRsults.moveCursorTo(0); 



                }) // JSON-string from `response.json()` call
                .catch(error => {
                    console.warn('Error in running the debug!');
                    console.error(error);
                    // debugger;
                });
        }


    },
    /*
        Toggle the result panel if we are too lazy to check out the 
        window console. lol  :-)
    */
    ToggleResult(ShowFlag) {

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

        if (ShowFlag) {
            APIDebugResultsElement.style.display = "";
            AceEditorElement.style.bottom = "200px";
        } else {
            APIDebugResultsElement.style.display = "none";
            AceEditorElement.style.bottom = "0";
        }

        //Make sure the Ace editor knows it's been resized...
        UIHelper.AceEditor.resize();
    },


    GetEditorJSON() {

        try {
            return JSONPayload = JSON.parse(UIHelper.AceEditor.getValue());


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
                const url = '${document.URL}api/'; 
            
                fetch(url, {
                    method: "PUT", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: "same-origin", // include, *same-origin, omit
                    headers: {
                        "Content-Type": "application/json",
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
                    title: 'Python 3 Example',
                    code: `No Python experts helping us out with this?
<br>
Any Help at all?
                `,
                    help: 'Check out the man page for curl for more information.',
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
    }
};


const UIHelper = {
    AceEditor: null, //Set this in code when you are ready...
    ShowTab(Tab2Show) {

        // debugger;
        if (typeof (Tab2Show) == "string") {
            Tab2Show = document.getElementById(Tab2Show);
        }

        if (!UIHelper.ActiveTab) {
            UIHelper.ActiveTab = Tab2Show;
        } else {
            UIHelper.ActiveTab.style.display = "none";
            UIHelper.ActiveTab = Tab2Show;
        }
        UIHelper.ActiveTab.style.display = "block";
    }
};



/*
    After page has loaded, you can be sure that everything you need
    is already loaded and ready to go...
*/
window.onload = function () {


    function SetupAceEditor(ParentHTMLTagID) {

        //Ace Editor is awesome! 
        var aceEditor = ace.edit(ParentHTMLTagID);

        // Go here for more options... https://github.com/ajaxorg/ace/wiki/Configuring-Ace
        aceEditor.setOption("mode", "ace/mode/json");
        aceEditor.setOption("autoScrollEditorIntoView", true);
        aceEditor.setOption("showPrintMargin", false);
        aceEditor.setOption("fontSize", 15);
        aceEditor.$blockScrolling = Infinity;

        return aceEditor;
    }

    UIHelper.AceEditor = SetupAceEditor('PayloadEditor');
    UIHelper.AceDisplayRsults = SetupAceEditor('APIDebugResults');

    // debugger;

    var langTools = ace.require("ace/ext/language_tools");
 
    var rhymeCompleter = {
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
                caption: 'view',
                meta: '',
                score: 10,
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
    langTools.addCompleter(rhymeCompleter);

    UIHelper.AceEditor.setOptions({
        enableBasicAutocompletion: rhymeCompleter,
        enableLiveAutocompletion: true,
        enableSnippets: true,
    });







    //Setup our UI parts...
    DebugUI.SetSysInfo();
    DebugUI.FillSideBar();
    // DebugUI.SetHelpTable();


    console.info('The API Client has loaded.Feel free to explore this object in the console.');

    /*
        This is only available to the debug client. We 
        don't put this in normal requests from users... 
    */
    console.info(`
    
        Use : "ServerAPI" for easy code to help with testing.
        Use : "debugdata" in the console for the api data help.
    
    `);


    //Which screen do you want to show first? Are you debugging the debugger? lol
    // UIHelper.ShowTab('TabMain');
    UIHelper.ShowTab('TabDebugger');

 



};
