#!/usr/bin/env node

"use strict";

/*


Use the dropper instead!!!!!
        
http://feeds.feedburner.com/comiclistfeed - this week
http://feeds.feedburner.com/ncrl - this week plain text
http://feeds.feedburner.com/comiclistnextweek - next week
http://feeds.feedburner.com/comiclistbeyondnextweek - extended forecast

*/

const fs = require('fs');
const path = require('path');

const ServerEnv = require('../SERVER');


/*
    Wrap it all up so its easy to use... :-)
*/
const FeedAPI = {

    /*
        Get the files once so we don't have to kill our network!  :-)
    */
    GetFiles(Refresh) {
        const OutFilePath = SERVER.SECRET + '/RSSComicPriceFeedburner.json';

        debugger;
        if (Refresh) {
            var request = require('request');

            request.get({
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'
                },
                url: 'http://feeds.feedburner.com/comiclistfeed?format=xml',
                // url: 'http://feeds.feedburner.com/comiclistfeed',
                body: ""
            }, function (error, response, body) {
                console.log('New File Written!', OutFilePath);
                debugger;
                //Don't put the file in our project or it will be in github....
                fs.writeFileSync(OutFilePath, body);
                DigestXML();
            });
        } else {
            DigestXML();
        }

        function DigestXML() {

            FeedAPI.ReadXML(OutFilePath, function (errReadXML, XMLData) {
                if (errReadXML) {
                    console.log(" ************************************************ ");
                    console.log(errReadXML);
                    console.log(" ************************************************ ");
                } else {
                    console.log("Total Items-->", XMLData.items.length);
                    FeedAPI.BuildSQL(XMLData);
                }
                // debugger;

            });

        }
    },
    //========================================================================


    /*
        Update our database...
    */
    UpdateDB(SQL2Update) {

        SERVER.SqlData.ExecuteSQL(SQL2Update, function (SQLResult) {
            if (SQLResult.err) {
                console.log(SQLResult.err);
                debugger;

            } else {
                debugger;
                console.log(SQL2Update.length, SQLResult.rows);
            }

        });
    },
    //========================================================================
    ReadXML(FilePath, OnRead) {


        const Magic_Numbers = {
            //Data starts on this row.. 
            ComicDataStartsOnRow0: 6,
            ComicDataStartsOnRow1: 4
        };


        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;

        var parseString = require('xml2js').parseString;

        const XMLData = {
            items: []
        };

        try {



            const FEED_DATA = fs.readFileSync(FilePath, 'utf8');



            parseString(FEED_DATA, function (err, result) {
                // debugger;
                const rss = result.rss;
                const chan = result.rss.channel[0];

                console.dir('Importing this--> ', chan.title);
                console.dir('items--> ', chan.item.length);

                for (let chanItemNDX = 0; chanItemNDX < chan.item.length; chanItemNDX++) {

                    const chanItem = chan.item[chanItemNDX];

                    console.log(chanItemNDX, ' ## --  Looping XML Items');

                    const descHTML = chanItem.description[0];

                    console.log('Total html-->', descHTML.length);

                    // FeedAPI.ShadowDOM(descHTML);
                    const dom = new JSDOM(descHTML);
                    const doc = dom.window.document;

                    // debugger;
                    var allParas = dom.window.document.querySelectorAll('p');




                    for (let index = 0; index < allParas.length; index++) {
                        const element = allParas[index];
                        var TESTelement = allParas[3].textContent;

                        if (index < Magic_Numbers["ComicDataStartsOnRow" + chanItemNDX]) {
                            continue;
                        }

                        var PublisherTitleTag = element.querySelector('u');
                        if (!PublisherTitleTag) {
                            // debugger;
                            continue;
                        }
                        var PublisherTitle = element.querySelector('u').textContent;
                        // var ComicTitle = element.querySelector('a').textContent;


                        var rowArray = element.textContent.trim().split('\n');
                        // console.log(rowArray);


                        var rawLine = rowArray[1];

                        //Looks like we are done with our data..  :-)
                        if (!rawLine) {
                            // debugger;
                            continue;
                        }
                        var rawLineComma = rawLine.lastIndexOf(',');
                        if (rawLineComma < 2) {
                            debugger;
                        }

                        var rowTitle = rawLine.substr(0, rawLineComma);
                        var rowPriceText = rawLine.substr(rawLineComma + 1, rawLine.length).replace('$', '').trim();

                        var rowObject = {
                            Publisher: PublisherTitle,
                            Title: rowTitle,
                            Price: -1
                        };
                        var rowPriceValue = 0;
                        const isPrice = isNaN(rowPriceText);

                        if (!isPrice) {
                            // debugger;
                            rowPriceValue = parseFloat(rowPriceText);
                            console.log(index, 'Price--', rowPriceValue);
                        };


                        rowObject.Price = rowPriceValue;
                        // debugger;
                        XMLData.items.push(rowObject);


                    }//End for all of the paragraphs in HTML...

                    // debug using this...  :-)
                    // console.log(dom.window.document.querySelector("p").textContent); 




                    if (chanItemNDX == chan.item.length - 1) {
                        OnRead(null, XMLData);
                    }


                }// end for all chan items...

            });
        } catch (errReadXML) {
            OnRead(errReadXML);
        }
    },
    BuildSQL(XMLData) {

        SERVER.OpenDB(function () {

            var sqlItems = [];

            sqlItems.push('TRUNCATE `comics`.`ComicPrices`;')
            for (let index = 0; index < XMLData.items.length; index++) {
                const element = XMLData.items[index];

                var sql = `INSERT INTO comics.ComicPrices(CTitle,Cost)VALUES(${SERVER.SqlData.StripQuotesForString(element.Title)},${element.Price});`;

                sqlItems.push(sql);
                // debugger;
            }
            var finalSQL = sqlItems.join('\r\n');
            console.log(finalSQL);
            FeedAPI.UpdateDB(finalSQL);

        });

    }

};
// debugger;





/*
    Use this to get the files and write to the database. 

    Parameter: True/False 
    True will get the new listing from the feedburner. False will use 
    the existing data file found on disk. Helpful when debugging. :-) 
*/
FeedAPI.GetFiles(false);



