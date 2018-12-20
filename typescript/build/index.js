"use strict";
/// <reference path="../ref/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
/*
**
** Entry Point for App, starts up the server
**
*/
// Dependencies
var http = require("http");
var https = require("https");
var fs = require("fs");
var url = require("url");
var String_Decoder = require("string_decoder");
var StringDecoder = String_Decoder.StringDecoder;
var AppServer = /** @class */ (function () {
    function AppServer() {
        this.router = {};
        // Different handlers to be used depending on method
        this.crudHandlers = {
            post: null,
            put: null,
            get: null,
            delete: null
        };
    }
    ;
    AppServer.prototype.init = function () {
        this.setupRoutes();
        this.createServers();
        this.makeServerListen();
    };
    AppServer.prototype.createServers = function () {
        this.httpServer = http.createServer(this.createServerCB.bind(this)); //// Instantiate http server
        this.httpsServerOptions = {
            'key': fs.readFileSync('../../https/key.pem'),
            'cert': fs.readFileSync('../../https/cert.pem')
        };
        this.httpsServer = https.createServer(this.httpsServerOptions, this.createServerCB.bind(this)); //// Instantiate httpsServer
    };
    AppServer.prototype.makeServerListen = function () {
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
app.init();
//Callback function used when creating either server (http & https), parses data from request and packages to be consumed by appropriate route handler, which is called
// /// <reference path="../ref/index.d.ts" />
// /*
// ** Entry Point for App, starts up the server
// */
// // Dependencies
// import * as http from 'http';
// import * as https from 'https';
// import * as fs from 'fs';
// import * as url from 'url';
// import * as String_Decoder from 'string_decoder';
// const StringDecoder = String_Decoder.StringDecoder;
// //Interfaces
// import { MethodHandlers } from './interfaces';
// import { RequestData } from './interfaces';
// export class AppServer {
// }
// // Instantiate http server
// const httpServer = http.createServer(createServerCB);
// // Start the http Server
// httpServer.listen(3000, () => {
// 	console.log("Http Server Running on Port: 3000");
// });
// // Instantiate httpsServer
// const httpsServerOptions = {
// 	'key' : fs.readFileSync('../../https/key.pem'),
// 	'cert' : fs.readFileSync('../../https/cert.pem')
// };
// const httpsServer = https.createServer(httpsServerOptions, createServerCB);
// // Start the httpsServer
// httpsServer.listen(5000, () => {
// 	console.log("Https Server Running on Port: 5000");
// });
// //Instantiate handlers
// let router: any = {};
// // Determine method and call proper handler
// router.hello = function(data, callback) {
// 	let allowedMethods = ['post', 'get', 'put', 'delete'];
// 	if(allowedMethods.indexOf(data.method) > -1) {
// 		crudHandlers[data.method](data, callback);
// 	} else {
// 		callback(405);
// 	}
// };
// // Different handlers to be used depending on method
// let crudHandlers: MethodHandlers = {
// 	post: null,
// 	put: null,
// 	get: null,
// 	delete: null
// };
// crudHandlers.post = function(data, callback) {
// 	callback(200, {"Message": "You made a POST request to /hello. Welcome!!"});
// };
// crudHandlers.get = function(data, callback) {
// 	callback(200, {"Message": "You made a GET request to /hello. Welcomes are only for POSTs!!"});
// };
// crudHandlers.put = function(data, callback) {
// 	callback(200, {"Message": "You made a PUT request to /hello. Welcomes are only for POSTs!!"});
// };
// crudHandlers.delete = function(data, callback) {
// 	callback(200, {"Message": "You made a DELETE request to /hello. Welcomes are only for POSTs!!"});
// };
// var notFound = function (data, callback) {
// 	callback(404);
// };
// //Callback function used when creating either server (http & https), parses data from request and packages to be consumed by appropriate route handler, which is called
// function createServerCB(req, res) {
// 	// Get the url and parse it
// 	let parsedUrl = url.parse(req.url, true);
// 	// Get the path from Url
// 	let path = parsedUrl.pathname;
// 	let trimmedPath = path.replace(/^\/+|\/+$/g, '');
// 	// Get the query string and parse as an object
// 	let queryStringObj = parsedUrl.query;
// 	// Get Request method
// 	let method = req.method.toLowerCase();
// 	// Get the headers 
// 	let headers = req.headers;
// 	// Get the payload if it exists
// 	let decoder = new StringDecoder('utf8');
// 	let buffer = '';
// 	req.on('data', (data) => {
// 		buffer += decoder.write(data);		
// 	});
// 	req.on('end', () => {
// 		buffer += decoder.end();
// 		// Construct data object for use by handler
// 		let data: RequestData = {
// 			'trimmedPath' : trimmedPath,
// 			'queryStringObj' : queryStringObj,
// 			'method' : method,
// 			'headers' : headers,
// 			'payload' : buffer
// 		};
// 		// if path isn't to hello, return 404
// 		if(trimmedPath == 'hello') {
// 			router.hello(data, (statusCode: number, payload) : void => {
// 				//Sanity Checks
// 				statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
// 				payload = typeof(payload) == 'object' ? payload : {};
// 				//Convert payload to a string
// 				let payloadString = JSON.stringify(payload);
// 				// Return Response
// 				res.setHeader('Content-Type', 'application/json');
// 				res.writeHead(statusCode);
// 				res.end(payloadString);
// 			});
// 		} else {
// 			notFound(data, (statusCode: number) : void => {
// 				// Return Response
// 				res.setHeader('Content-Type', 'application/json');
// 				res.writeHead(statusCode);
// 				let msg = {"Message" :"We Only welcome when people come through the right door."};
// 				res.end(JSON.stringify(msg));
// 			});
// 		}
// 	});
// }/
