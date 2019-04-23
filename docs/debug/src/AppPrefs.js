/*
    Simple manager for prefs the user might want 
    to set.
*/

window.AppRefs = {
    APIKEY: '',
    UserOptions: {
        UserID: '',
        TargetAPI: {
            url: document.URL ,
            opts:{
                favor:'put'
            }
        }
    },
    UI:{
        ShowPrefs(){
            console.info('User--',AppRefs.UserOptions);
        }
    },
};

if (localStorage) {
    const UserOptions = localStorage.getItem('UserOptions');
    if (UserOptions) {
        window.AppRefs.UserOptions = UserOptions;
    }

    console.info('App options have loaded....');

} else {
    console.Warn('No Local Storage!');
}

