/*
    Manage our logging needs...

    Log Types: 
        0   Normal
        500 Error!

    ** At some point you should put in a better storage than local files!        

*/
const fs = require('fs');
const path = require('path');



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
    const SQL = `INSERT INTO WebLog.EventLog(Type,IP4Address,Topic,Body)VALUES(        
        202,
        '${LogEntry.IP4Address}',
        '${LogEntry.Title}',
        '${LogEntry.Body}' );`;

    console.log(SQL);

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

    console.log(SQL);

    var opts = {
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

 