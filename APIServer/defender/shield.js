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
            //Just keep the last 3 requests and flag the IP as bad!  
            if (fndRec.data.requests.length > 2) {
                fndRec.data.requests.shift();
                SetBanIP4(IP4Address2Add, 'Too many PHP requests');
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
    //our running list of addresses...
    __AllAddys: []
};

//Export just the IP address for the API services...
exports.ShameList = BadActorsIP.__AllAddys;

/*
    Ban this IP for bad behavior!
*/
function SetBanIP4(IP4Address, Reason) {
    const sql = `INSERT INTO WebLog.BadIP(Type,IP4Address,Reason) VALUES (66,'${IP4Address}','${SERVER.SqlData.SanitizeString(Reason)}');`;
    // debugger;
    SERVER.SqlData.ExecuteSQL(sql, function (sqlError, sqlData) {
        if (sqlError.err) {
            console.log(sql);
            console.log(sqlError);
            debugger;
        }
    });
}
exports.SetBanIP4 = SetBanIP4;

function IsIPBanned(IP4Address, OnCheck) {
    const sql = "SELECT count(*) CNT FROM WebLog.BadIP where IP4Address='" + IP4Address + "';";
    SERVER.SqlData.ExecuteSQL(sql, function (SQLResult) {
        if (SQLResult.err) {
            console.log(sql);
            console.log(sqlError);
            OnCheck(true);
        } else {
            const CNT = SQLResult.rows[0].CNT;
            if (CNT > 0) {
                OnCheck(true);
            } else {
                OnCheck(false);
            }
        }
    });

}
exports.IsIPBanned = IsIPBanned;


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
function CheckRequest(RequestObject, ResponseObject, OnChecked) {



    /*
         Make sure it's not PHP!
     */
    if (CheckPHP(RequestObject.url)) {
        // Send them back home!  :-)
        ResponseObject.writeHead(302, {
            'Location': 'http://' + RequestObject.User.RemoteIP + RequestObject.url
        });


        BadActorsIP.Add(RequestObject.connection.remoteAddress, {
            HTTPVERB: RequestObject.method,
            URL: RequestObject.url,
        });





        SERVER.ServiceLogger.WriteWebLog('php', {
            IP4Address: RequestObject.connection.remoteAddress,
            Topic: 'PHP REQUEST!',
            Body: RequestObject.method + ' ' + RequestObject.url
        });

        SERVER.ServiceLogger.Statistics.System.TotalSuccess++;


        OnChecked({
            warning: "PHP is not installed! Please don't bother scanning for it.",
            user: {
                IP: RequestObject.User.RemoteIP,
                SecLvl: RequestObject.User.SecurityLevel,
                ProfileID: RequestObject.User.ProfileID
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