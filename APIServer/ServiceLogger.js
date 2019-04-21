/*
    Manage our logging needs...

    Log Types: 
        0   Normal
        500 Error!

*/
const fs = require('fs');
const path = require('path');

const ErrorFileName = path.join(__dirname, '/../', 'SECRET', "LOGS");


/*
    Write to the log based on our log types...     
*/
function WriteLog(LogType, LogEntry) {
    const LogDate = new Date();

    var targetLogFileName = "";



    if (LogType) {
        targetLogFileName = ErrorFileName + '/LT-' + LogType + '-' + LogDate.toLocaleDateString().split('/').reverse().join("-") + '.log'

    } else {
        targetLogFileName = ErrorFileName + '/DefaultLog-' + LogDate.toLocaleDateString().split('/').reverse().join("-") + '.log';

    }

    const logItem = {
        dt: LogDate.toISOString(),
        // data: LogEntry
        IP4Address: LogEntry.IP4Address,
        HTTPVERB: LogEntry.HTTPVERB,
        URL: LogEntry.URL,
        Body: LogEntry.Body
    };


    const logEntryText = JSON.stringify(logItem);

    //Add to our logger file whats up...
    fs.appendFile(targetLogFileName, logEntryText + '\r\n', function (err) {
        if (err) throw err;
    });
}
exports.WriteLog = WriteLog;


/*
    Uh oh! We really gonna do this? :smiley:
*/
function ReadLog() {
    //It might be a very big file!!!
}