import "http";
declare module "http" {
    export interface IncomingMessage {
        body?: any;
        params?: any;
        query?: any; 
    }
}