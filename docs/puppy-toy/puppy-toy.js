/*
    This file runs in the main page context. It's added directly into the DOM.
*/
(function () {
    /*
    window.parent.puppytoy
    */

    window.puppytoy = {
        DocumentJSON: [],
        UI: {},
        HostURL() {
            // puppytoy.HostURL()
            return "" + parent.location.protocol + "/" + parent.location.host + "";

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


            if (puppytoy.IsLocalDebug() == "sdfsdf") {
                console.info('Loading "puppy-toy-frame.js" from ' + puppytoy.HostURL());

                const scriptFile = puppytoy.UI.HostFrame.contentDocument.createElement("script");
                // scriptFile.src = puppytoy.HostURL() + "/?/puppy-toy/puppy-toy-frame.js";
                scriptFile.src = puppytoy.HostURL() + "docs/puppy-toy/puppy-toy-frame.js";
                
                console.info('URL--',puppytoy.HostURL() + "/docs/puppy-toy/puppy-toy-frame.js");

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