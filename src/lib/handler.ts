import { parseURLParams, type RoshanExpressRequest } from "../extensions/req";
import type { RoshanExpressRespons } from "../extensions/res";
import { urlAndPatternNormalize } from "./logic";

export type Handler = (
    req: RoshanExpressRequest,
    res: RoshanExpressRespons,
    next?: () => void
) => Promise<void> | void;

export abstract class Handle<T extends {layers: Handler[]}> {
    protected _use(targetLayer: Handler[],arg1: string | Handler, arg2: Handler | T, ...args: Handler[]): void {
        if (typeof arg1 === "string") {
            if (arg2 && this._isRouter(arg2)) {
                const router = arg2;
                targetLayer.push(async (req, res, next) => {
                    req.pathStack?.push(arg1);
                    req.subUrl = req.url?.slice(arg1.length) || "/";
                    if (this._isSuburlStartWith(req.pathStack ?? [], req.subUrl)){
                        await this._handle(...arg2.layers)(req, res);
                        if (res.writableEnded) return; //If req.url not matched by Router patterns
                    }
                    next?.();
                });
                return;
            }
            targetLayer.push(async (req, res, next) => {
                req.pathStack?.push(arg1);
                if (parseURLParams(req)) {
                    await this._handle(arg2, ...args)(req, res);
                    if (res.writableEnded) return;
                }
                req.pathStack?.push(arg1);
                req.subUrl = req.url?.slice(arg1.length) || "/";
                if (this._isSuburlStartWith(req.pathStack ?? [], req.subUrl)) {
                    req.path = req.subUrl;
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
        return !!obj && obj.isRoute === true;
    }

    protected _publicHandler(url: string , method: string, ...handlers: Handler[]): Handler {
        return async (req, res, next) => {
            req.pathStack?.push(url)
            if (req.method === method && parseURLParams(req)) {
                await this._handle(...handlers)(req, res);
                return;
            }
            next?.();
        }
    }

    protected _handle(...handlers: Handler[]) {
        const handling = async (req: RoshanExpressRequest, res:RoshanExpressRespons) => {
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

            if (res.writableEnded) return;
        } 
        await run(0);
        }
        return handling;
    }

    private _isSuburlStartWith(urlPattern: string[], url: string): boolean{
        const {pathParts, patternParts} = urlAndPatternNormalize(urlPattern, url);
        if (pathParts.length < patternParts.length) return false;

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i]?.startsWith(":")) continue;

            if (patternParts[i] !== pathParts[i]) return false;
        }
        return true;
    }
}