import type { IncomingMessage } from "http";
import { App } from "./lib/roshanExpress.js";
import type { ServerResponse } from "http";

function roshanExpress() {
    const app = new App();

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

export default roshanExpress;