/*
History Logger
*/

WebApp.HistoryLogger = {
    Calendar: {
        /*
            The only way to dynamicly set the props of the calendar is 
            by adding the HTML on our own. The JS functions don't
            seem to work...   :-(
        */
        AddControl() {
            console.warn('Calendar is broke for now!');
            const el = document.getElementById('LoggerCalendarPanel');

            const todayDate = new Date();


            const todayDateFMT = (todayDate.getMonth() + 1) + "-" +
                todayDate.getDate() + "-" +
                todayDate.getFullYear();

            const calendarHTML = `

            <div id="LoggerCalendar"   
                data-role="calendar" class="compact" 
                data-on-day-click="WebApp.HistoryLogger.Calendar.ChangeLoggerDay()"
                xxxdata-on-change="WebApp.HistoryLogger.Calendar.ChangeLoggerDay"
                data-buttons="today" data-preset="${todayDateFMT}"></div>
            <br>

            `;
            el.innerHTML = calendarHTML;


        },
        ChangeLoggerDay(sel, day, el) {
            // debugger;
            // console.log(arguments);
            var calendar = $('#LoggerCalendar').data('calendar');

            var LogDate = new Date(calendar.getSelected()[0]);

            console.log('change to', LogDate);


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


                            WebApp.HistoryLogger.Logger.Add({
                                TID: 0,
                                Type: 707,
                                DT: new Date(),
                                Topic: "Logger History",
                                Source: "Browser",
                                Body: "History was deleted per user request",
                            });
                            UIHelper.QuickAlert("History was deleted per user request", "info");

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

            if (!WebApp.HistoryLogger.Logger.ActiveLog) {
                WebApp.HistoryLogger.Logger.ActiveLog = TargetElement;
            } else {
                WebApp.HistoryLogger.Logger.ActiveLog.style.display = "none";
                WebApp.HistoryLogger.Logger.ActiveLog = TargetElement;
            }
            // console.log('Show Log List-->', ListElement);
            WebApp.HistoryLogger.Logger.ActiveLog.style.display = "block";
        },

        /*
            Add a log item...
        */
        Add(LogMSG) {
            /*
                    Check https://github.com/johnrnelson/api-puppy/blob/master/Notes/LogTypes.md
            */

            try {


                const tblBody = document.getElementById('LGType-' + LogMSG.Type + '-history');
                if (!tblBody) {
                    debugger;
                    setTimeout(function () {
                        WebApp.HistoryLogger.Add(LogMSG);
                        debugger;
                    }, 5300);

                    return;

                }


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
        FetchRemoteByType(RemoteLogType, CurrentPageNumber) {

            if (!CurrentPageNumber) {
                CurrentPageNumber = 1;
            }
            WebApp.HistoryLogger.Logger.SetListType('serverlogs');





            // debugger;
            var calendar = $('#LoggerCalendar').data('calendar');
            var IsKeyEnabled = $('#IsKeyEnabled')[0];
            if (WebApp.AppPrefs.UserOptions.APIKEY) {
                IsKeyEnabled.innerHTML = " * All IPs * ";
            } else {
                IsKeyEnabled.innerHTML = " * Your IP * ";
            }




            var LogDate = new Date(calendar.getSelected()[0]);
            var fileLogDate;

            try {
                if (LogDate.getFullYear()) {
                    // const LogDate = new Date();
                    fileLogDate = LogDate.getFullYear() + "/" + (LogDate.getMonth() + 1) + "/" + LogDate.getDate()
                } else {
                    console.warn('Using todays date for the logger request!');
                    var LogDate = new Date();
                    fileLogDate = LogDate.getFullYear() + "/" + (LogDate.getMonth() + 1) + "/" + LogDate.getDate()
                }

            } catch (errCalDate) {
                console.warn('Using todays date for the logger request!');
                var LogDate = new Date();
                fileLogDate = LogDate.getFullYear() + "/" + (LogDate.getMonth() + 1) + "/" + LogDate.getDate()
            }





            const ServerLogDisplayType = document.getElementById('ServerLogDisplayType');
            ServerLogDisplayType.innerHTML = "";
            
            
            const ServerPageing = document.getElementById('ServerPageing');
            ServerPageing.innerHTML = "";




            const ServerLogDisplayDate = document.getElementById('ServerLogDisplayDate');
            ServerLogDisplayDate.innerHTML = LogDate.toLocaleDateString();

            const tbl = document.getElementById('LGType-serverlogs-history');
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

                // debugger;


                WebApp.Fetch({
                    "service": "logger",
                    "action": "ReadLogs",
                    "date": fileLogDate,
                    "type": RemoteLogType,
                    "sort": "ID DESC",
                    "page": {
                        "limit": 20,
                        "index": CurrentPageNumber
                    }



                }).then(data => {
                    if (data.err) {
                        debugger;
                        console.warn(data.err);
                        tbl.innerHTML = "";
                    } else {
                        tbl.innerHTML = "";
                        // debugger;

                        ServerLogDisplayType.innerHTML = "<b>" + RemoteLogType + "</b> Total (" + data.logs.length + ")";
 

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
                            <td>${JSON.stringify(logItem.Body)}</td>
                        `;

                            tbl.appendChild(tableRow);
                        }


                        //Pagininage

                        // const pageElement = document.createElement('tr');
                        // pageElement.colspan = "4";

                        // const pageElementCell = document.createElement('td');


                        const pageNumber = document.createElement('span');
                        pageNumber.style.padding = "8px";
                        pageNumber.innerText = CurrentPageNumber;

                        const pageLeft = document.createElement('span');
                        pageLeft.style.padding = "8px";
                        pageLeft.innerText = "<";
                        pageLeft.onclick = function (evt) {
                            CurrentPageNumber--;
                            if (CurrentPageNumber < 0) {
                                CurrentPageNumber = 1;
                                return;
                            }
                            WebApp.HistoryLogger.Logger.FetchRemoteByType(RemoteLogType, CurrentPageNumber);
                        }

                        const pageRight = document.createElement('span');
                        pageRight.style.padding = "8px";
                        pageRight.innerText = ">";
                        pageRight.onclick = function (evt) {
                            CurrentPageNumber++;
                            WebApp.HistoryLogger.Logger.FetchRemoteByType(RemoteLogType, CurrentPageNumber);
                        }
                         
                        ServerPageing.appendChild(pageLeft);
                        ServerPageing.appendChild(pageNumber);
                        ServerPageing.appendChild(pageRight);

                        // pageElement.appendChild(pageElementCell);
                        // tbl.appendChild(pageElement);
                        tbl.appendChild(ServerPageing);





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



//Set default logger view...
WebApp.HistoryLogger.Logger.SetListType('411');
WebApp.HistoryLogger.Calendar.AddControl();