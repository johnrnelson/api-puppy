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
            }
        },
    }
};


if (localStorage) {
    const UserOptionsText = localStorage.getItem('UserOptions');

    if (UserOptionsText) {
        console.info('Reloading App options....');
        WebApp.AppPrefs.UserOptions = JSON.parse(UserOptionsText);
    } else {
        console.info('Storing (local) App options....');
        localStorage.setItem("UserOptions", JSON.stringify(WebApp.AppPrefs.UserOptions));
    }

} else {
    alert('No Local Storage!');
}


/* 
    Go grab our styles using the API to show an example of
    another way to use it. Of course you don't want to 
    actually get your CSS files this way, but it's yet
    another example of how to use a web API...
*/
WebApp.GetHelpFile('debug.css', function (filecontents) {
    const CSSFile = document.createElement("style");
    CSSFile.type = "text/css";
    CSSFile.innerHTML = filecontents.body;
    document.head.appendChild(CSSFile);
});


/*
    Load our debugger ui supporting javascript...
*/
WebApp.GetHelpFile('DebuggerUI.js', function (filecontents) {
    const srcScript = document.createElement("script");
    srcScript.innerHTML = filecontents.body;
    document.head.appendChild(srcScript);
});




/*
    History Logger UI supporting javascript...
*/
WebApp.GetHelpFile('HistoryLogger.js', function (filecontents) {
    const srcScript = document.createElement("script");
    srcScript.innerHTML = filecontents.body;
    document.head.appendChild(srcScript);
 
});


/*
    Help Display UI supporting javascript...
*/
WebApp.GetHelpFile('HelpDisplay.js', function (filecontents) {
    const srcScript = document.createElement("script");
    srcScript.innerHTML = filecontents.body;
    document.head.appendChild(srcScript); 
});





/*
    After page has loaded, you can be sure that everything you need
    is already loaded and ready to go...
*/
window.onload = function () {

    /* 
        Extra Helper code...
    */
    WebApp.GetHelpFile('UIHelper.js', function (filecontents) {

        // debugger;
        window.eval(filecontents.body);
 

        HistoryLogger.Logger.Add({
            TID: 0,
            Type: 707,
            DT: new Date(),
            Topic: "UI Status",
            Source: "Browser",
            Body: "The browser UI should be loaded and ready to go!",
        });



        //Which screen do you want to show first? Are you debugging the debugger? lol
        UIHelper.ShowTab('TabMain');



        //If you local host you are most likely debugging.. :-)
        if (document.location.hostname == "localhost") {
            // debugger;
            // UIHelper.ShowTab('TabDebugger');
            // UIHelper.ShowTab('HistoryLogger');
            // UIHelper.ShowTab('GitHubLinks');
            // UIHelper.ShowTab('TabAppPrefs');
        }


    }); //end UIHelper....

};
