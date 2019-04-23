/*
    Provide a basic shield for our API from the bad people who want to abuse it. 
*/
const fs = require('fs');



//Just pick off any request that even looks like php!
function CheckPHP(URL) {    
    if (URL.indexOf(".php") > 0) {
        return true;
    } else {
        return false;
    }
}

/*
    Main entry point for this module.

    It should be the only method exposed and provide 
    the user lookups if need be??? 
    
    Lets see how this goes. lol :-)
*/
function CheckRequest(RequsetObject, OnChecked) {

    /*
        Make sure it's not PHP!
    */ 
    if (CheckPHP(RequsetObject.url)) {




        SERVER.ServiceLogger.WriteLog('php', {
            IP4Address: RequsetObject.connection.remoteAddress,
            HTTPVERB: RequsetObject.method,
            URL: RequsetObject.url,
            Body:'** PHP REQUEST!' 
        });

  

        OnChecked({
            warning: "PHP is not installed! Please don't bother scanning for it.",
            user: {
                IP: RequsetObject.User.RemoteIP,
                SecLvl: RequsetObject.User.SecurityLevel,
                ProfileID: RequsetObject.User.ProfileID
            }
        });

    } else {
 

        //We are cleared for take off!  :-)
        OnChecked(null);
 
    }
}

exports.CheckRequest = CheckRequest;