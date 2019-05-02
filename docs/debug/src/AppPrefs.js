/*
    Manage the application preferences in the UI...
*/
WebApp.AppPrefsManager = {

    ShowPrefs() {



        WebApp.GetHelpFile('AppPrefs.html', function (AppPrefsHTML) {

            document.getElementById("TabAppPrefs").innerHTML = AppPrefsHTML.body;

            console.info('TODO -->', 'Display AppRefs-->', WebApp.AppPrefs.UserOptions);
            

            const inputCtrl = document.getElementById("APIKeyInput");

            inputCtrl.value = WebApp.AppPrefs.UserOptions.APIKEY;



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

                                    console.log(APIKEY);
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


    }




};
