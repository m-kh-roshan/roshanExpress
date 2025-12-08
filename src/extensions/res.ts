import { ServerResponse } from "http"

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

    } else if (typeof body === "object") {
        if (Buffer.isBuffer(body)) {
            this.setHeader("content-type", "application/octet-stream");
        } else return this.json(body);

    }else if (typeof body === "string") {
        this.setHeader("content-type", "application/html");

    } else {
        body = body.toString()
    }

    this.end(body)
}
