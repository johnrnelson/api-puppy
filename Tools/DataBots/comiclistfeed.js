
/*


Use the dropper instead!!!!!
        
http://feeds.feedburner.com/comiclistfeed - this week
http://feeds.feedburner.com/ncrl - this week plain text
http://feeds.feedburner.com/comiclistnextweek - next week
http://feeds.feedburner.com/comiclistbeyondnextweek - extended forecast

*/

const fs = require('fs');
// const path = require('path');

const ServerEnv = require('../SERVER');

console.log(SERVER);

// debugger;

/*
var request = require('request');

request.get({
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: 'http://feeds.feedburner.com/comiclistfeed?format=xml',
    body: ""
}, function (error, response, body) {
    // console.log(body);

    debugger;
    fs.writeFileSync(SERVER.SECRET + '/TESTFEEDDBUMP.json',  body);


});

*/

const FEED_DATA = fs.readFileSync(SERVER.SECRET + '/TESTFEEDDBUMP.json', 'utf8');
// debugger;

var parseString = require('xml2js').parseString;
parseString(FEED_DATA, function (err, result) {
    // debugger;
    const rss = result.rss;
    const chan = result.rss.channel[0];

    console.dir('items--> ', chan.item.length);
    console.dir('Importing this--> ', chan.title);
    for (let index = 0; index < chan.item.length; index++) {
        const chanItem = chan.item[index];
        console.log(chanItem);
        const descHTML = chanItem.description[0];

        console.log('html-->', descHTML);
        parseString(descHTML, function (err, descJSON) {
            debugger;
            console.log('descJSON-->', descJSON);

        });

    }
    // console.dir('DEBUG--> ',chan);
    debugger;
});


/*
const SQL = "SELECT * FROM comics.Comics limit 50;";
SERVER.SqlData.ExecuteSQL(SQL, function (SQLResult) {
    if (SQLResult.err) {
        console.log(SQLResult.err);
        debugger;

    } else {

        console.log(SQLResult.rows);
    }

});
*/