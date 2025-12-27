import { HttpError } from "./httpError";

export class NoDataFileError extends HttpError {
    constructor() {
        super(400, "NO_DATA", "file has no data");
    }
}