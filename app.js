// Declare global variables
global.HOME_URL = "https://ainjs.com";
global.SITE_NAME = "AiNJS";
global.AUTHOR = "Vincent SOYSOUVANH";

// Create server
const http = require("http");
const server = http.createServer(function (req, res) {
    /*
    // Case static file (with file extension)
    const Ainjs = require(__dirname + "/application/Ainjs.js"),
      uri = req.url.split("?")[0],
      t = uri.split(".");
    if(t.length > 1) {
      // Map file extension to MIME types
      // Full list can be found here: https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
      const mimeType = Ainjs.getMimeTypes(),
        contentType = mimeType[t[t.length - 1]];

      // Case file extension found
      if(contentType !== undefined) {
        // Read file from file system
        const fs = require("fs");
        fs.readFile(__dirname + "/public" + uri, (err, data) => {
          // Case error
          if(err) {
            res.writeHead(404, {"Content-Type": contentType});
            res.end(http.STATUS_CODES[404]);
            return;
          }

          // Case file found
          res.writeHead(200, {"Content-type": contentType});
          res.end(data);
        });
      }

      // Case file extension unfound
      else {
        res.writeHead(404, {"Content-Type": mimeType.html});
        res.end(http.STATUS_CODES[404]);
      }
    }

    // Case dynamic file
    else {
      // Run
      new Ainjs({
        http: http,
        request: req,
        response: res,
        template: "default"
      }).run();
    }
    */

    // Load Ainjs class
    const Ainjs = require(__dirname + "/Ainjs.js");

    // Run request
    new Ainjs({
      http: http,
      request: req,
      response: res,
      template: "default"
    }).run();
});

server.listen(8080, () => {
  console.log("server started at port 8008");
});