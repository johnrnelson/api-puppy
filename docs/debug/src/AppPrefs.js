/*
    Manage the application preferences in the UI...
*/
WebApp.AppPrefsManager = {

    ShowPrefs() {
        const appPrefsHTML = document.getElementById("TabAppPrefs");
        const UserOptions = WebApp.AppPrefs.UserOptions;

        //Ensure we have our defaults...
 
        if (!UserOptions.UI) {
            UserOptions.UI = {
                IgnoreToast: false
            };
        }
        if (!UserOptions.Socket) {
            UserOptions.Socket = {
                Ignore: false,
                Topics: 'general,dev,errors'
            }

        }



        WebApp.GetHelpFile('AppPrefs.html', function (AppPrefsHTML) {

            console.info('TODO -->', 'Display AppRefs-->', UserOptions);


            appPrefsHTML.innerHTML = AppPrefsHTML;




            appPrefsHTML.querySelector("#APIKeyInput").value = UserOptions.APIKEY;
 
            if(UserOptions.Socket.topics){
                appPrefsHTML.querySelector("#SocketTopics").value = UserOptions.Socket.topics; //"general,dev,errors,reports";
            }

            const IgnoreAllSocketBroadcasts = appPrefsHTML.querySelector("#IgnoreAllSocketBroadcasts");
            const IgnoreAllToasts = appPrefsHTML.querySelector("#IgnoreAllToasts");



            if (UserOptions.Socket.Ignore == undefined) {
                UserOptions.Socket.Ignore = false;
            }
            IgnoreAllSocketBroadcasts.checked = UserOptions.Socket.Ignore;


            if (UserOptions.UI.IgnoreToast == undefined) {
                UserOptions.UI.IgnoreToast = false;
            }
            IgnoreAllToasts.checked = UserOptions.UI.IgnoreToast;


        });


    },
    ClearPrefs() {


        Metro.dialog.create({
            title: "Clear the local storage?",
            content: "<div>Are you sure you want to do this?</div>",
            actions: [
                {
                    caption: "Agree",
                    cls: "js-dialog-close alert",
                    onclick: function () {
                        try {
                            localStorage.clear();
                            Metro.toast.create("The local storage has been cleared!", null, null, "info");
                            WebApp.HistoryLogger.Logger.Add({
                                TID: 0,
                                Type: 707,
                                DT: new Date(),
                                Topic: "Local Storage",
                                Source: "Browser",
                                Body: "The local storage has been cleared!",
                            });
                        } catch (errLocalStorage) {
                            Metro.toast.create("Error clearing the local storage!", null, null, "info");

                        }


                    }
                },
                {
                    caption: "Disagree",
                    cls: "js-dialog-close"
                }
            ]
        });

    },

    //Test the key before you use it...
    TestKey(APIKEY) {

        function ValidateKey() {

            if (!APIKEY) {
                return false;
            }

            if (typeof (APIKEY) == "string") {

                return true;

            } else {
                //Not supporting anything other than strings for the moment...
                return false;
            }
        }





        if (ValidateKey()) {

            WebApp.Fetch({
                service: 'help',
                data: {
                    topic: 'validate-key',
                    key: APIKEY
                }
            }).then(data => {
                if (data.err) {
                    console.warn(data.err.msg);



                } else {
                    console.log('valid key--', data);



                    Metro.dialog.create({
                        title: "Valid API Key",
                        content: "<div>Store API Key and state from server to local storage?</div>",
                        actions: [
                            {
                                caption: "Agree",
                                cls: "js-dialog-close alert",
                                onclick: function () {

                                    // console.log(APIKEY);
                                    WebApp.AppPrefs.UserOptions.APIKEY = APIKEY;

                                    localStorage.setItem('UserOptions', JSON.stringify(WebApp.AppPrefs.UserOptions));


                                }
                            },
                            {
                                caption: "Disagree",
                                cls: "js-dialog-close"
                            }
                        ]
                    });




                }


            }).catch(error => {
                console.warn('Error!');
                console.error(error);
                // debugger;
            });




        } else {
            alert('fix yo key!  :-)');
        }


    },
    Alerts: {
        SetIgnore(HostElement) {
            const appPrefsHTML = document.getElementById("TabAppPrefs");
            const UserOptions = WebApp.AppPrefs.UserOptions;

            // console.info("Set Alert value-->", HostElement.id, " -- ", HostElement.checked);
            // debugger;

            if (HostElement.id == "IgnoreAllToasts") {
                const IgnoreAllToasts = appPrefsHTML.querySelector("#IgnoreAllToasts");
                UserOptions.UI.IgnoreToast = IgnoreAllToasts.checked;
           
                localStorage.setItem('UserOptions', JSON.stringify(UserOptions));

            }
            if (HostElement.id == "IgnoreAllSocketBroadcasts") {
                const IgnoreAllSocketBroadcasts = appPrefsHTML.querySelector("#IgnoreAllSocketBroadcasts");
                UserOptions.Socket.Ignore = IgnoreAllSocketBroadcasts.checked
 
                localStorage.setItem('UserOptions', JSON.stringify(UserOptions));


            }

        }
    },
    Socket: {
        SetSocketChannel(tag, val, values) {
            const UserOptions = WebApp.AppPrefs.UserOptions;

            const appPrefsHTML = document.getElementById("TabAppPrefs");

            const IgnoreAllSocketBroadcasts = appPrefsHTML.querySelector("#IgnoreAllSocketBroadcasts");
            const inputSocketTopics = appPrefsHTML.querySelector("#SocketTopics");
      
            UserOptions.Socket = {
                Ignore: IgnoreAllSocketBroadcasts.checked,
                Topics: inputSocketTopics.value
            }
            // console.info(UserOptions);
            // debugger;
            localStorage.setItem('UserOptions', JSON.stringify(UserOptions));


        }
    }
};
