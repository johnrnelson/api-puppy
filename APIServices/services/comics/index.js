/*
    The actual data service...
    
*/
const DataActions = {
  
 
    list(RequestData, OnComplete) {

        // const result = {
        //     msg: 'List all the comics.',
        //     data: SERVER.IN_MEM_DB.fruit
        // };
        // OnComplete(null, result);



        const fs = require('fs');
        const path = require('path');
 
        const examplesFilePath = path.join(__dirname, "samples",  "ComicCubeSample.json");


        fs.readFile(examplesFilePath, 'utf8', function (err, ComicData) {
            if (err) {
                debugger;
                console.log(RequestData);
                console.log(sampleid);
                console.log(examplesFilePath);
                SERVER.Statistics.Services.AddSiteMapItem("help","Errors");

                OnComplete(null, {
                    err: 'Unable to get that file!',                 
                    debug: RequestData
                });
            } else {
                // SERVER.Statistics.Services.AddSiteMapItem("help","Success");
                
                OnComplete(null, {
                    msg: "Have fun with this code!",
                    data: JSON.parse(ComicData),
                });
            }
        });//End reading file...















    },
 
};

function ServiceRequest(RequestObj, RequestData, OnComplete) {



    if (RequestData.action) {
        try {
            const task = DataActions[RequestData.action];
            if (!task) {
                const result = {
                    err: 'Action was not found! ' + RequestData.action,
                };
                OnComplete(null, result);
                SERVER.Statistics.Services.AddSiteMapItem("comics","Errors");
            } else {
             
                SERVER.Statistics.Services.AddSiteMapItem("comics","Success");
                task(RequestData, OnComplete);
            }
        } catch (errOnAction) {
            debugger;
            const result = {
                err: 'Error in Action! ',
            };
            SERVER.Statistics.Services.AddSiteMapItem("comics","Errors");
            OnComplete(null, result);            
        }

    } else {
        const result = {
            err: 'No database action! We are working on this though. :-)',
            // put what you need in here to help the user debug any issues...
            debug: {
                User: RequestObj.User,
                QueryData: RequestObj.QueryData,
                QueryPath: RequestObj.QueryPath,
            },
        };


        OnComplete(null, result);
        SERVER.Statistics.Services.AddSiteMapItem("comics","Errors");
    }



}
exports.ServiceRequest = ServiceRequest;