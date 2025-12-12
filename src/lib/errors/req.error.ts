import { HttpError } from "./httpError";

export class BadJsonError extends HttpError {
    constructor() {
        super(400, "BAD_JSON", "JSON is invalid");
    }
}
