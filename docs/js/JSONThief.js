/*
*/

// (function () {

//     const elLink = document.createElement("link");
//     elLink.rel = "stylesheet";
//     elLink.type = "text/css";
//     elLink.href = "http://localhost:9080/?/css/JSONThief.css";
//     document.head.appendChild(elLink);;
// })();


window.JSONTheif = {
    DocumentJSON: [],
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
        Build() {
            function StuffHTML() {

                const HTML = `                
                <JSONThiefDisplay>
                    <qrybox>
                        <span class="label">Search:</span>
                        <span class="spantext"> 
                            <input type="text" id="qryTextValue" value="p"/>
                        </span>
                    </qrybox>
                    <ResultStats>
                        <statgroup>
                            <stlabel>Total Tags</stlabel>                    
                            <stvalue id="TotalTags">N/A</stvalue>
                        </statgroup>
                        <statgroup>
                            <stlabel>Total JSON Objects</stlabel>                    
                            <stvalue id="TotalJSONOBjects">N/A</stvalue>
                        </statgroup>                        
                    </ResultStats>

                    <ResultsSearch>
                        <table>
                            <tr>
                                <td>
                                    <DisplayText>
                                    Working on this!
                                    </DisplayText>                                    
                                </td>
                            </tr>
                        </table>
                    </ResultsSearch>    
                </JSONThiefDisplay> 
                `;
                JSONTheif.UI.HostElement.innerHTML = HTML;
            }
            JSONTheif.UI.HostElement = document.body.appendChild(document.createElement('JSONThiefDisplay'));

            StuffHTML();


            const qryTextValue = JSONTheif.UI.HostElement.querySelector('#qryTextValue');


            qryTextValue.addEventListener("change", function (eventinfo) {
                // debugger;

                const srchVal = this.value.trim();

                if (!srchVal) {
                    return;
                }

                console.info('Searching document for :' + srchVal);

                // Make sure you do a full body search! :-) 
                const qryTags = document.body.querySelectorAll(srchVal);

                console.log('Total Tags Found:', qryTags);

                const TotalTags = JSONTheif.UI.HostElement.querySelector('stvalue#TotalTags');
                const TotalJSONOBjects = JSONTheif.UI.HostElement.querySelector('stvalue#TotalJSONOBjects');

                const ResultSearch = JSONTheif.UI.HostElement.querySelector('stvalue#ResultsSearch');
                // const ResultTable = ResultSearch.querySelector('table');
                // ResultTable.innerHTML = "";

                TotalTags.innerHTML = "" + qryTags.length + "";
                TotalJSONOBjects.innerHTML = "N/A";

            });


            setTimeout(() => {
                qryTextValue.focus();
            }, 50);




        }
    },
    /*
        Lets get this part started!
    */
    Init() {
        console.info('Building UI for JSONThief');
        JSONTheif.UI.Build();

    }
};
 
JSONTheif.LoadCSSLink("https://fonts.googleapis.com/css?family=Abel");
JSONTheif.LoadCSSLink("https://fonts.googleapis.com/css?family=PT+Sans:400,400italic");
JSONTheif.LoadCSSLink("https://fonts.googleapis.com/css?family=Roboto+Condensed:300");



if ("debug"=="debug"){
    //  http://demo.tektology.com/?/debug/src/HistoryLogger.css
    JSONTheif.LoadCSSLink("http://demo.tektology.com/?/css/JSONThief.css");
}else{
    JSONTheif.LoadCSSLink("http://localhost:9080/?/css/JSONThief.css");

}


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
