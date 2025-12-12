import { ServerResponse } from "http"

declare module "http" {
    interface ServerResponse {
        json(body?: object): void;
        send(body?: any): void;
        redirect(status: number, url: string): void;
        redirect(url: string): void;
        status(statusCode: number): void;
    }
}

ServerResponse.prototype.json = function(body) {
     if (body === null || body === undefined) {
        this.statusCode = 204;
        return this.end();
    }
    this.setHeader("content-type", "application/json");
    const data = JSON.stringify(body);
    this.end(data);
}

ServerResponse.prototype.send = function(body) {
    if (body === null || body === undefined) {
        this.statusCode = 204;
        return this.end();

    }
    if (typeof body === "object") {
        if (Buffer.isBuffer(body)) {
            this.setHeader("content-type", "application/octet-stream");
            return this.end(body);
        } 
        return this.json(body);
    }
    if (typeof body === "string") {
        this.setHeader("content-type", "text/html");
        return this.end(body);
    } 
    
    body = body.toString()

    this.end(body)
}

ServerResponse.prototype.redirect = function(arg1: number| string, arg2?: string) {
    if (typeof arg1 === "string") {
        this.writeHead(302, {
            location: arg1 
        })
        this.end();
        return;
    }
    this.writeHead(arg1, {
        location: arg2
    })
    this.end();
    return;
}

ServerResponse.prototype.status = function(statusCode) {
    this.statusCode = statusCode;
    return this;
}
