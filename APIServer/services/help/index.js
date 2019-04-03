const topics = {
    //Get a list of sample files to work with....
    'sample-code-list': function (RequestData, OnComplete) {

        // const RequestData = RequestData.data;
     

        const sampleid = RequestData.sampleid.replace(/\./g, '');

        // console.log(sampleid);

        const fs = require('fs');
        const path = require('path');


        // const examplesFolder = path.resolve(path.join(SERVER.RootFolder, "services",
        //     path.normalize(path.join('data', 'examples'))));

        const examplesFolder = path.resolve(path.join(SERVER.RootFolder, "services", sampleid, 'examples'));


        // console.log(examplesFolder);

        fs.readdir(examplesFolder, function (err, items) {
            if (err) {
                debugger;
            } else {


                const sampleFiles = [];

                for (var i = 0; i < items.length; i++) {
                   
                    var stripFileName = items[i].replace('.json', '');
 
                    sampleFiles.push(stripFileName);
                }

                OnComplete(null,{
                    samples: sampleFiles
                }); 
            }


        });

    },
    //get the actual sample file...
    'sample-code-fetch': function (RequestData, OnComplete) {
        // const RequestData = RequestData.data;
       
        const sampleid = RequestData.sampleid.replace(/\./g, '');

        const targetService = RequestData["target-service"].replace(/\./g, '');

        // console.log(sampleid, targetService);

        const fs = require('fs');
        const path = require('path');

        const examplesFilePath = path.join(SERVER.RootFolder, "services", targetService, "examples", sampleid + ".json");



        fs.readFile(examplesFilePath, 'utf8', function (err, data) {
            if (err) {
                debugger;
                console.log(RequestData);
                console.log(sampleid);
                console.log(examplesFilePath);
                response.end(JSON.stringify({
                    path: examplesFilePath,
                    err: err.message,
                }));
            } else {
                OnComplete(null,{
                    msg: "Have fun with this code!",
                    code: JSON.parse(data),
                });
                // response.end(JSON.stringify({
                //     msg: "Have fun with this code!",
                //     code: JSON.parse(data),
                // }));
            }


        });



    }
};


//Change this!!!
function ServiceRequest(RequestObj,RequestData,  OnComplete) {


    var RequestData = RequestData.data;
 
    try {

        


        if (!RequestData.topic) {

            OnComplete('Please supply a topic!', null);


        } else {

            const activeTopic = topics[RequestData.topic];

            if (!activeTopic) {
                OnComplete('Ok now write help about this topic <b>' + RequestData.topic + '<b>! lol', null);

            } else {
                activeTopic(RequestData, OnComplete);
            }
        }
    }
    catch (errorService) {
        OnComplete(errorService.message, null); 
    } 
}
exports.ServiceRequest = ServiceRequest;