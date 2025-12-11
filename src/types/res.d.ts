import { ServerResponse } from "http";
declare module "http" {
    interface ServerResponse {
        json(body?: object): void;
        send(body?: any): void;
        redirect(status: number, url: string): void;
        redirect(url: string): void;
        status(statusCode: number);
    }
}