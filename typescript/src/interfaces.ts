export interface MethodHandler {
	get : HandlerCallback; 
	put : HandlerCallback; 
	post : HandlerCallback; 
	delete : HandlerCallback; 
};

export interface RequestData {
	trimmedPath : string;
	queryStringObj : any;
	method : string;
	headers : any;
	payload : any
};

export interface HandlerCallback {
	(data: RequestData, callback: any) : void;
};