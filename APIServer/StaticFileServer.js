/*
    Simple static file server...
*/
function ServeStaticFile(request, response) {
    const fs = require("fs");
    const path = require("path");

    var reqPath = request.url.substring(2, request.url.length);


    if (!reqPath) {
        response.status = 200;

        response.setHeader('Content-Type', 'text/html');

        response.end("No path to load.");
        return;
    }

    reqPath = path.normalize(reqPath);
    reqPath = path.resolve(reqPath);


    const fileExtension = path.extname(reqPath);

    var contentType = "text/html";

    if (fileExtension == ".jpeg") {
        contentType = "image/jpeg";
        // debugger;
        try {
            var s = fs.createReadStream(SERVER.ServicesHTMLDocs + reqPath);

            response.status = 200;

            response.setHeader('Content-Type', contentType);

            s.on('error', function () {
                response.statusCode = 404;
                response.end('Not found');
            });
            s.on('open', function () {

                s.pipe(response);
            });
        } catch (errStreamFile) {
            console.log(errStreamFile);
            debugger;

        }

        return;
    }


    if (fileExtension == ".js") {
        contentType = "text/javascript";
    }

    if (fileExtension == ".css") {
        contentType = "text/css";
    }
    fs.readFile(SERVER.ServicesHTMLDocs + reqPath, function (err, DocFileContents) {


        if (err) {

            response.status = 404;
            response.setHeader('Content-Type', contentType);

            response.end("ERROR!");
        } else {
            response.status = 200;
            response.setHeader('Content-Type', contentType);
            // response.end(debugHTML);
            response.end(DocFileContents, 'binary');


        }
    });//end debug html....        

}

exports.ServeStaticFile=ServeStaticFile;