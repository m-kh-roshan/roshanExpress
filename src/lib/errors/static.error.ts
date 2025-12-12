import { HttpError } from "./httpError";

export class StaticError extends HttpError {
    constructor (path: string) {
        super(404, "NOT_FOUND", `file ${path} not found or Internal error`);
    }
}