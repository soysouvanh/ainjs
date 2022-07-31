// Declare global variables
global.HOME_URL = "https://ainjs.com";
global.SITE_NAME = "AiNJS";
global.AUTHOR = "Vincent SOYSOUVANH";

// Create server
const http = require("http");
const server = http.createServer(function (req, res) {
    // Load Ainjs class
    const Ainjs = require(__dirname + "/index.js");

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