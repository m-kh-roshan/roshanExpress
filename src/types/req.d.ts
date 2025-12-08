import "http";
declare module "http" {
    export interface IncomingMessage {
        body?: object;
        params?: object;
        query?: object; 
    }
}