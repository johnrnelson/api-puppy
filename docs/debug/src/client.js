/*
    WebApp is the main namespace used so add your own
    modules to this one to prevent collision.
*/

const WebApp = {
    /*
        Quick and easy way to get data from our api...
        Ex: WebApp.Fetch
    */
    Fetch(data = {}) {
        const url = document.URL + '';

        //Allways add the APIKEY to outbound requests to the server...
        data.APIKEY = WebApp.AppPrefs.UserOptions.APIKEY;


        return fetch(url, {
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
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        }).then(response => response.json()); // parses JSON response into native Javascript objects 

    },
    GetHelpFile(FilePath, OnFetch) {
        // WebApp.GetHelpFile('',function(){});

        WebApp.Fetch({
            service: 'help',
            data: {
                topic: 'debug-code-fetch',
                filepath: FilePath
            }
        }).then(data => {
            if (data.err) {
                console.warn(data.err);
            } else {
                OnFetch(data);
            }


        }).catch(error => {
            console.warn('Error!');
            console.error(error);
            // debugger;
        });

    },
    LoadCSSLink(HREF2CSS) {
        const elLink = document.createElement("link");
        elLink.rel = "stylesheet";
        elLink.type = "text/css";
        elLink.href = HREF2CSS;
        document.head.appendChild(elLink);
    },

    //Your local app preferences...
    AppPrefs: {
        UserOptions: {
            APIKEY: '',
            UserID: '',
            TargetAPI: {
                url: document.URL,
                opts: {
                    favor: 'put'
                }
            },
            UI: {
                UseToast: true,
            },
            Socket: {
                Ignore: false
            }

        },
    }
};


if (localStorage) {
    const UserOptionsText = localStorage.getItem('UserOptions');

    if (UserOptionsText) {
        console.info('Reloading App options....');
        WebApp.AppPrefs.UserOptions = JSON.parse(UserOptionsText);
    }  

} else {
    alert('No Local Storage!');
}

 


//Lazy load the google fonts We don't need to wait for them...

WebApp.LoadCSSLink("https://fonts.googleapis.com/css?family=Abel");
WebApp.LoadCSSLink("https://fonts.googleapis.com/css?family=PT+Sans:400,400italic");
WebApp.LoadCSSLink("https://fonts.googleapis.com/css?family=Roboto+Condensed:300");




/*
    After page has loaded, you can be sure that everything you need
    is already loaded and ready to go...
*/
window.onload = function () {

    /* 
        Extra Helper code...
    */
    WebApp.GetHelpFile('UIHelper.js', function (UIHelperJSCode) {



        //Make sure you load the logger first so we can report errors quicky! 
        WebApp.GetHelpFile('HistoryLogger.html', function (HistoryLoggerHTML) {

            document.getElementById("HistoryLogger").innerHTML = HistoryLoggerHTML.body;


 

            //Now show the sys info in the main display...
            /*
                History Logger UI supporting javascript...
            */
            WebApp.GetHelpFile('HistoryLogger.js', function (HistoryLoggerCode) {
                window.eval(HistoryLoggerCode.body);

                // debugger;
                window.eval(UIHelperJSCode.body);

            });

        });



    }); //end UIHelper....

};
