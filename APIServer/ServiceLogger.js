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
    if (LogTypeNumber = 411) {
        return "Information"
    }
    if (LogTypeNumber = 202) {
        return "Connect Socket"
    }
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
    debugger;

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
function ReadLog(LogType, OnComplete) {


    const SQL = `select * from  WebLog.EventLog order by ID DESC  limit 25`;
    var opts2Fix_PAGING = {
        select: "*",
        from: "WebLog.EventLog",
        sort: "Created",
        // limit: 10,
        // page: 1
    };

    SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
        if (SQLResult.err) {
            console.log(SQL);
            debugger;
            OnComplete({
                err: 'Comic service was not able to understand you.',
                debug: RequestData
            }, null);
        } else {
            // const data = {
            //     page: 1,
            //     total: SQLResult.rows[0][0].t,
            //     rows: SQLResult.rows[1]
            // };
            // debugger;
            OnComplete(null, SQLResult.rows);
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

