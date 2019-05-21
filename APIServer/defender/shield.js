/*
    Provide a basic shield for our API from the bad people who want to abuse it. 


    ** WHAT ABOUT THE KEYS!!!! ***
*/
const fs = require('fs');


/*
    Simple database of IPs that we need to worry about...

*/
const BadActorsIP = {
    // TotalCount:0,
    Find(IP4Address2Find) {
        for (let index = 0; index < BadActorsIP.__AllAddys.length; index++) {
            const ipRec = BadActorsIP.__AllAddys[index];
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
        const fndRec = BadActorsIP.Find(IP4Address2Add);

        if (fndRec) {
            fndRec.data.requests.push(MetaData);
            //Just keep the last 25 requets...
            if (fndRec.data.requests.length > 25) {
                fndRec.data.requests.shift();
            }

        } else {
            BadActorsIP.__AllAddys.push({
                IP4Address: IP4Address2Add,
                requests: [MetaData]
            });

            //Just keep the last 25 IP addresses...
            if (BadActorsIP.__AllAddys.length > 25) {
                BadActorsIP.__AllAddys.shift();
            }
        }


    },
    //our running list of addressess...
    __AllAddys: []
};

//Export just the IP address for the API services...
exports.ShameList = BadActorsIP.__AllAddys;






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
function CheckRequest(RequsetObject, ResponseObject, OnChecked) {

    /*
        Make sure it's not PHP!
    */
    if (CheckPHP(RequsetObject.url)) {
        // Send them back home!  :-)
        ResponseObject.writeHead(302, {
            'Location': 'http://' + RequsetObject.User.RemoteIP + RequsetObject.url 
        });


        BadActorsIP.Add(RequsetObject.connection.remoteAddress, {
            HTTPVERB: RequsetObject.method,
            URL: RequsetObject.url,
        });





        SERVER.ServiceLogger.WriteWebLog('php', {
            IP4Address: RequsetObject.connection.remoteAddress,
            Topic: 'PHP REQUEST!',
            Body: RequsetObject.method + ' ' +  RequsetObject.url
        });

        SERVER.ServiceLogger.Statistics.System.TotalSuccess++;


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