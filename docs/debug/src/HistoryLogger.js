/*
History Logger
*/

window.HistoryLogger = {
    Calendar: {
        /*
            The only way to dynamicly set the props of the calendar is 
            by adding the HTML on our own. The JS functions don't
            seem to work...   :-(
        */
        AddControl() {

            const el = document.getElementById('LoggerCalendarPanel');



            WebApp.Fetch({
                "service": "logger",
                "action": "list-log-files"
            }).then(data => {
                if (data.err) {
                    console.warn(data.err);
                    debugger;
                } else {
                    const DateMap = {};


                    if (!data.logs.length) {
                        console.warn('NO LOG Files!');
                        return;
                    }
                    for (let index = 0; index < data.logs.length; index++) {
                        var logItem = data.logs[index];
                        // debugger;
                        logItem = logItem.replace('.log', '');

                        var fileParts = logItem.split('-');

                        var dateparts = fileParts[fileParts.length - 3] + "/" +
                            fileParts[fileParts.length - 2] + "/" +
                            fileParts[fileParts.length - 1];

                        //done with date parts now..
                        fileParts.splice(fileParts.length - 3, 3);
                        // console.log(fileParts);                        

                        var newDate = new Date(dateparts);
                        if (!DateMap[newDate]) {
                            DateMap[newDate] = {
                                logs: []
                            };
                        } else {
                            DateMap[newDate].logs.push(fileParts.join('-'));
                        }




                    }


                    const todayDate = new Date();
                    const minDate = todayDate.addDays(-30);
                    const maxDate = todayDate.addDays(1);

                    // console.log(DateMap);
                    // debugger;

                    const minDateFMT = (minDate.getMonth() + 1) + "-" +
                        minDate.getDate() + "-" +
                        minDate.getFullYear();

                    const maxDateFMT = (maxDate.getMonth() + 1) + "-" +
                        maxDate.getDate() + "-" +
                        maxDate.getFullYear();

                    var specDates = "";
                    for (var x in DateMap) {
                        var dt = new Date(x);
                        const fmtDateMapItem = (dt.getMonth() + 1) + "-" +
                            dt.getDate() + "-" +
                            dt.getFullYear();

                        specDates += fmtDateMapItem + ",";
                    }


                    const calendarHTML = `

                    <div id="LoggerCalendar"  
                        data-min-date="${minDateFMT}"
                        data-max-date="${maxDateFMT}"
                        data-special="${specDates}" 
                        data-on-day-click="HistoryLogger.Calendar.ChangeLoggerDay"
                        data-role="calendar" class="compact" 
                        data-buttons="today" data-preset="4-28-2019"></div>
                    <br>
        
                    `;
                    el.innerHTML = calendarHTML;


                }
            }).catch(error => {
                console.warn('Error!');
                console.error(error);
                debugger;
            });



        },
        ChangeLoggerDay(sel, day, el) {
            // console.log(arguments);
            // var calendar = $('#LoggerCalendar').data('calendar');

            // // var curDate = calendar.getSelected();
            // var curDate = new Date(sel[0]);
            // console.log('change to', curDate);


        },
    },
    Logger: {

        Clear() {
            Metro.dialog.create({
                title: "Clear the history?",
                content: "<div>Are you sure you want to do this?</div>",
                actions: [
                    {
                        caption: "Agree",
                        cls: "js-dialog-close alert",
                        onclick: function () {
                            const loggerTables = document.getElementsByTagName('LoggerTable');
 
                            for (let index = 0; index < loggerTables.length; index++) {
                                const lgEl = loggerTables[index];

                                const haslog = lgEl.getAttribute('haslog');
                                if (haslog) {

                                    const tbl = lgEl.querySelector('tbody');
                                    if (!tbl) {
                                        debugger;
                                    }
                                    tbl.innerHTML = "";

                                    const lgType = lgEl.id.replace('LGType-', '');

                                    const TargetElementCount = document.getElementById('LgCnt-' + lgType);
                                    if (TargetElementCount) {
                                        TargetElementCount.TotalCount = 0;
                                        TargetElementCount.innerHTML = "&nbsp;";
                                    }

                                }


                            }


                            HistoryLogger.Logger.Add({
                                TID: 0,
                                Type: 707,
                                DT: new Date(),
                                Topic: "Logger History",
                                Source: "Browser",
                                Body: "History was deleted per user request",
                            });
                            Metro.toast.create("History was deleted per user request", null, null, "info");

                        }
                    },
                    {
                        caption: "Disagree",
                        cls: "js-dialog-close"
                    }
                ]
            });
        },
        SetOption(OptElement) {
            console.log(OptElement);
            console.log(OptElement.value);
            // debugger;
        },
        //Just swap between tables...
        SetListType(ListElement) {

            const TargetElement = document.getElementById('LGType-' + ListElement);


            if (!TargetElement) {
                console.warn('No log Target!');
                return;
            }

            if (!HistoryLogger.Logger.ActiveLog) {
                HistoryLogger.Logger.ActiveLog = TargetElement;
            } else {
                HistoryLogger.Logger.ActiveLog.style.display = "none";
                HistoryLogger.Logger.ActiveLog = TargetElement;
            }
            // console.log('Show Log List-->', ListElement);
            HistoryLogger.Logger.ActiveLog.style.display = "block";
        },

        /*
            Add a log item...
        */
        Add(LogMSG) {
            /*
                    Check https://github.com/johnrnelson/api-puppy/blob/master/Notes/LogTypes.md
            */

            try {

                if (!LogMSG.Type) {
                    LogMSG.Type = 0;
                }

                const TargetElementCount = document.getElementById('LgCnt-' + LogMSG.Type);
                if (!TargetElementCount.TotalCount) {
                    TargetElementCount.TotalCount = 0;
                }
                TargetElementCount.TotalCount++;
                TargetElementCount.innerHTML = "[" + TargetElementCount.TotalCount + "]";

                function CellBuider(HostRow, ID, Title, ClassName, HTMLValue) {
                    const newCell = document.createElement('td');
                    newCell.title = Title;
                    newCell.className = ClassName;
                    newCell.innerHTML = HTMLValue;
                    newCell.vAlign = "top";
                    newCell.align = "left";

                    HostRow.appendChild(newCell)
                    // return newCell
                }

                if (!LogMSG.DT) {
                    LogMSG.DT = new Date()
                }

                const displayDT = moment(LogMSG.DT);


                const tblBody = document.getElementById('LGType-' + LogMSG.Type + '-history');
                if (!tblBody) {
                    debugger;
                }

                const tr = document.createElement('tr');

                // debugger;

                // CellBuider(tr, "", "TID Help", "", LogMSG.TID);
                // CellBuider(tr, "", "Type Of Log Item [" + LogMSG.Type + "]", "", dispLogType);
                CellBuider(tr, "", displayDT.format("dddd, MMMM Do YYYY, h:mm:ss a"), "", displayDT.format("h:mm:ss a"));
                CellBuider(tr, "", "", "", LogMSG.Topic);
                CellBuider(tr, "", "", "", LogMSG.Source);
                CellBuider(tr, "", "", "", LogMSG.Body);

                tblBody.appendChild(tr);
            } catch (errAddLogItem) {
                alert('Error adding to the log!!!\r\n' + errAddLogItem.message);
            }
















        },
        FetchRemoteByType(RemoteLogFile) {
            HistoryLogger.Logger.SetListType('serverlogs');



            var calendar = $('#LoggerCalendar').data('calendar');

            var LogDate = new Date(calendar.getSelected()[0]);

            // const LogDate = new Date();
            const fileLogDate = "-" + LogDate.getFullYear() + "-" + (LogDate.getMonth() + 1) + "-" + LogDate.getDate()

            var finalLogFileName = "";

            if (RemoteLogFile == "DefaultLog") {
                finalLogFileName = RemoteLogFile + fileLogDate;
            } else {
                finalLogFileName = "LT-" + RemoteLogFile + fileLogDate;
            }


            var tbl = document.getElementById('LGType-serverlogs-history');
            tbl.innerHTML = "";

            tbl.innerHTML = `
                <tr>
                    <td colspan="4">    
                    <br>
                    <br>
                    <center>                
                        <h3>Loading Remote Log File</h3>
                        <i class="fas fa-spinner fa-spin fa-4x"></i>
                    </center>
                    <br>
                    <br>
                    </td>
                </tr>
            
            `;

            setTimeout(() => {



                WebApp.Fetch({
                    "service": "logger",
                    "action": "log-file-fetch",
                    "logfile": finalLogFileName + ".log"
                }).then(data => {
                    // debugger;
                    if (data.err) {
                        console.warn(data.err);
                        tbl.innerHTML = "";
                    } else {
                        tbl.innerHTML = "";

                        if (!data.logs.length) {
                            console.info('Req File-->', finalLogFileName);
                            return;
                        }
                        for (let index = 0; index < data.logs.length; index++) {
                            const logItem = data.logs[index];
                            const tableRow = document.createElement('tr');

                            const displayDT = moment(logItem.dt);
                            // debugger;
                            // https://ipapi.co/50.50.50.54/
                            const ShowIPLoc = "https://ipapi.co/" + logItem.IP4Address + "/";

                            tableRow.innerHTML = `
                            <td title="${displayDT.format("dddd, MMMM Do YYYY, h:mm:ss a")}">${displayDT.format("h:mm:ss a")}</td>
                            <td>${logItem.Topic}</td>
                            <td><a href="${ShowIPLoc}" target="_blank">${logItem.IP4Address}</a></td>
                            <td>${JSON.stringify(logItem.data)}</td>
                        `;

                            tbl.appendChild(tableRow);
                        }

                    }
                }).catch(error => {
                    console.warn('Error!');
                    console.error(error);
                    debugger;
                });


            }, 20);


        },

    },

};