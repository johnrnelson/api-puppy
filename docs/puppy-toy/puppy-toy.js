/*
    This file runs in the main page context. It's added directly into the DOM.
*/
(function () {
    /*
    
    */

    window.puppytoy = {
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
                        }, null);

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

            //Trying to trap the network errors?

            if (SENDMSG) {
                xhttp.send(JSON.stringify(SENDMSG));
            } else {
                xhttp.send(SENDMSG);
            }

        },
        GetHTML(URL, OnHTML) {

            puppytoy.xhr('GET', URL, "", function (err, ServerResponse) {
                OnHTML(err, ServerResponse);
            });
        },
        DubugMe() {
            /*
                This is the host page javascript...
            */
            debugger;
        },
        DocumentJSON: [],
        UI: {},
        HostURL() {
            // puppytoy.HostURL()
            const URL = "" + parent.location.protocol + "/" + parent.location.host + "";
            // debugger;
            return URL;

        },
        IsLocalDebug() {
            // (document.location.hostname == "dev.johnrnelson.com") ||
            if ((document.location.hostname == "127.0.0.1") ||
                (document.location.hostname == "localhost") ||
                (document.location.hostname == "dev.johnrnelson.com") ||
                (document.location.hostname == "0.0.0.0")) {
                return true;
            } else {
                return false;
            }

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
                    (element.nodeName == "iframe") ||
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

        ToggleMenu() {

            //save state of body scroll...
            if (puppytoy.BodyScroll == undefined) {
                puppytoy.BodyScroll = document.body.style.overflow;
            }

            if (puppytoy.UI.HostElementMenu.style.display == "none") {
                puppytoy.UI.HostElementMenu.style.display = "";
                document.body.style.overflow = puppytoy.BodyScroll;
                puppytoy.UI.HostFrameContainer.style.display = "none";
            } else {
                puppytoy.UI.HostElementMenu.style.display = "none";
                document.body.style.overflow = "hidden";
                puppytoy.UI.HostFrameContainer.style.display = "";
            }
        },
        BuildMenu() {
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
                puppytoy.ToggleMenu();
            };

            puppytoy.UI.HostElementMenu = hostElMenu;
        },
        BuildIFrame() {



            puppytoy.UI.HostFrameContainer = document.createElement('IFRAMEHOST');
            puppytoy.UI.HostFrameContainer.style.display = "none";
            puppytoy.UI.HostFrameContainer.style.position = "fixed";

            puppytoy.UI.HostFrameContainer.style.zIndex = "5000";
            puppytoy.UI.HostFrameContainer.style.margin = "0";
            puppytoy.UI.HostFrameContainer.style.padding = "0";
            puppytoy.UI.HostFrameContainer.style.top = "0";
            puppytoy.UI.HostFrameContainer.style.left = "0";
            puppytoy.UI.HostFrameContainer.style.right = "0";
            puppytoy.UI.HostFrameContainer.style.bottom = "0";
            puppytoy.UI.HostFrameContainer.style.backgroundColor = "gray";

            puppytoy.UI.HostFrame = document.createElement('iframe');

            // This will make contentDocument unavailable!!!!
            // puppytoy.UI.HostFrame.src = "http://localhost:9080/?/puppy-toy/puppy-toy.html";

            puppytoy.UI.HostFrame.style.cssText = "width:100%;height:100%;margin:0;padding:0;border:0";



            puppytoy.UI.HostFrameContainer.appendChild(puppytoy.UI.HostFrame);

            document.body.appendChild(puppytoy.UI.HostFrameContainer);


            if (puppytoy.IsLocalDebug()) {
                console.info('Loading "puppy-toy-frame.js" from ' + puppytoy.HostURL());
                const scriptFile = puppytoy.UI.HostFrame.contentDocument.createElement("script");
                scriptFile.src = "http://localhost:9080/?/puppy-toy/puppy-toy-frame.js";
                puppytoy.UI.HostFrame.contentDocument.head.appendChild(scriptFile);
            } else {
                console.info('Loading "puppy-toy-frame.js" from "demo.tektology.com"!');
                const scriptFile = puppytoy.UI.HostFrame.contentDocument.createElement("script");
                scriptFile.src = "https://demo.tektology.com/?/puppy-toy/puppy-toy-frame.js";
                puppytoy.UI.HostFrame.contentDocument.head.appendChild(scriptFile);
            }
        }
    };


    window.puppytoy.BuildMenu();
    window.puppytoy.BuildIFrame();
})();