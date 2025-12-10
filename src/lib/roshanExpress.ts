import http, { IncomingMessage, type ServerResponse } from "http";
import { parseBody, parseURLParams, parseURLQueryStrings } from "../extensions/req.js";
type Handler = (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
) => Promise<void> | void;

export class App {
    private _middleware: Handler[] = [];
    private _prefixRoutes: string[] = [];

    constructor() {

    }

    use(path: string, ...handlers: Handler[]): void;
    use(...handlers: Handler[]): void;
    use(arg1: string | Handler, ...args: Handler[]): void {
        if (typeof arg1 === "string" ) {
            this._middleware.push(async (req, res, next) => {
                if (req.url?.startsWith(arg1)){
                    await this._handle(...args)(req, res);
                    return;
                }
                next?.();
            });
            return;
        }
        this._middleware.push(...args);
        
    }

    private _handle(...handlers: Handler[]) {
        const handling = async (req: IncomingMessage, res:ServerResponse) => {
            const run = async (index: number): Promise<void> => {
            const layer = handlers[index];
            if(!layer) return;
            if(res.writableEnded) return;
            try {
                await layer(req, res, async () => run(index + 1));
            } catch (error) {
                console.log("Middleware Error: ", error);
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end("Internal server Error!!!");
                }
            }
        } 
        run(0);
        }
        return handling;
        
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