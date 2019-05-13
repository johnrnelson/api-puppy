/*
    Basic mysql wrapper to provide pool and 
    fetch services...


*/
var mysql = require('mysql');

const ServerTimeDiff = {
    Hours: 0
};
exports.ServerTimeDiff = ServerTimeDiff;

var pool = false;
exports.IsConnected = function () {
    if (pool) {
        return true;
    }
    else {
        return false;
    }
};

exports.OpenPoolSync = function (DatabaseConnectionInfo) {

    return new Promise(resolve => {

        var path = require("path");

        var fs = require("fs");

        // debugger;


        const poolConfig = {
            host: DatabaseConnectionInfo.host,
            user: DatabaseConnectionInfo.user,
            password: DatabaseConnectionInfo.password,
            database: DatabaseConnectionInfo.database,
            connectionLimit: 50,
            queueLimit: 20,
            waitForConnection: true,
            multipleStatements: true // ALOW FO MULTI--DANGEROUS!!!

        };

        //Use SSL if need be...
        if (DatabaseConnectionInfo.ssl) {
            poolConfig.ssl = {};
            if (DatabaseConnectionInfo.ssl.ca) {
                poolConfig.ssl.ca = fs.readFileSync(DatabaseConnectionInfo.ssl.ca);
            }
            if (DatabaseConnectionInfo.ssl.key) {
                poolConfig.ssl.key = fs.readFileSync(DatabaseConnectionInfo.ssl.key);
            }
            if (DatabaseConnectionInfo.ssl.cert) {
                poolConfig.ssl.cert = fs.readFileSync(DatabaseConnectionInfo.ssl.cert);
            }

        }

        pool = mysql.createPool(poolConfig);


        /*
            When you first open the connection, test it real quick
            by gettins soem yummy server stats....        
        */
        //    SERVER.SqlData.ExecuteSQL("SHOW STATUS WHERE `variable_name` = 'Threads_connected';", function (Result) {
        SERVER.SqlData.ExecuteSQL("select now() as NOW", function (Result) {
            if (Result.err) {

                // console.log('Error connecting to DB.');
                // console.log(Result.err);
                // debugger;
                resolve({
                    err: Result.err
                });

            } else {
                const DateDiff = new Date(Result.rows[0].NOW);
                const now = new Date();
                ServerTimeDiff.Hours = Math.abs(DateDiff - now) / 36e5;
                console.log('SQL Server is offset by:' + ServerTimeDiff.Hours + ' hours!');
                // debugger;

                resolve({
                    err: null,
                    pool: pool
                });
            }
        });


    });


}



function ExecuteSQL(sql, Executed) {
    var result = {
        err: null,

    };
    try {
        pool.getConnection(function (err, connection) {
            // connected! (unless `err` is set)
            // Use the connection
            if (err) {
                console.warn("Error trying to open the database...\r\n", err.message);
                pool = false;

                // debugger;
                result.err = err.message;
                Executed(result);
            }
            else {

                connection.query(sql, function (err, rows) {
                    // And done with the connection.

                    result.err = err;
                    result.rows = rows;


                    //put connection back in the pool...
                    connection.release(result);

                    Executed(result);
                });
            }
        });

    }
    catch (errSQL) {
        result.err = errSQL;
        Executed(result);
    }

}; //
exports.ExecuteSQL = ExecuteSQL;

function ExecuteSQLSync(sql) {

    return new Promise(resolve => {
        ExecuteSQL(sql, function (Result) {
            // debugger;
            resolve(Result);
        });
    });
}
exports.ExecuteSQLSync = ExecuteSQLSync;


/*
    Simple way to sanitize the string values when using 
    sql....
*/
exports.StripQuotesForString = function (StringValue) {
    var stripSTRING = mysql.escape(StringValue);
    return stripSTRING;
};




exports.SanitizeString = function(StringValue){
    return StringValue.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
};





exports.ExecuteSQLPaging = function (Opts, OnExecute) {

    if (Opts.limit > 50) {
        OnExecute({
            err: 'Max rows per page is 50.',
        }, null);
        return;
    }

    if (Opts.page < 1) {
        OnExecute({
            err: 'Current page must be greater than 0.',
        }, null);
        return;
    }
    if (Opts.where) {
        Opts.where = " where " + Opts.where;
    } else {
        Opts.where = "";
    }

    const sql = "SELECT count(*) t FROM " + Opts.from +
        Opts.where + ";\r\n" +
        "SELECT " + Opts.select + " FROM " + Opts.from +
        Opts.where + " order by " + Opts.sort +
        " limit " + Opts.limit + ";";

    ExecuteSQL(sql, function (SQLResult) {
        if (SQLResult.err) {
            console.log(sql);
            debugger;
            OnExecute({
                err: 'Comic service was not able to understand you.',
                debug: RequestData
            }, null);
        } else {
            const data = {
                page: 1,
                total: SQLResult.rows[0][0].t,
                rows: SQLResult.rows[1]
            };
            // debugger;
            OnExecute(null, data);
        }

    });
}