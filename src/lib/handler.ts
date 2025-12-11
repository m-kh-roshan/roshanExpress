import type { IncomingMessage, ServerResponse } from "http";
import { parseURLParams } from "../extensions/req";

export type Handler = (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
) => Promise<void> | void;

export abstract class Handle<T extends {layers: Handler[]}> {
    protected _use(targetLayer: Handler[],arg1: string | Handler, arg2: Handler | T, ...args: Handler[]): void {
        if (typeof arg1 === "string") {
            if (arg2 && this._isRouter(arg2)) {
                const router = arg2;
                targetLayer.push(async (req, res, next) => {
                    if (req.url?.startsWith(arg1)){
                        req.url = req.url.slice(arg1.length) || "/";
                        await this._handle(...arg2.layers)(req, res);
                        if (res.writableEnded) return; //If req.url not matched by Router patterns
                    }
                    next?.();
                });
                return;
            }
            targetLayer.push(async (req, res, next) => {
                if (parseURLParams(req, arg1)) {
                    await this._handle(arg2, ...args)(req, res);
                    if (res.writableEnded) return;
                }
                if (req.url?.startsWith(arg1)) {
                    req.path = req.url.substring(arg1.length) || "/";
                    await this._handle(arg2, ...args)(req, res);
                    if (res.writableEnded) return;
                }
                next?.();
            });
            return;
        }
        targetLayer.push(arg1, ...args);
        
    }
    private _isRouter(obj: any): obj is T {
        return obj && Array.isArray(obj.layers)
    }

    protected _publicHandler(url: string , method: string, ...handlers: Handler[]): Handler {
        return async (req, res, next) => {
            if (req.method === method && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
                return;
            }
            next?.();
        }
    }

    protected _handle(...handlers: Handler[]) {
        const handling = async (req: IncomingMessage, res:ServerResponse) => {
            const run = async (index: number): Promise<void> => {
            const layer = handlers[index];
            if(!layer) return;
            if(res.writableEnded) return;
            try {
                await layer(req, res, async () => run(index + 1));
            } catch (error) {
                console.log("Handler&Middileware Error: ", error);
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end("Internal server Error!!!");
                    return;
                }
                res.send("Internal Error. please report to developers");
                return;

            }
        } 
        await run(0);
        }
        return handling;
    }
}