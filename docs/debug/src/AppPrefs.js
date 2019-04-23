/*
    Simple manager for prefs the user might want 
    to set.
*/

window.AppRefs = {
    APIKEY: '',
    UserOptions: {
        UserID: '',
        TargetAPI: {
            url: document.URL,
            opts: {
                favor: 'put'
            }
        }
    },
    UI: {
        ShowPrefs() {
            console.info('TODO -->', 'Display AppRefs-->', AppRefs);
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
                                UIHelper.Logger.Add({
                                    TID: 0,
                                    Type: 707,
                                    DT: new Date(),
                                    Topic: "Local Storage",
                                    Source: "Browser",
                                    Body: "The local storage has been cleared!",
                                });
                            } catch (errLocalStorage) {
                                UIHelper.Logger.Add({
                                    TID: 0,
                                    Type: 0,
                                    DT: new Date(),
                                    Topic: "Local Storage",
                                    Source: "Browser",
                                    Body: errLocalStorage.message
                                });
                            }


                        }
                    },
                    {
                        caption: "Disagree",
                        cls: "js-dialog-close"
                    }
                ]
            });












        }
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
                    console.warn(data.err);
                    debugger;
                } else {
                    console.log('valid key--',data);


                    return;


                    Metro.dialog.create({
                        title: "Valid API Key",
                        content: "<div>Store API Key and state from server to local storage?</div>",
                        actions: [
                            {
                                caption: "Agree",
                                cls: "js-dialog-close alert",
                                onclick: function () {

                                    console.log(APIKEY);

                                    UIHelper.Logger.Add({
                                        TID: 0,
                                        Type: 707,
                                        DT: new Date(),
                                        Topic: "API Key",
                                        Source: "Browser",
                                        Body: "Testing a new API Key!",
                                    });

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

if (localStorage) {
    const UserOptionsText = localStorage.getItem('UserOptions');

    if (UserOptionsText) {
        console.info('Reloading App options....');
        window.AppRefs.UserOptions = JSON.parse(UserOptionsText);
    } else {
        console.info('Storing (local) App options....');
        localStorage.setItem("UserOptions", JSON.stringify(window.AppRefs.UserOptions));
    }



} else {
    console.Warn('No Local Storage!');
}

