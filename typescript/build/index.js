"use strict";
/// <reference path="../index.d.ts" />
/*
** Entry Point for App, starts up the server
*/
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var http = require("http");
var https = require("https");
var fs = require("fs");
var url = require("url");
var String_Decoder = require("string_decoder");
var StringDecoder = String_Decoder.StringDecoder;
// Instantiate http server
var httpServer = http.createServer(createServerCB);
// Start the http Server
httpServer.listen(3000, function () {
    console.log("Http Server Running on Port: 3000");
});
// Instantiate httpsServer
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, createServerCB);
// Start the httpsServer
httpsServer.listen(5000, function () {
    console.log("Https Server Running on Port: 5000");
});
//Instantiate handlers
var router = {};
// Determine method and call proper handler
router.hello = function (data, callback) {
    var allowedMethods = ['post', 'get', 'put', 'delete'];
    if (allowedMethods.indexOf(data.method) > -1) {
        crudHandlers[data.method](data, callback);
    }
    else {
        callback(405);
    }
};
// Different handlers to be used depending on method
var crudHandlers = {
    post: null,
    put: null,
    get: null,
    delete: null
};
crudHandlers.post = function (data, callback) {
    callback(200, { "Message": "You made a POST request to /hello. Welcome!!" });
};
crudHandlers.get = function (data, callback) {
    callback(200, { "Message": "You made a GET request to /hello. Welcomes are only for POSTs!!" });
};
crudHandlers.put = function (data, callback) {
    callback(200, { "Message": "You made a PUT request to /hello. Welcomes are only for POSTs!!" });
};
crudHandlers.delete = function (data, callback) {
    callback(200, { "Message": "You made a DELETE request to /hello. Welcomes are only for POSTs!!" });
};
var notFound = function (data, callback) {
    callback(404);
};
//Callback function used when creating either server (http & https), parses data from request and packages to be consumed by appropriate route handler, which is called
function createServerCB(req, res) {
    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);
    // Get the path from Url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    // Get the query string and parse as an object
    var queryStringObj = parsedUrl.query;
    // Get Request method
    var method = req.method.toLowerCase();
    // Get the headers 
    var headers = req.headers;
    // Get the payload if it exists
    var decoder = new StringDecoder('utf8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();
        // Construct data object for use by handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObj': queryStringObj,
            'method': method,
            'headers': headers,
            'payload': buffer
        };
        // if path isn't to hello, return 404
        if (trimmedPath == 'hello') {
            router.hello(data, function (statusCode, payload) {
                //Sanity Checks
                statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
                payload = typeof (payload) == 'object' ? payload : {};
                //Convert payload to a string
                var payloadString = JSON.stringify(payload);
                // Return Response
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(statusCode);
                res.end(payloadString);
            });
        }
        else {
            notFound(data, function (statusCode) {
                // Return Response
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(statusCode);
                var msg = { "Message": "We Only welcome when people come through the right door." };
                res.end(JSON.stringify(msg));
            });
        }
    });
}
