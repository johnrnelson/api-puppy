// DebuggerUI


/*
    Wrap up what ya want to make dealing with the UI as easy 
    as possible...
*/
const DebugUI = {
 


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
