import http, { IncomingMessage, type ServerResponse } from "http";
import { parseBody, parseURLParams, parseURLQueryStrings } from "../extensions/req.js";
import { Handle } from "./handler.js";
import { Router, type IRouter } from "./router.js";

export type Handler = (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
) => Promise<void> | void;

export class App extends Handle implements IRouter {
    private _middleware: Handler[] = [];
    private _prefixRoutes: string[] = [];
    static routed: number = 0;

    constructor() {
        super()
    }
    
    use(...handlers: Handler[]): void;
    use(path: string, ...handlers: Handler[]): void;
    use(prefix: string, router: Router): void;
    use(arg1: string | Handler, arg2: Handler | Router, ...args: Handler[]): void {
        if (typeof arg1 === "string") {
            if (arg2 instanceof Router) {
                this._middleware.push(async (req, res, next) => {
                    if (req.url?.startsWith(arg1)){
                        req.url = req.url.slice(arg1.length) || "/";
                        await this._handle(...arg2.layers)(req, res);
                        return;
                    }
                    next?.();
                });
                return;
            }
            this._middleware.push(async (req, res, next) => {
                if (parseURLParams(req, arg1)) {
                    await this._handle(arg2, ...args)(req, res);
                    return;
                }
                next?.();
            });
            return;
        }
        this._middleware.push(arg1, ...args);
        
    }

    get(url: string, ...handlers: Handler[]) {
        this.use(async (req, res, next) => {
            if (req.method === "GET" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
                return;
            }
            next?.();
        })
    }

    post(url: string, ...handlers: Handler[]) {
        this.use(async (req, res, next) => {
            if (req.method === "POST" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    delete(url: string, ...handlers: Handler[]) {
        this.use(async (req, res, next) => {
            if (req.method === "DELETE" && parseURLParams(req, url)) {
                parseURLParams(req, url);
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    put(url: string, ...handlers: Handler[]) {
        this.use(async (req, res, next) => {
            if (req.method === "put" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    patch(url: string, ...handlers: Handler[]) {
        this.use(async (req, res, next) => {
            if (req.method === "patch" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    requestHandler() {
        const rh = async (req: IncomingMessage, res: ServerResponse) => {
            console.log(App.routed++);
            await parseBody(req);
            parseURLQueryStrings(req);
            this._handle(...this._middleware)(req, res);
        }

        return rh;
    }



    listen(port: number) {
        const server = http.createServer(this.requestHandler());
        server.listen(port);
    }
}