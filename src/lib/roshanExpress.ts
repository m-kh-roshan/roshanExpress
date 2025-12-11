import type { IncomingMessage } from "http";
import type { ServerResponse } from "http";
import type { RoshanExpressOptions } from "../types/roshanexpress.js";
import { App } from "./app.js";
import { ServeStatic } from "./static.js";
import { Route } from "./router.js";


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

function newRouter() {
    return new Route();
}
roshanExpress.Router = newRouter;

export default roshanExpress;



