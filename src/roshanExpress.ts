import type { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "./extensions/req.js";
type Handler = (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
) => Promise<void> | void;

export class App {
    private _middleware: Handler[] = [];

    constructor() {

    }

    use(handler: Handler) {
        this._middleware.push(handler);
    }

    get(url: string, handler: Handler) {
        this.use(async (req, res) => {
            if (req.method === "GET" && req.url?.startsWith(url)) {
                await handler(req, res);
            }
        })
    }

    post(url: string, handler: Handler) {
        this.use(async (req, res) => {
            if (req.method === "POST" && req.url?.startsWith(url)) {
                await handler(req, res);
            }
        })
    }

    delete(url: string, handler: Handler) {
        this.use(async (req, res) => {
            if (req.method === "DELETE" && req.url?.startsWith(url)) {
                await handler(req, res);
            }
        })
    }

    put(url: string, handler: Handler) {
        this.use(async (req, res) => {
            if (req.method === "put" && req.url?.startsWith(url)) {
                await handler(req, res);
            }
        })
    }

    patch(url: string, handler: Handler) {
        this.use(async (req, res) => {
            if (req.method === "patch" && req.url?.startsWith(url)) {
                await handler(req, res);
            }
        })
    }
}