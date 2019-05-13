/*
    Manage our logging needs...

    Log Types: 
        0   Normal
        500 Error!

    ** At some point you should put in a better storage than local files!        

*/
const LogTypeMap = {
    "Information": 411,
    "Socket": 202,
    "php": 800,
    "WebErrors": 400,
};

function LogTypeString2Value(LogTypeNumber) {
    // Ex : SERVER.ServiceLogger.LogType2String('511');

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
function WriteLog(LogType, LogEntry) {
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
exports.WriteLog = WriteLog;


/*
    Uh oh! We really gonna do this? :smiley:
*/
function ReadLog(ReadOpts, OnComplete) {

    ReadOpts.type = SERVER.SqlData.StripAZ09(ReadOpts.type);


    const LogTypeNumber = LogTypeString2Value(ReadOpts.type);
    if (!LogTypeNumber) {
        OnComplete({
            err: 'Logger service was not able to find the log type.',
            debug: ReadOpts.type
        }, null);
        return;
    }
 


    var yesterday = new Date(ReadOpts.date)
    yesterday.setTime(ReadOpts.date.getTime() - ((24 * 60 * 60 * 1000) * 1));  // 24*60*60*1000) * 5 is one day!
    var tomorrow = new Date(ReadOpts.date)
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
exports.ReadLog = ReadLog;
/*
    What are all the log files we have right now?
*/
function ListLogs(OnList) {
    fs.readdir(SERVER.LoggerConfig.Folder, function (err, items) {
        if (err) {
            debugger;
            OnList();
        } else {
            OnList(items);
        }
    });
}
exports.ListLogs = ListLogs;

