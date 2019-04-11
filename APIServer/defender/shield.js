/*
    Provide a basic shield for our API from the bad peopel who want to abuse it. 
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

        /*
              Quick log to see the history of our traffic...
        */
        const errLogItem = "@" + new Date().toISOString() + " " +
            RequsetObject.connection.remoteAddress +
            "[" + RequsetObject.method + "]" +
            "" + RequsetObject.url + " ** PHP REQUEST! \r\n";


        //Add to our logger file whats up...
        fs.appendFile(SERVER.ErrorFileName, errLogItem, function (err) {
            if (err) throw err;
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