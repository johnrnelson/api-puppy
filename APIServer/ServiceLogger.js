/*
    Manage our logging needs...

    Log Types: 
        0   Normal
        500 Error!

*/
const fs = require('fs');
const path = require('path');


//Put your own stuff int he config file! This is just for testing and debugging...
var LoggerConfig = {
    Folder: ErrorLogPath = path.join(__dirname, '/../', 'SECRET', "LOGS"),
    ignore: {
        IP4: [
            "127.0.0.1"
        ]
    }
};


//Set the options you want by json..
function SetOptions(LoggerOpts) {
    if (LoggerOpts.Folder) {
        LoggerConfig.Folder = LoggerOpts.Folder;
    }
    if (LoggerOpts.ignore) {
        LoggerConfig.ignore = LoggerOpts.ignore;
    }
}
exports.SetOptions = SetOptions;

/*
    Write to the log based on our log types...     
*/
function WriteLog(LogType, LogEntry) {
    const LogDate = new Date();

    var targetLogFileName = "";

    if (!LogEntry.IP4Address) {
        console.log('Log Entry has no IP4 Address!');
        debugger;
    } else {
        for (let index = 0; index < LoggerConfig.ignore.IP4.length; index++) {
            const IP4Address = LoggerConfig.ignore.IP4[index];
            if (IP4Address == LogEntry.IP4Address) {              
                return;
            }
        }
    }




    if (LogType) {
        targetLogFileName = LoggerConfig.Folder + '/LT-' + LogType + '-' + LogDate.toLocaleDateString().split('/').reverse().join("-") + '.log'

    } else {
        targetLogFileName = LoggerConfig.Folder + '/DefaultLog-' + LogDate.toLocaleDateString().split('/').reverse().join("-") + '.log';

    }


    LogEntry.dt = LogDate.toISOString();

    const logEntryText = JSON.stringify(LogEntry);

    //Add to our logger file whats up...
    fs.appendFile(targetLogFileName, logEntryText + '\r\n', function (err) {
        if (err) throw err;
    });
}
exports.WriteLog = WriteLog;


/*
    Uh oh! We really gonna do this? :smiley:
*/
function ReadLog(LogType) {
    //It might be a very big file!!!
    //Add to our logger file whats up...

}

/*
    What are all the log files we have right now?
*/
function ListLogs(OnList) {
    fs.readdir(LoggerConfig.Folder, function (err, items) {
        if (err) {
            debugger;
            OnList();
        } else {
            OnList(items);
        }
    });
}
exports.ListLogs = ListLogs;