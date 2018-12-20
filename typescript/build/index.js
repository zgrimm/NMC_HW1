"use strict";
/// <reference path="../ref/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
/**********************************************
** Entry Point for App, starts up the server **
**********************************************/
// Dependencies
var http = require("http");
var https = require("https");
var fs = require("fs");
var url = require("url");
var String_Decoder = require("string_decoder");
var StringDecoder = String_Decoder.StringDecoder;
var AppServer = /** @class */ (function () {
    function AppServer() {
        // Different handlers to be used depending on method
        this.crudHandlers = {
            post: null,
            put: null,
            get: null,
            delete: null
        };
        this.init();
    }
    ;
    AppServer.prototype.init = function () {
        this.setupRoutes();
        this.createServers();
        this.makeServersListen();
    };
    AppServer.prototype.createServers = function () {
        this.httpServer = http.createServer(this.createServerCB.bind(this)); //// Instantiate http server
        this.httpsServerOptions = {
            'key': fs.readFileSync('../../https/key.pem'),
            'cert': fs.readFileSync('../../https/cert.pem')
        };
        this.httpsServer = https.createServer(this.httpsServerOptions, this.createServerCB.bind(this)); //// Instantiate httpsServer
    };
    AppServer.prototype.makeServersListen = function () {
        // Start the http Server
        this.httpServer.listen(3000, function () {
            console.log("Http Server Running on Port: 3000");
        });
        // Start the httpsServer
        this.httpsServer.listen(5000, function () {
            console.log("Https Server Running on Port: 5000");
        });
    };
    AppServer.prototype.setupRoutes = function () {
        var _this = this;
        // Determine method and call proper handler
        this.router = this.router && typeof (this.router) == 'object' ? this.router : {};
        this.router.hello = function (data, callback) {
            var allowedMethods = ['post', 'get', 'put', 'delete'];
            if (allowedMethods.indexOf(data.method) > -1) {
                _this.crudHandlers[data.method](data, callback);
            }
            else {
                callback(405);
            }
        };
        this.crudHandlers.post = function (data, callback) {
            callback(200, { "Message": "You made a POST request to /hello. Welcome!!" });
        };
        this.crudHandlers.get = function (data, callback) {
            callback(200, { "Message": "You made a GET request to /hello. Welcomes are only for POSTs!!" });
        };
        this.crudHandlers.put = function (data, callback) {
            callback(200, { "Message": "You made a PUT request to /hello. Welcomes are only for POSTs!!" });
        };
        this.crudHandlers.delete = function (data, callback) {
            callback(200, { "Message": "You made a DELETE request to /hello. Welcomes are only for POSTs!!" });
        };
        this.notFound = function (data, callback) {
            callback(404);
        };
    };
    AppServer.prototype.createServerCB = function (req, res) {
        var _this = this;
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
                _this.router.hello(data, function (statusCode, payload) {
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
                _this.notFound(data, function (statusCode) {
                    // Return Response
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(statusCode);
                    var msg = { "Message": "We Only welcome when people come through the right door." };
                    res.end(JSON.stringify(msg));
                });
            }
        });
    };
    return AppServer;
}());
exports.AppServer = AppServer;
var app = new AppServer();
