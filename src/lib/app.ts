import http from "http";
import { parseBody, parseURLParams, parseURLQueryStrings, type RoshanExpressRequest } from "../extensions/req";
import { Handle, type Handler } from "./handler";
import { Route} from "./router";
import type { IRouter, Logger, RoshanExpressOptions } from "./roshanExpress";
import type { RoshanExpressRespons } from "../extensions/res";
import { HttpError } from "./errors/httpError";





export class App extends Handle<Route> implements IRouter {
    logger?: Logger
    private _middleware: Handler[] = [];
    private _prefixRoutes: string[] = [];
    static routed: number = 0;

    constructor(options? :RoshanExpressOptions) {
        super();

        if (options?.logger) this.logger = options.logger;
    }

    private _setLogger(req: RoshanExpressRequest, res: RoshanExpressRespons): void {
        if (!this.logger) return;
        if (typeof this.logger === "boolean") {
            console.log(req?.method, req?.url, res.statusCode);
            return;
        }
        console.log(this.logger.method, this.logger.url, this.logger.statusCode)
    }

    use(...handlers: Handler[]): void;
    use(path: string, ...handlers: Handler[]): void;
    use(prefix: string, router: Route): void;
    use(arg1: string | Handler, arg2: Handler | Route, ...args: Handler[]): void {
        this._use(this._middleware, arg1, arg2, ...args);   
    }

    get(url: string, ...handlers: Handler[]) {
        this.use(this._publicHandler(url, "GET", ...handlers));
    }

    post(url: string, ...handlers: Handler[]) {
        this.use(this._publicHandler(url, "POST", ...handlers))
    }

    delete(url: string, ...handlers: Handler[]) {
        this.use(this._publicHandler(url, "DELETE", ...handlers))
    }

    put(url: string, ...handlers: Handler[]) {
        this.use(this._publicHandler(url, "PUT", ...handlers))
    }

    patch(url: string, ...handlers: Handler[]) {
        this.use(this._publicHandler(url, "PATCH", ...handlers))
    }

    private _handleError (err: any, req: RoshanExpressRequest, res: RoshanExpressRespons) {
        if (err instanceof HttpError) {
            return res.status(err.statusCode).json({
                code: err.code,
                message: err.message
            });
        }
        console.error(err);
        res.status(500).json({
            code: "INTERNAL_ERROR",
            message: "Something went wrong"
        })
    }

    requestHandler() {
        const rh = async (req: RoshanExpressRequest, res: RoshanExpressRespons) => {
            try {
                await parseBody(req);
                parseURLQueryStrings(req);
                await this._handle(...this._middleware)(req, res);
                this._setLogger(req, res);
            } catch (error) {
                this._handleError(error, req, res);
            }
        }

        return rh;
    }

    listen(port: number, listener?: () => void) {
        const server = http.createServer(this.requestHandler());
        server.listen(port);
        listener?.();
    }

}