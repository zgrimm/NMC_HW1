export interface MethodHandler {
	get(data: RequestData, callback: any) : void; 
	put(data: RequestData, callback: any) : void; 
	post(data: RequestData, callback: any) : void; 
	delete(data: RequestData, callback: any) : void; 
};

export interface RequestData {
	trimmedPath : string;
	queryStringObj : any;
	method : string;
	headers : any;
	payload : any
};
