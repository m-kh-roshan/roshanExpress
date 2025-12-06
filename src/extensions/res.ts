import { ServerResponse } from "http"

ServerResponse.prototype.json = function(body) {
    this.setHeader("content-type", "application/json");
    const data = JSON.stringify(body);
    this.end(data);
}

ServerResponse.prototype.send = function(body) {
    if (typeof body === "object") {
        this.setHeader("content-type", "application/json")
    }
    if (typeof body === null || typeof body === undefined) {
        this.setHeader("content-type", "application/plain")
    }
}
