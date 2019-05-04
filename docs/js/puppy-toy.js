(function () {
    /*
    window.parent.puppytoy
    */

    window.puppytoy = {
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
            // document.head.appendChild(elLink);
            // debugger;
            puppytoy.UI.HostFrame.contentDocument.head.appendChild(elLink);
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
                    // puppytoy.SniffElement(element, elData);
                }
            }



        },
        UI: {
            HostFrame: null,
            //This is our main hosting element...
            HostElement: null,
            HostElementMenu: null,
            AddResultRow(HTMLElement) {
                if (!HTMLElement.innerText) {
                    return;
                }

                const ResultSearchBody = puppytoy.UI.HostElement.querySelector('ResultsSearch tbody');

                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <tr>
                        <td>
                            <i class="fas fa-plus-circle"></i>
                            <i class="fas fa-minus-circle"></i>
                        
                        </td>            
                        <td>
                            ${HTMLElement.nodeName}
                        </td>
                        <td>
                            ${HTMLElement.innerText}
                        </td>
                    </tr>            
                `;
                ResultSearchBody.appendChild(newRow);

            },
            ToggleMenu() {
                if (puppytoy.UI.HostElementMenu.style.display == "none") {
                    puppytoy.UI.HostElementMenu.style.display = "";
                    // puppytoy.UI.HostElement.style.display = "none";
                    puppytoy.UI.HostFrameContainer.style.display = "none";
                } else {
                    puppytoy.UI.HostElementMenu.style.display = "none";
                    // puppytoy.UI.HostElement.style.display = "";
                    puppytoy.UI.HostFrameContainer.style.display = "";
                }
            },
            Displays: {
                ActiveDisplay: false,
                ShowDisplay(ShowDisplayID) {
                    if (puppytoy.UI.Displays.ActiveDisplay) {
                        puppytoy.UI.Displays.ActiveDisplay.style.display = "none";
                    }
                    puppytoy.UI.Displays.ActiveDisplay = puppytoy.UI.HostElement.querySelector('#tab-' + ShowDisplayID);
                    puppytoy.UI.Displays.ActiveDisplay.style.display = "block";
                },
                MainHelp: {
                    Build() {

                        //BUild the first tab!!!
                        (function () {
                            const HTML = `
                        <br><br>
                        <center>
                           Simple help
                        </center> 
                           
                        `;
                            const newTab = document.createElement('disptab');
                            newTab.style.display = "none";
                            newTab.id = "tab-info";
                            newTab.innerHTML = HTML;

                            puppytoy.UI.HostElement.appendChild(newTab);
                        })();



                    }
                },
                Search: {
                    Build() {

                        //BUild the first tab!!!
                        (function () {
                            const HTML = `
                  
                        
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
                           
                `;
                            const newTab = document.createElement('disptab');
                            newTab.style.display = "none";
                            newTab.id = "tab-search";
                            newTab.innerHTML = HTML;

                            puppytoy.UI.HostElement.appendChild(newTab);
                        })();




                        //Do the document query..
                        const qryTextValue = puppytoy.UI.HostElement.querySelector('#qryTextValue');


                        qryTextValue.QueryElement = function () {

                            const srchVal = this.value.trim();

                            if (!srchVal) {
                                return;
                            }

                            console.info('Searching document for :' + srchVal);
                            puppytoy.UI.HostElement.querySelector('ResultsSearch tbody').innerHTML = "";

                            // Make sure you do a full body search! :-) 
                            const qryTags = document.body.querySelectorAll(srchVal);

                            console.log('Total Tags Found:', qryTags);

                            const TotalTags = puppytoy.UI.HostElement.querySelector('stvalue#TotalTags');
                            const TotalJSONOBjects = puppytoy.UI.HostElement.querySelector('stvalue#TotalJSONOBjects');


                            TotalTags.innerHTML = "" + qryTags.length + "";
                            TotalJSONOBjects.innerHTML = "N/A";

                            for (let index = 0; index < qryTags.length; index++) {
                                const qryElement = qryTags[index];
                                puppytoy.UI.AddResultRow(qryElement);

                            }
                        };


                        qryTextValue.addEventListener("change", function (eventinfo) {
                            this.QueryElement();
                        });
                        // setTimeout(() => {
                        //     qryTextValue.focus();
                        // }, 50);                    

                    }
                },
                Config: {
                    CheckServer() {
                        // puppytoy.UI.Displays.Config.CheckServer();

                        puppytoy.xhr('PUT', 'https://demo.tektology.com/', {
                            service: 'help',
                            data: {
                                topic: 'SysInfo'
                            }
                        }, function (ServerResponse) {
                            console.info('DEMO SERVER INFO', ServerResponse);
                        });

                    },
                    Build() {

                        //BUild the first tab!!!
                        (function () {
                            const HTML = `
                            <br><br>
                            <center>
                               Basic app options
                            </center>
                            <button onclick="window.parent.puppytoy.UI.Displays.Config.CheckServer();">test</button>
                           
                        `;
                            const newTab = document.createElement('disptab');
                            newTab.style.display = "none";
                            newTab.id = "tab-config";
                            newTab.innerHTML = HTML;

                            puppytoy.UI.HostElement.appendChild(newTab);
                        })();



                    }
                },
            },
            BuildUIDisplay() {


                //Build the Menu...
                (function () {
                    var hostElMenu = document.body.appendChild(document.createElement('JSONThieMenu'));
                    // <i class="fas fa-sitemap"></i>
                    hostElMenu.innerHTML = "*";

                    hostElMenu.style.position = "fixed";
                    hostElMenu.style.display = "block";

                    hostElMenu.style.zIndex = "5000";
                    hostElMenu.style.margin = "0";

                    hostElMenu.style.padding = "3px";

                    hostElMenu.style.top = "25px";
                    hostElMenu.style.right = "25px";

                    // hostElMenu.style.width = "40px";
                    hostElMenu.style.cursor = "hand";
                    hostElMenu.style.textOverflow = "default";
                    hostElMenu.style.backgroundColor = "rgb(56, 56, 56)";
                    hostElMenu.style.borderRadius = "20px";
                    hostElMenu.style.fontSize = "30px";
                    hostElMenu.style.textShadow = "1px 1px 1px rgb(253, 253, 253)";
                    hostElMenu.style.color = "gold";
                    hostElMenu.style.textAlign = "center";
                    // debugger;



                    hostElMenu.onclick = function (evt, others) {
                        puppytoy.UI.ToggleMenu();
                    };

                    puppytoy.UI.HostElementMenu = hostElMenu;
                })();











                // debugger;
                var hostEl = puppytoy.UI.HostFrame.contentDocument.body.appendChild(document.createElement('JSONThiefDisplay'));
                // var hostEl = document.body.appendChild(document.createElement('JSONThiefDisplay'));
                // hostEl.style.display = "none";
                puppytoy.UI.HostElement = hostEl;



                //Setup Main display and side opts...
                (function () {

                    const HTML = `                
               
                    <sidebaropts>                        
                        <icon class="fas fa-info-circle" id="info"></icon> 
                        <icon class="fas fa-search" id="search"></icon> 
                        <icon class="fas fa-cogs" id="config"></icon>                         
                        <hr/ width="70%" size="1" color="silver">
                        <icon class="fas fa-times-circle" id="close"></icon> 
                    </sidebaropts>
  
                `;
                    puppytoy.UI.HostElement.innerHTML = HTML;


                    //Setup events!
                    var el_close = puppytoy.UI.HostElement.querySelector('sidebaropts icon#close');
                    el_close.onclick = function () {
                        puppytoy.UI.ToggleMenu();
                    };
                    var el_info = puppytoy.UI.HostElement.querySelector('sidebaropts icon#info');
                    el_info.onclick = function () {
                        puppytoy.UI.Displays.ShowDisplay(this.id);
                    };
                    var el_search = puppytoy.UI.HostElement.querySelector('sidebaropts icon#search');
                    el_search.onclick = function () {
                        puppytoy.UI.Displays.ShowDisplay(this.id);
                    };
                    var el_config = puppytoy.UI.HostElement.querySelector('sidebaropts icon#config');
                    el_config.onclick = function () {
                        puppytoy.UI.Displays.ShowDisplay(this.id);
                    };


                })();


                puppytoy.UI.Displays.MainHelp.Build();
                puppytoy.UI.Displays.Search.Build();
                puppytoy.UI.Displays.Config.Build();


            },
            BuildHostFrame() {

                puppytoy.UI.HostFrameContainer = document.createElement('div');

                puppytoy.UI.HostFrameContainer.style.display = "none";
                puppytoy.UI.HostFrameContainer.style.zIndex = "5000";
                puppytoy.UI.HostFrameContainer.style.position = "fixed"
                puppytoy.UI.HostFrameContainer.style.margin = "0";
                puppytoy.UI.HostFrameContainer.style.padding = "0";
                puppytoy.UI.HostFrameContainer.style.top = "25px";
                puppytoy.UI.HostFrameContainer.style.left = "25px";
                puppytoy.UI.HostFrameContainer.style.right = "25px";
                puppytoy.UI.HostFrameContainer.style.bottom = "25px";
                puppytoy.UI.HostFrameContainer.style.backgroundColor = "gray";


                puppytoy.UI.HostFrame = document.createElement('iframe');
                puppytoy.UI.HostFrame.style.cssText = "width:100%;height:100%;margin:0;padding:0;border:0";

                puppytoy.UI.HostFrameContainer.appendChild(puppytoy.UI.HostFrame);
                document.body.appendChild(puppytoy.UI.HostFrameContainer);
                // debugger;
                // puppytoy.UI.HostFrame.contentDocument.body.innerText = "ready";

            }
        },
        /*
            Lets get this part started!
        */
        Init() {

            //Must build our host frame first!
            puppytoy.UI.BuildHostFrame();

            console.info('Building UI for JSONThief');
            puppytoy.UI.BuildUIDisplay();




            //Show your default display...
            puppytoy.UI.Displays.ShowDisplay('search');
            puppytoy.UI.ToggleMenu();

            // debugger;
            console.warn('take me out!')
            puppytoy.UI.HostElement.querySelector('#qryTextValue').QueryElement();



        }
    };







    puppytoy.Init();




    /*
        Load your styles you need. It will go in the iframe not the host document!!!!
    */
    puppytoy.LoadCSSLink("https://use.fontawesome.com/releases/v5.8.1/css/all.css");
    puppytoy.LoadCSSLink("https://fonts.googleapis.com/css?family=Abel");
    puppytoy.LoadCSSLink("https://fonts.googleapis.com/css?family=PT+Sans:400,400italic");
    puppytoy.LoadCSSLink("https://fonts.googleapis.com/css?family=Roboto+Condensed:300");


    if ((document.location.hostname == "127.0.0.1") ||
        (document.location.hostname == "localhost") ||
        (document.location.hostname == "0.0.0.0")) {
        console.info('Loading CSS from local!');
        puppytoy.LoadCSSLink("http://localhost:9080/?/css/puppy-toy.css");
    } else {
        console.info('Loading CSS from "demo.tektology.com"!');
        puppytoy.LoadCSSLink("https://demo.tektology.com/?/css/puppy-toy.css");
    }


})();