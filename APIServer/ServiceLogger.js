/*
    Manage our logging in MySQL. 

    Woot relational databases!  :-)

   
*/

// Map our log names to numbers...
const LogTypeMap = {
    "Information": 411,
    "Socket": 202,
    "php": 800,
    "WebErrors": 400,
};

// Map our log numbers to a name...
function LogTypeString2Value(LogTypeNumber) {
 
    for (var m in LogTypeMap) {
        if (m == LogTypeNumber) {
            return LogTypeMap[m];
        }
    }
    return false;
}
exports.LogTypeString2Value = LogTypeString2Value;

//Set the options you want by json..
function SetOptions(LoggerOpts) {
    if (LoggerOpts.Folder) {
        SERVER.LoggerConfig.Folder = LoggerOpts.Folder;
    }
    if (LoggerOpts.ignore) {
        SERVER.LoggerConfig.ignore = LoggerOpts.ignore;
    }
}
exports.SetOptions = SetOptions;

/*
    Write to the log based on our log types...     
*/
function WriteWebLog(LogType, LogEntry) {
    // debugger;

    const lgTypeLK = LogTypeMap[LogType];
    if (!lgTypeLK) {
        lgTypeLK = 666;
        debugger;
    }
    if (typeof (LogEntry.Body) != "string") {
        LogEntry.Body = JSON.stringify(LogEntry.Body);
    }

    const SQL = `INSERT INTO WebLog.EventLog(Type,IP4Address,Topic,Body)VALUES(        
        ${lgTypeLK},
        '${LogEntry.IP4Address}',
        '${SERVER.SqlData.SanitizeString(LogEntry.Topic)}',
        '${SERVER.SqlData.SanitizeString(LogEntry.Body)}' );`;



    SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
        if (SQLResult.err) {
            console.log(SQL);
            debugger;
        }
    });

}
exports.WriteWebLog = WriteWebLog;


/*
    Uh oh! We really gonna do this? :smiley:
*/
function ReadWebLog(ReadOpts, OnComplete) {

    ReadOpts.type = SERVER.SqlData.StripAZ09(ReadOpts.type);


    const LogTypeNumber = LogTypeString2Value(ReadOpts.type);
    if (!LogTypeNumber) {
        OnComplete({
            err: 'Logger service was not able to find the log type.',
            debug: ReadOpts.type
        }, null);
        return;
    }
 


    var yesterday = new Date(ReadOpts.date);
    yesterday.setTime(ReadOpts.date.getTime() - ((24 * 60 * 60 * 1000) * 1));  // 24*60*60*1000) * 5 is one day!
    
    var tomorrow = new Date(ReadOpts.date);
    tomorrow.setTime(ReadOpts.date.getTime() + ((24 * 60 * 60 * 1000) * 1));  // 24*60*60*1000) * 5 is one day!
 
    var sqlOPTS = {
        select: "*",
        from: "WebLog.EventLog",
        sort: "Created",
        where: " type=" + LogTypeNumber + " and (   Created>'" +
            SERVER.SqlData.MySQLDate(yesterday) + "' and Created<'" +
            SERVER.SqlData.MySQLDate(tomorrow) + "'     )",
        limit: ReadOpts.limit,
        page: ReadOpts.page
    };

    // debugger;
    SERVER.SqlData.ExecuteSQLPaging(sqlOPTS, function (sqlError, sqlData) {
        if (sqlError) {
            console.log(sqlError);
            debugger;
            OnComplete({
                err: 'Logger service was not able to understand you.'
            }, null);
        } else {

            // debugger;
            sqlData.RequestType = ReadOpts.type;
            // OnComplete(null, SQLResult.rows);
            OnComplete(null, sqlData);
        }
    });


}
exports.ReadWebLog = ReadWebLog;
 








/*
    Putting stats here for now...  :-)
*/

const Statistics = {
    Services: {
        TotalSuccess: 0,
        TotalError: 0,
        StatMap: {
            //This gets added to by each service...

            //REMOVE AFTER TESTING!!!!!!
            "help": {
                Success: 0,
                Errors: 0
            },
            "data": {
                Success: 0,
                Errors: 0
            },
            "logger": {
                Success: 0,
                Errors: 0
            }
        },
        AddSiteMapItem(MapName, ItemName) {
            if (!Statistics.Services.StatMap[MapName]) {
                Statistics.Services.StatMap[MapName] = {};
            }
            const mapItem = Statistics.Services.StatMap[MapName];

            if (!mapItem[ItemName]) {
                mapItem[ItemName] = 1;
            } else {
                mapItem[ItemName]++;
            }


        }
    },
    System: {
        TotalSuccess: 0,
        TotalError: 0,
    }
};
exports.Statistics=Statistics;