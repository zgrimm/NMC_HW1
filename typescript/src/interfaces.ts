export interface MethodHandlers {
	get(data: any, callback: any) : void; 
	put(data: any, callback: any) : void; 
	post(data: any, callback: any) : void; 
	delete(data: any, callback: any) : void; 
};

export interface RequestData {
	trimmedPath : string;
	queryStringObj : any;
	method : string;
	headers : any;
	payload : any
};