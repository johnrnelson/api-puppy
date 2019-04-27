/*
    Provide a basic shield for our API from the bad people who want to abuse it. 


    ** WHAT ABOUT THE KEYS!!!! ***
*/
const fs = require('fs');


/*
    Simple database of IPs that we need to worry about...

*/
const IPData = {
    // TotalCount:0,
    Find(IP4Address2Find) {
        for (let index = 0; index < IPData.__AllAddys.length; index++) {
            const ipRec = IPData.__AllAddys[index];
            if (ipRec.IP4Address == IP4Address2Find) {
                return {
                    index: index,
                    data: ipRec
                };
            }
        }
        return false;
    },
    Add(IP4Address2Add, MetaData) {
        const fndRec = IPData.Find(IP4Address2Add);

        if (fndRec) {
            fndRec.data.requests.push(MetaData);
            //Just keep the last 25 requets...
            if (fndRec.data.requests.length > 25) {
                fndRec.data.requests.shift();
            }

        } else {
            IPData.__AllAddys.push({
                IP4Address: IP4Address2Add,
                requests: [MetaData]
            });

            //Just keep the last 25 IP addresses...
            if (IPData.__AllAddys.length > 25) {
                IPData.__AllAddys.shift();
            }
        }


    },
    //our running list of addressess...
    __AllAddys: []
};

//Export just the IP address for the API services...
exports.ShameList = IPData.__AllAddys;






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




        IPData.Add(RequsetObject.connection.remoteAddress, {
            HTTPVERB: RequsetObject.method,
            URL: RequsetObject.url,
        });





        SERVER.ServiceLogger.WriteLog('php', {
            IP4Address: RequsetObject.connection.remoteAddress,
            HTTPVERB: RequsetObject.method,
            URL: RequsetObject.url,
            Body: '** PHP REQUEST!'
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

/*
    A very simple way to check the api key. 
    Since this is just a demo, we only have
    a few so this should do fine...
*/
function CheckAPIKey(Key2Check) {
    const serverkeys = SERVER.KEYS.admin;

    for (let index = 0; index < serverkeys.length; index++) {
        const srvKey = serverkeys[index];
        if (Key2Check == serverkeys[index]) {
            return true;
        }
    }
    return false;

}
exports.CheckAPIKey = CheckAPIKey;