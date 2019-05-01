/*
    Manage our logging needs...

    Log Types: 
        0   Normal
        500 Error!

    ** At some point you should put in a better storage than local files!        

*/
const fs = require('fs');
const path = require('path');



// var SERVER.LoggerConfig = {
//     Folder: ErrorLogPath = path.join(__dirname, '/../', 'SECRET', "LOGS"),
//     ignore: {
//         IP4: [
//             "127.0.0.1"
//         ]
//     }
// }; 


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
    const LogDate = new Date();
    const fileLogDate = LogDate.getFullYear() + "-" + (LogDate.getMonth() + 1) + "-" + LogDate.getDate()

    var targetLogFileName = "";

    if (!LogEntry.IP4Address) {
        console.log('Log Entry has no IP4 Address!');
        debugger;
    } else {
        for (let index = 0; index < SERVER.LoggerConfig.ignore.IP4.length; index++) {
            const IP4Address = SERVER.LoggerConfig.ignore.IP4[index];
            if (IP4Address == LogEntry.IP4Address) {
                return;
            }
        }
    }




    if (LogType) {
        targetLogFileName = SERVER.LoggerConfig.Folder + '/LT-' + LogType + '-' + fileLogDate + '.log'

    } else {
        targetLogFileName = SERVER.LoggerConfig.Folder + '/DefaultLog-' + fileLogDate + '.log';

    }
    var ip4Addy = LogEntry.IP4Address;

    delete LogEntry["IP4Address"];

    var LogDataItem = {
        dt: LogDate.toISOString(),
        Topic: LogType,
        IP4Address: ip4Addy,
        data: LogEntry
    };


    const logEntryText = JSON.stringify(LogDataItem);

    //Add to our logger file whats up...
    fs.appendFile(targetLogFileName, logEntryText + '\r\n', function (err) {
        if (err) throw err;
    });
}
exports.WriteLog = WriteLog;


/*
    Uh oh! We really gonna do this? :smiley:
*/
function ReadLog(LogType, OnComplete) {

    /* 
        Make sure there is not funky monkey going on with their request!!! 

        This means all files must go in the "SERVER.LoggerConfig.Folder" folder!!!!
    */

    const filepath = path.basename(LogType);
    const examplesFilePath = path.join(SERVER.LoggerConfig.Folder, filepath);



    fs.readFile(examplesFilePath, 'utf8', function (err, data) {
        if (err) {
            // debugger;
            OnComplete({
                logfile: filepath,
                msg: "Error reading log file."
            }, null);
        } else {
            OnComplete(null, data);
        }
    });//End reading file...
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