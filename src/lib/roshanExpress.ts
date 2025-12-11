import { IncomingMessage } from "http";
import type { ServerResponse } from "http";
import { App } from "./app.js";
import { ServeStatic } from "./static.js";
import { Route } from "./router.js";
import type { Handler } from "./handler.js";



export type LoggerOption = {
    method?: string,
    url?: string,
    statusCode?: string
};

export type RoshanExpressOptions = {
    logger?: Logger
}

export type Logger = boolean | LoggerOption;

export type RoshanExpressRequest = IncomingMessage;
export type RoshanExpressRespons = ServerResponse;
export type RoshanExpressHandler = Handler;

export interface IRouter {
    get: (url: string, ...handlers: Handler[]) => void;
    post: (url: string, ...handlers: Handler[]) => void;
    delete: (url: string, ...handlers: Handler[]) => void;
    put: (url: string, ...handlers: Handler[]) => void;
    patch: (url: string, ...handlers: Handler[]) => void;
}

function roshanExpress(options?: RoshanExpressOptions) {
    const app = new App(options);
    const handler = app.requestHandler();

    const proxy = new Proxy(handler, {
        get(target, prop, receiver) {
            if (prop in app) {
                const value = (app as any)[prop];
                if (typeof value === "function") {
                    return value.bind(app);
                }
                return value;
            }
            return (target as any)[prop];
        }
    });

    return proxy as App & ((req: IncomingMessage, res: ServerResponse) => Promise<void>);
}

function serStatic(folder: string) {
    const sStatic = new ServeStatic(folder);
    return sStatic.static();
}
roshanExpress.static = serStatic;

export function Router() {
    return new Route();
}

export default roshanExpress;



