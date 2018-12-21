

/**********************************************
** Entry Point for App, starts up the server **
**********************************************/

// Dependencies
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as url from 'url';
import * as String_Decoder from 'string_decoder';
const StringDecoder = String_Decoder.StringDecoder;

//Interfaces
import { MethodHandler, RequestData } from './interfaces';
import { IncomingMessage, ServerResponse } from 'http';
import { ServerOptions } from 'https';

export class AppServer {

	private httpServer;
	private httpsServer;
	private httpsServerOptions: ServerOptions;
	private router: any;
	// Different handlers to be used depending on method
	private crudHandlers: MethodHandler = {
		post: null,
		put: null,
		get: null,
		delete: null
	};
	private notFound: any;

	constructor() {
		this.init();
	};

	public init(): void {
		this.setupRoutes();
		this.createServers();
		this.makeServersListen();
	}

	private createServers(): void {
		this.httpServer = http.createServer(this.createServerCB.bind(this)); //// Instantiate http server
		this.httpsServerOptions = {
			'key' : fs.readFileSync('../../https/key.pem'),
			'cert' : fs.readFileSync('../../https/cert.pem')
		};
		this.httpsServer = https.createServer(this.httpsServerOptions, this.createServerCB.bind(this)); //// Instantiate httpsServer
	}

	private makeServersListen(): void {
		// Start the http Server
		this.httpServer.listen(3000, () => {
			console.log("Http Server Running on Port: 3000");
		});

		// Start the httpsServer
		this.httpsServer.listen(5000, () => {
			console.log("Https Server Running on Port: 5000");
		});
	}

	private setupRoutes(): void {
		// Determine method and call proper handler
		this.router = this.router && typeof(this.router) =='object' ? this.router : {};
		this.router.hello = (data: RequestData, callback) => {
			let allowedMethods = ['post', 'get', 'put', 'delete'];
			if(allowedMethods.indexOf(data.method) > -1) {
				this.crudHandlers[data.method](data, callback);
			} else {
				callback(405);
			}
		};

		this.crudHandlers.post = function(data: RequestData, callback) {
			callback(200, {"Message": "You made a POST request to /hello. Welcome!!"});
		};
		this.crudHandlers.get = function(data: RequestData, callback) {
			callback(200, {"Message": "You made a GET request to /hello. Welcomes are only for POSTs!!"});
		};
		this.crudHandlers.put = function(data: RequestData, callback) {
			callback(200, {"Message": "You made a PUT request to /hello. Welcomes are only for POSTs!!"});
		};
		this.crudHandlers.delete = function(data: RequestData, callback) {
			callback(200, {"Message": "You made a DELETE request to /hello. Welcomes are only for POSTs!!"});
		};
		this.notFound = function (data: RequestData, callback) {
			callback(404);
		};
		
	}
	

	private createServerCB(req: IncomingMessage, res: ServerResponse): void {
		// Get the url and parse it
		let parsedUrl = url.parse(req.url, true);		
		// Get the path from Url
		let path = parsedUrl.pathname;
		let trimmedPath = path.replace(/^\/+|\/+$/g, '');
		// Get the query string and parse as an object
		let queryStringObj = parsedUrl.query;
		// Get Request method
		let method = req.method.toLowerCase();
		// Get the headers 
		let headers = req.headers;

		// Get the payload if it exists
		let decoder = new StringDecoder('utf8');
		let buffer = '';
		req.on('data', (data) => {
			buffer += decoder.write(data);		
		});
		req.on('end', () => {
			buffer += decoder.end();

			// Construct data object for use by handler
			let data: RequestData = {
				'trimmedPath' : trimmedPath,
				'queryStringObj' : queryStringObj,
				'method' : method,
				'headers' : headers,
				'payload' : buffer
			};

			// if path isn't to hello, return 404
			if(trimmedPath == 'hello') {
				this.router.hello(data, (statusCode: number, payload) : void => {
					//Sanity Checks
					statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
					payload = typeof(payload) == 'object' ? payload : {};
					//Convert payload to a string
					let payloadString = JSON.stringify(payload);
					// Return Response
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(statusCode);
					res.end(payloadString);
				});
			} else {
				this.notFound(data, (statusCode: number) : void => {
					// Return Response
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(statusCode);
					let msg = {"Message" :"We Only welcome when people come through the right door."};
					res.end(JSON.stringify(msg));
				});
			}

		});
	}

}

let app = new AppServer();




