/*
    This script file gets loaded into the iframe.
*/


//Add Ace Editor...
(function () {
    var NEWSCRIPT = document.createElement("script");
    NEWSCRIPT.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.3/ace.js";
    document.head.appendChild(NEWSCRIPT);
})();

const pupframe = {

    LoadCSSLink(HREF2CSS) {
        const elLink = document.createElement("link");
        elLink.rel = "stylesheet";
        elLink.type = "text/css";
        elLink.href = HREF2CSS;
        document.head.appendChild(elLink);
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
        /*
            Manage the displays...
        */
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
                ClearLog() {
                    if (!pupframe.UI.Displays.MainHelp.LogList) {
                        pupframe.UI.Displays.MainHelp.LogList = document.querySelector(".QuickLog .QuickLogList");
                    }
                    pupframe.UI.Displays.MainHelp.LogList.innerHTML = "";
                },
                AddLog(LogItem) {
                    // debugger;
                    if (!pupframe.UI.Displays.MainHelp.LogList) {
                        pupframe.UI.Displays.MainHelp.LogList = document.querySelector(".QuickLog .QuickLogList");
                    }
                    // const logBlock = document.querySelector(".QuickLog .QuickLogList");
                    // debugger;
                    const newLog = document.createElement('QuickLogItem');
                    const nowDT = new Date();

                    const logHTML = `                
                    <lgdt>${nowDT.toLocaleTimeString()}</lgdt><topic>${LogItem.topic}</topic>
                    <lgbody>${LogItem.body}</lgbody>`;
                    newLog.innerHTML = logHTML;
                    pupframe.UI.Displays.MainHelp.LogList.appendChild(newLog);
                },
                Build(OnBuild) {


                    var url;

                    if (window.parent.puppytoy.IsLocalDebug()) {

                        url = '/docs/puppy-toy/panels/info.html';
                    } else {
                        url = 'https://demo.tektology.com/?/puppy-toy/panels/info.html';
                    }

                    // console.log(url);

                    window.parent.puppytoy.GetHTML(url, function (err, HelpHTML) {
                        if (err) {
                            console.warn('Bad URL-->', url);
                            console.warn(err);
                            // debugger;
                            return;
                        }
                        const newTab = document.createElement('disptab');
                        newTab.style.display = "none";
                        newTab.id = "tab-info";
                        newTab.innerHTML = HelpHTML;
                        pupframe.UI.HostElement.appendChild(newTab);


                        document.getElementById('StatsList-TotalTags').innerHTML = "" + window.parent.document.body.childElementCount + "";

                        document.getElementById('StatsList-LocalStorage').innerHTML = "" + localStorage.length + "";



                        // debugger;
                        const totalCookies = document.cookie.split(';').length;
                        const sizeCookies = document.cookie.length;

                        // const doh = cookieJSON.reduce((res, c) => {
                        //   const [key, val] = c.trim().split('=').map(decodeURIComponent)
                        //   const allNumbers = str => /^\d+$/.test(str);
                        //   try {
                        //     return Object.assign(res, { [key]: allNumbers(val) ?  val : JSON.parse(val) })
                        //   } catch (e) {
                        //     return Object.assign(res, { [key]: val })
                        //   }
                        // }, {});

                        document.getElementById('StatsList-TotalCookies').innerHTML = "" + totalCookies + "";
                        document.getElementById('StatsList-CookiesLength').innerHTML = "" + sizeCookies + "";




                        if (window.parent.jQuery) {
                            document.getElementById('VersionInfo-jQuery').innerHTML = window.parent.jQuery.fn.jquery;
                        } else {
                            // jQuery is not loaded
                            document.getElementById('VersionInfo-jQuery').innerHTML = "Not Installed";
                        }

                        OnBuild();
                    });



                }
            },

            Config: {
                CheckServer() {
                    var url = 'https://demo.tektology.com/';

                    window.parent.puppytoy.xhr('PUT', url, {
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
                    // console.info('Fix the rest of the displays!')
                    // debugger;
                    var url;
                    if (window.parent.puppytoy.IsLocalDebug()) {

                        url = '/docs/puppy-toy/panels/config.html';
                    } else {
                        url = 'https://demo.tektology.com/?/puppy-toy/panels/config.html';
                    }

                    // console.log(url);

                    window.parent.puppytoy.xhr('GET', url, "", function (err, ConfigHTML) {
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
            Search: {
                Build(OnBuild) {

                    //BUild the first tab!!!
                    (function () {




                        var url;
                        if (window.parent.puppytoy.IsLocalDebug()) {

                            url = '/docs/puppy-toy/panels/search.html';
                        } else {
                            url = 'https://demo.tektology.com/?/puppy-toy/panels/search.html';
                        }

                        // console.log(url);

                        window.parent.puppytoy.xhr('GET', url, "", function (err, searchHTML) {
                            if (err) {
                                console.warn(err);
                                return;
                            }


                            const newTab = document.createElement('disptab');
                            newTab.style.display = "none";
                            newTab.id = "tab-search";
                            newTab.innerHTML = searchHTML;

                            pupframe.UI.HostElement.appendChild(newTab);






                            //Do the document query..
                            const qryTextValue = pupframe.UI.HostElement.querySelector('#qryTextValue');


                            qryTextValue.QueryElement = function () {

                                const srchVal = this.value.trim();

                                if (!srchVal) {
                                    return;
                                }

                                // debugger;
                                // console.info('Searching document for :' + srchVal);
                                pupframe.UI.HostElement.querySelector('ResultsSearch tbody').innerHTML = "";

                                // Make sure you do a full body search! :-) 
                                const qryTags = window.parent.document.body.querySelectorAll(srchVal);

                                // console.log('Total Tags Found:', qryTags);

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
                        });
                    })();




                }
            },
            //--------

            ServiceEditor: {



















                RunService() {
                    
                    try {
                        var url = 'https://demo.tektology.com/';
                        // debugger;
                        const JSONText = pupframe.UI.Displays.ServiceEditor.Ace.getValue();
                        const ServiceInfo = JSON.parse(JSONText);

                        // pupframe.UI.Displays.ServiceEditor.Ace
                        window.parent.puppytoy.xhr('PUT', url, ServiceInfo,
                            function (err, ServerResponse) {
                                const srvData = JSON.parse(ServerResponse);
                                // console.info('SERVER INFO', srvData);
                          
                                parent.puppytoy.DebugMe(srvData);
                            });

                    } catch (errJSON) {
                        console.warn('JSON not valid!')
                    }


                },

                Build(OnBuild) {


                    var url;

                    if (window.parent.puppytoy.IsLocalDebug()) {

                        url = '/docs/puppy-toy/panels/editor.html';
                    } else {
                        url = 'https://demo.tektology.com/?/puppy-toy/panels/editor.html';
                    }

                    console.log('loaded srv edit');

                    window.parent.puppytoy.GetHTML(url, function (err, HelpHTML) {
                        if (err) {
                            console.warn('Bad URL-->', url);
                            console.warn(err);
                            // debugger;
                            return;
                        }
                        const newTab = document.createElement('disptab');
                        newTab.style.display = "none";
                        newTab.id = "tab-ServiceEditor";
                        newTab.innerHTML = HelpHTML;
                        pupframe.UI.HostElement.appendChild(newTab);


                        OnBuild();
                    });



                }
            },
            //--------
        },

        BuildUIDisplay() {


            pupframe.UI.HostElement = document.body.appendChild(document.createElement('puppy-toy-display'));



            //Setup side opts...
            (function () {

                const HTML = `                
           
                <sidebaropts>                        
                    <icon title="Main Information Panel" class="fas fa-info-circle" id="info"></icon> 
                    <icon title="Search Tags" class="fas fa-search" id="search"></icon> 
                    <icon title="Service Editor" class="fas fa-edit" id="ServiceEditor"></icon>                         
                    <icon title="Configure" class="fas fa-cogs" id="config"></icon>                         
                    <hr/ width="70%" size="1" color="silver">
                    <icon title="Debug Page" class="fas fa-bug" id="debug-host"></icon>                         
                    <icon title="Debug Frame" class="fas fa-spider" id="debug-frame"></icon>                         
                    <hr/ width="70%" size="1" color="silver">
                    <icon title="Close this window" class="fas fa-times-circle" id="close"></icon> 
                </sidebaropts>

                `;
                pupframe.UI.HostElement.innerHTML = HTML;


                //Setup events!
                pupframe.UI.HostElement.querySelector('sidebaropts icon#close').onclick = function () {
                    window.parent.puppytoy.ToggleMenu();
                };
                pupframe.UI.HostElement.querySelector('sidebaropts icon#ServiceEditor').onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };
                pupframe.UI.HostElement.querySelector('sidebaropts icon#info').onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };
                pupframe.UI.HostElement.querySelector('sidebaropts icon#search').onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };
                pupframe.UI.HostElement.querySelector('sidebaropts icon#config').onclick = function () {
                    pupframe.UI.Displays.ShowDisplay(this.id);
                };
                pupframe.UI.HostElement.querySelector('sidebaropts icon#debug-host').onclick = function () {
                    window.parent.puppytoy.DebugMe();

                };




                pupframe.UI.HostElement.querySelector('sidebaropts icon#debug-frame').onclick = function () {
                    /*
                        This is the frame javascript...
                    */
                    debugger;
                };

            })();


        },



        Ace: {
            //Set this in code when you are ready...
            AceEditor: null,
            //Set this in code when you are ready...        
            AceDisplayRsults: null,

            //Make sure we deal with change to the editor...
            HookEvents(Editor2Hook) {
                Editor2Hook.getSession().on('change', function (delta) {
                    const editorJSON = Editor2Hook.getValue();
                    // console.info('-->',editorJSON);
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
            BuildAceControls(ControlID) {

                if (!ace) {
                    debugger;

                    setTimeout(() => {
                        debugger;
                    }, 3000);

                }

                (function () {
                    var NEWSCRIPT = document.createElement("script");
                    NEWSCRIPT.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.3/ext-language_tools.js";
                    document.head.appendChild(NEWSCRIPT);
                })();

                var AceEditor = pupframe.UI.Ace.SetupAceEditorDefaults(ControlID);
                // var another = pupframe.UI.Ace.SetupAceEditorDefaults('APIDebugResults');

                //Make sure display is read only!
                // pupframe.UI.Ace.AceEditor.setReadOnly(true);

                AceEditor.setTheme("ace/theme/monokai");

                //Only hook the actual editor!!!!!
                pupframe.UI.Ace.HookEvents(AceEditor);

 

                const defaultOPTS = {
                    service: 'help',
                    data: {
                        topic: 'SysInfo'
                    }
                };

                // debugger;
                AceEditor.setValue(JSON.stringify(defaultOPTS, null, '\t'), -1);
                setTimeout(() => {

                    AceEditor.setOptions({
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                    });
                }, 500);


                return AceEditor;

            }
        },




    },
    /*
        Grab all the resources you need and start building the DOM...
    */
    Init() {

        /*
            Load your styles you need. It will go in the iframe not the host document!!!!
        */
        pupframe.LoadCSSLink("https://use.fontawesome.com/releases/v5.8.1/css/all.css");
        pupframe.LoadCSSLink("https://fonts.googleapis.com/css?family=Abel");
        pupframe.LoadCSSLink("https://fonts.googleapis.com/css?family=PT+Sans:400,400italic");
        pupframe.LoadCSSLink("https://fonts.googleapis.com/css?family=Roboto+Condensed:300");



        if (window.parent.puppytoy.IsLocalDebug()) {
            console.info('Loading CSS from local!');
            pupframe.LoadCSSLink("/docs/puppy-toy/css/puppy-toy.css");
            pupframe.LoadCSSLink("/docs/puppy-toy/css/info.css");
            pupframe.LoadCSSLink("/docs/puppy-toy/css/editor.css");
            pupframe.LoadCSSLink("/docs/puppy-toy/css/config.css");
        } else {
            console.info('Loading CSS from "demo.tektology.com"!');
            pupframe.LoadCSSLink("https://demo.tektology.com/?/puppy-toy/css/puppy-toy.css");
            pupframe.LoadCSSLink("https://demo.tektology.com/?/puppy-toy/css/info.css");
            pupframe.LoadCSSLink("https://demo.tektology.com/?/puppy-toy/css/editor.css");
            pupframe.LoadCSSLink("https://demo.tektology.com/?/puppy-toy/css/config.css");
        }


        console.info('Building UI for puppy-toy!');
        pupframe.UI.BuildUIDisplay();



        /*
            Edit this to quickly get to where you want to 
            go for debugging...
        */
        pupframe.UI.Displays.MainHelp.Build(function () {



            pupframe.UI.Displays.MainHelp.AddLog({
                topic: 'Main Help has loaded',
                body: 'UI is ready to go!'
            });



            // pupframe.UI.Displays.ShowDisplay('info');

            //Nest this in case they want to use the log!
            pupframe.UI.Displays.Search.Build(function () {
                // pupframe.UI.Displays.ShowDisplay('search');
            });
            pupframe.UI.Displays.Config.Build(function () {

                //Setup all of our ace editors...



                // pupframe.UI.Displays.ShowDisplay('config');
            });
            pupframe.UI.Displays.ServiceEditor.Build(function () {

                pupframe.UI.Displays.ServiceEditor.Ace = pupframe.UI.Ace.BuildAceControls('ServiceJSON');
                pupframe.UI.Displays.ShowDisplay('ServiceEditor');
            });
        });




        //Can change this if you prefer..
        window.parent.puppytoy.ToggleMenu();


        (function () {
            // When debugging use this to quickly get to where you need...
            setTimeout(() => {
                //Show your default display...
                // pupframe.UI.Displays.ShowDisplay('info');
                // pupframe.UI.Displays.ShowDisplay('search');
                // pupframe.UI.Displays.ShowDisplay('config');

            }, 500);
        })();

    }
};


setTimeout(() => {
    pupframe.Init();
}, 200);

