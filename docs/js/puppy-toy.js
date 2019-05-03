/*
*/



window.JSONTheif = {
    DocumentJSON: [],
    xhr(VERB, ROUTE, SENDMSG, OnData, OnError) {

        var xhttp = new XMLHttpRequest();


        xhttp.onreadystatechange = function () {

            if (this.readyState == 4 && this.status == 200) {
                if (this.responseText.length) {
                    try {
                        const srvData = JSON.parse(this.responseText);
                        OnData(srvData);
                    } catch (errBadJSON) {
                        OnData({
                            err: "Bad JSON!",
                            body: this.responseText
                        });

                    }

                } else {
                    OnData({
                        err: 'xhr empty data!',
                        v: VERB,
                        r: ROUTE,
                        s: SENDMSG
                    });

                }
            }


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

        xhttp.open(VERB, ROUTE, true);

        // CORS stuff...       
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhttp.setRequestHeader("Access-Control-Allow-Headers", "*");

        try {
            //Trying to trap the network errors?
            xhttp.send(JSON.stringify(SENDMSG));

        } catch (e) {
            debugger;
            console.log('gesh');
        }
    },
    LoadCSSLink(HREF2CSS) {
        const elLink = document.createElement("link");
        elLink.rel = "stylesheet";
        elLink.type = "text/css";
        elLink.href = HREF2CSS;
        document.head.appendChild(elLink);
    },
    SniffElement(ParentSniffElement, JSONData) {

        JSONData.items = [];


        for (var el in ParentSniffElement.childNodes) {
            const element = ParentSniffElement.childNodes[el];

            //Skip nodes that don't have a tag name...
            if (!element.nodeName) {
                continue;
            }

            /*
                Skip certain elements...
            */
            if (
                (element.nodeName == "JSONThiefDisplay") ||
                (element.nodeName == "#comment") ||
                (element.nodeName == "#text") ||
                (element.nodeName == "SCRIPT") ||
                (element.nodeName == "BR") ||
                (element.nodeName == "img")) {
                continue;
            }


            var elData = {
                tag: element.nodeName
            };
            JSONData.items.push(elData);

            if (element.nodeName == "P") {
                elData.text = element.innerText;
                continue;
            }




            // if (element.innerText == "nested") {
            //     debugger;
            // }
            if (element.childNodes.length == 1) {
                //Pick up the text of the element...
                if (element.childNodes[0].nodeName == "#text") {
                    elData.text = element.innerText;
                } else {
                    debugger;
                }
            } else {
                // JSONTheif.SniffElement(element, elData);
            }
        }



    },
    UI: {
        //This is our main hosting element...
        HostElement: null,
        HostElementMenu: null,
        AddResultRow(HTMLElement) {

            console.info('add', HTMLElement);
            // debugger;
            const ResultSearchBody = JSONTheif.UI.HostElement.querySelector('ResultsSearch tbody');

            // ResultSearchBody.innerHTML = "grrr"+RowData;

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
            <tr>
                <td>
                    <i class="fas fa-plus-circle"></i>
                    <i class="fas fa-minus-circle"></i>
                 
                </td>            
                <td>
                    N/A
                </td>
                <td>
                    <DisplayText>${HTMLElement.innerText}</DisplayText>                                    
                </td>
            </tr>            
            `;
            ResultSearchBody.appendChild(newRow);

        },
        Build() {


            //Build the Menu...
            (function () {
                var hostElMenu = document.body.appendChild(document.createElement('JSONThieMenu'));
                hostElMenu.innerHTML = `
                  <i class="fas fa-upload fa-2x"></i>
                `;
                hostElMenu.onclick = function (evt, others) {
                    JSONTheif.UI.HostElement.style.display = "block";
                    this.style.display = "none";
                };

                JSONTheif.UI.HostElementMenu = hostElMenu;

                console.warn('hide menu for debug');
                hostElMenu.style.display = "none";
            })();


            var hostEl = document.body.appendChild(document.createElement('JSONThiefDisplay'));

            console.warn('show host elfor debug');
            // hostEl.style.display = "none";

            JSONTheif.UI.HostElement = hostEl;




            (function () {


                const HTML = `                
                <JSONThiefDisplay>
                    <sidebaropts>
                        <icon class="fas fa-info-circle" id="info"></icon> 
                        <icon class="fas fa-search" id="search"></icon> 
                        <icon class="fas fa-cogs" id="options"></icon> 
                    </sidebaropts>
                    <qrybox>
                        <span class="label">Search:</span>
                        <span class="spantext"> 
                            <input type="text" id="qryTextValue" value="p"/>
                        </span>
                    </qrybox>
                    <ResultStats>
                        <statgroup>
                            <stlabel><i class="fas fa-code"></i> Total Tags</stlabel>                    
                            <stvalue id="TotalTags">N/A</stvalue>
                        </statgroup>
                        <statgroup>
                            <stlabel><i class="fas fa-cubes"></i> Total JSON Objects</stlabel>                    
                            <stvalue id="TotalJSONOBjects">N/A</stvalue>
                        </statgroup>                        
                    </ResultStats>

                    <ResultsSearch>
                        <table>
                            <thead>
                                <tr>
                                    <td width="20px">Options</td>                          
                                    <td width="30px">Tage Name</td>                           
                                    <td width="100%">Text Value</td>
                                <tr>                                                        
                            <thead>
                            <tbody>                         
                            </tbody>
                        </table>
                    </ResultsSearch>    
                </JSONThiefDisplay> 
                `;
                JSONTheif.UI.HostElement.innerHTML = HTML;

                var el_info = JSONTheif.UI.HostElement.querySelector('sidebaropts icon#info');
                el_info.onclick = function(){
                    console.log('CLicked:',this.id);
                };
                var el_search = JSONTheif.UI.HostElement.querySelector('sidebaropts icon#search');
                el_search.onclick = function(){
                    console.log('CLicked:',this.id);
                };
                var el_options = JSONTheif.UI.HostElement.querySelector('sidebaropts icon#options');
                el_options.onclick = function(){
                    console.log('CLicked:',this.id);
                };
              

            })();







            const qryTextValue = JSONTheif.UI.HostElement.querySelector('#qryTextValue');


            qryTextValue.addEventListener("change", function (eventinfo) {
                // debugger;

                const srchVal = this.value.trim();

                if (!srchVal) {
                    return;
                }

                console.info('Searching document for :' + srchVal);
                JSONTheif.UI.HostElement.querySelector('ResultsSearch tbody').innerHTML = "";

                // Make sure you do a full body search! :-) 
                const qryTags = document.body.querySelectorAll(srchVal);

                console.log('Total Tags Found:', qryTags);

                const TotalTags = JSONTheif.UI.HostElement.querySelector('stvalue#TotalTags');
                const TotalJSONOBjects = JSONTheif.UI.HostElement.querySelector('stvalue#TotalJSONOBjects');


                TotalTags.innerHTML = "" + qryTags.length + "";
                TotalJSONOBjects.innerHTML = "N/A";

                for (let index = 0; index < qryTags.length; index++) {
                    const qryElement = qryTags[index];
                    JSONTheif.UI.AddResultRow(qryElement);

                }
            });


            // setTimeout(() => {
            //     qryTextValue.focus();
            // }, 50);




        }
    },
    /*
        Lets get this part started!
    */
    Init() {


        var cssLinks = document.head.querySelectorAll('link');
        JSONTheif.FontAwesome = false;


        for (let index = 0; index < cssLinks.length; index++) {
            const docCSS = cssLinks[index];
            if (docCSS.href = "https://use.fontawesome.com/releases/v5.8.1/css/all.css") {
                JSONTheif.FontAwesome = true;
                break;
            }
        }

        if (!JSONTheif.FontAwesome) {
            JSONTheif.LoadCSSLink("https://use.fontawesome.com/releases/v5.8.1/css/all.css");
            JSONTheif.FontAwesome = true;
        }



        JSONTheif.LoadCSSLink("https://fonts.googleapis.com/css?family=Abel");
        JSONTheif.LoadCSSLink("https://fonts.googleapis.com/css?family=PT+Sans:400,400italic");
        JSONTheif.LoadCSSLink("https://fonts.googleapis.com/css?family=Roboto+Condensed:300");


        if ((document.location.hostname == "127.0.0.1") ||
            (document.location.hostname == "localhost") ||
            (document.location.hostname == "0.0.0.0")) {
            console.info('Loading CSS from local!');
            JSONTheif.LoadCSSLink("http://localhost:9080/?/css/puppy-toy.css");
        } else {
            console.info('Loading CSS from "demo.tektology.com"!');
            JSONTheif.LoadCSSLink("https://demo.tektology.com/?/css/puppy-toy.css");
        }


        console.info('Building UI for JSONThief');
        JSONTheif.UI.Build();

        JSONTheif.xhr('PUT', 'https://demo.tektology.com/', {
            service: 'help',
            data: {
                topic: 'SysInfo'
            }
        }, function (ServerResponse) {
            console.info('DEMO SERVER INFO', ServerResponse);
        });
    }
};




(function () {

    return;

    JSONTheif.SniffElement(document.body, JSONTheif.DocumentJSON);


    // ****

    for (var sp in JSONTheif.DocumentJSON) {
        console.log('FIX ME!-->', sp, JSONTheif.DocumentJSON[sp]);
    }
    // console.log(JSONTheif.DocumentJSON);

    // document.body.innerHTML = `<textarea rows="10" cols="40" style="height:100%;width;100%">${JSON.stringify(JSONData)}</textarea>`;


})();


JSONTheif.Init();
