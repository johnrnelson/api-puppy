/*
    This script file gets loaded into the iframe.
*/

console.log("puppy-toy-frame.js");

const pupframe = {

    LoadCSSLink(HREF2CSS) {
        const elLink = document.createElement("link");
        elLink.rel = "stylesheet";
        elLink.type = "text/css";
        elLink.href = HREF2CSS;
        // document.head.appendChild(elLink);
        // debugger;
        document.head.appendChild(elLink);
    },
    xhr(VERB, ROUTE, SENDMSG, OnData, OnError) {

        var xhttp = new XMLHttpRequest();


        xhttp.onreadystatechange = function () {




            if (this.readyState == 4 && this.status == 200) {
                if (this.responseText.length) {
                    try {
                        OnData(null, this.responseText);
                    } catch (errBadJSON) {
                        OnData(errBadJSON, null);
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
        xhttp.onerror = function (ErrorInfo) {
            if (!OnError) {
                console.warn('Error XHR:' + VERB + ':' + ROUTE + ' ST:' + xhttp.status);
            } else {
                OnError({
                    VERB: VERB,
                    ROUTE: ROUTE,
                    ST: xhttp.status
                });
            }
        };

        xhttp.open(VERB, ROUTE, true);

        // CORS stuff...       
        // xhttp.setRequestHeader("Content-Type", "application/json");
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
    //=======
    UI: {
        HostFrame: null,
        //This is our main hosting element...
        HostElement: null,
        HostElementMenu: null,
        AddResultRow(HTMLElement) {
            if (!HTMLElement.innerText) {
                return;
            }

            const ResultSearchBody = pupframe.UI.HostElement.querySelector('ResultsSearch tbody');

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
        GetHTML(URL, OnHTML) {

            pupframe.xhr('GET', URL, "", function (err, ServerResponse) {
                OnHTML(err, ServerResponse);
            });
        },

        Displays: {
            ActiveDisplay: false,
            ShowDisplay(ShowDisplayID) {
                if (pupframe.UI.Displays.ActiveDisplay) {
                    pupframe.UI.Displays.ActiveDisplay.style.display = "none";
                }
                pupframe.UI.Displays.ActiveDisplay = pupframe.UI.HostElement.querySelector('#tab-' + ShowDisplayID);
                pupframe.UI.Displays.ActiveDisplay.style.display = "block";
            },

            MainHelp: {
                Build(OnBuild) {

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

                        pupframe.UI.HostElement.appendChild(newTab);
                    })();

                    OnBuild();

                }
            },
            Search: {
                Build(OnBuild) {

                    //BUild the first tab!!!
                    (function () {

                        const HTML = `                        
                            <qrybox>
                                <span class="label">Search:</span>
                                <span class="spantext"> 
                                    <input type="text" id="qryTextValue" value="" placeholder="Enter Query String"/>
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

                        pupframe.UI.HostElement.appendChild(newTab);
                    })();




                    //Do the document query..
                    const qryTextValue = pupframe.UI.HostElement.querySelector('#qryTextValue');


                    qryTextValue.QueryElement = function () {

                        const srchVal = this.value.trim();

                        if (!srchVal) {
                            return;
                        }

                        // debugger;
                        console.info('Searching document for :' + srchVal);
                        pupframe.UI.HostElement.querySelector('ResultsSearch tbody').innerHTML = "";

                        // Make sure you do a full body search! :-) 
                        const qryTags = window.parent.document.body.querySelectorAll(srchVal);

                        console.log('Total Tags Found:', qryTags);

                        const TotalTags = pupframe.UI.HostElement.querySelector('stvalue#TotalTags');
                        const TotalJSONOBjects = pupframe.UI.HostElement.querySelector('stvalue#TotalJSONOBjects');


                        TotalTags.innerHTML = "" + qryTags.length + "";
                        TotalJSONOBjects.innerHTML = "N/A";

                        for (let index = 0; index < qryTags.length; index++) {
                            const qryElement = qryTags[index];
                            pupframe.UI.AddResultRow(qryElement);

                        }
                    };


                    qryTextValue.addEventListener("change", function (eventinfo) {
                        this.QueryElement();
                    });
                    // setTimeout(() => {
                    //     qryTextValue.focus();
                    // }, 50);   

                    OnBuild();

                }
            },
            Config: {
                CheckServer() {
                    var url = 'https://demo.tektology.com/';

                    pupframe.xhr('PUT', url, {
                        service: 'help',
                        data: {
                            topic: 'SysInfo'
                        }
                    }, function (err, ServerResponse) {
                        const srvData = JSON.parse(ServerResponse);
                        console.info('DEMO SERVER INFO', srvData);
                    });

                },
                Build(OnBuild) {
                    console.info('Fix the rest of the displays!')
                    // debugger;
                    var url;
                    if (window.parent.puppytoy.IsLocalDebug()) {

                        url = '/docs/puppy-toy/panels/config.html';
                    } else {
                        url = 'https://demo.tektology.com/?/puppy-toy/panels/config.html';
                    }

                    // console.log(url);

                    pupframe.UI.GetHTML(url, function (err, ConfigHTML) {
                        if (err) {
                            console.warn(err);
                            return;
                        }
                        const newTab = document.createElement('disptab');
                        newTab.style.display = "none";
                        newTab.id = "tab-config";
                        newTab.innerHTML = ConfigHTML;

                        pupframe.UI.HostElement.appendChild(newTab);
                        OnBuild();
                    });
                }
            },
        },



        BuildUIDisplay() {


            //Build the Menu...
            (function () {

            })();



            var hostEl = document.body.appendChild(document.createElement('JSONThiefDisplay'));
            // var hostEl = document.body.appendChild(document.createElement('JSONThiefDisplay'));
            // hostEl.style.display = "none";
            pupframe.UI.HostElement = hostEl;



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
                pupframe.UI.HostElement.innerHTML = HTML;


                //Setup events!
                var el_close = pupframe.UI.HostElement.querySelector('sidebaropts icon#close');
                el_close.onclick = function () {
                    window.parent.puppytoy.ToggleMenu();
                };
                var el_info = pupframe.UI.HostElement.querySelector('sidebaropts icon#info');
                el_info.onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };
                var el_search = pupframe.UI.HostElement.querySelector('sidebaropts icon#search');
                el_search.onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };
                var el_config = pupframe.UI.HostElement.querySelector('sidebaropts icon#config');
                el_config.onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };


            })();

            var totalDisplay = 3;

            pupframe.UI.Displays.MainHelp.Build(function () {
                console.info('mmmm***');
            });
            pupframe.UI.Displays.Search.Build(function () {
                console.info('sss***');
            });
            pupframe.UI.Displays.Config.Build(function () {
                console.info('bbbb***');
            });


        },
        BuildHostFrame() {

        }
    },
    /*
        Lets get this part started!
    */
    Init() {

        // debugger;

        console.info('Building UI for JSONThief');
        pupframe.UI.BuildUIDisplay();




        window.parent.puppytoy.ToggleMenu();

        // When debugging use this to quickly get to where you need...
        setTimeout(() => {
            //Show your default display...
            // pupframe.UI.Displays.ShowDisplay('info');
            pupframe.UI.Displays.ShowDisplay('search');            
            // pupframe.UI.Displays.ShowDisplay('config');
        }, 500);


    }
};



/*
    Load your styles you need. It will go in the iframe not the host document!!!!
*/
pupframe.LoadCSSLink("https://use.fontawesome.com/releases/v5.8.1/css/all.css");
pupframe.LoadCSSLink("https://fonts.googleapis.com/css?family=Abel");
pupframe.LoadCSSLink("https://fonts.googleapis.com/css?family=PT+Sans:400,400italic");
pupframe.LoadCSSLink("https://fonts.googleapis.com/css?family=Roboto+Condensed:300");

if ((window.parent.location.hostname == "127.0.0.1") ||
    (window.parent.location.hostname == "localhost") ||
    (window.parent.location.hostname == "0.0.0.0")) {
    console.info('Loading CSS from local!');
    pupframe.LoadCSSLink("http://localhost:9080/?/puppy-toy/puppy-toy.css");
} else {
    console.info('Loading CSS from "demo.tektology.com"!');
    pupframe.LoadCSSLink("https://demo.tektology.com/?/puppy-toy/puppy-toy.css");
}



pupframe.Init();

