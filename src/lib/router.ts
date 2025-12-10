import type { IncomingMessage, ServerResponse } from "http";
import type { Handler } from "./roshanExpress.js";
import { Handle } from "./handler.js";
import { parseURLParams } from "../extensions/req.js";

export interface IRouter {
    get: (url: string, ...handlers: Handler[]) => void;
    post: (url: string, ...handlers: Handler[]) => void;
    delete: (url: string, ...handlers: Handler[]) => void;
    put: (url: string, ...handlers: Handler[]) => void;
    patch: (url: string, ...handlers: Handler[]) => void;
}

export class Router extends Handle implements IRouter{
    private _layer: Handler[] = [];

    get layers() {
        return this._layer
    }

    get(url: string, ...handlers: Handler[]) {
        this._layer.push(async (req, res, next) => {
            if (req.method === "GET" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
                return;
            }
            next?.();
        })
    }

    post(url: string, ...handlers: Handler[]) {
        this._layer.push(async (req, res, next) => {
            if (req.method === "POST" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    delete(url: string, ...handlers: Handler[]) {
        this._layer.push(async (req, res, next) => {
            if (req.method === "DELETE" && parseURLParams(req, url)) {
                parseURLParams(req, url);
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    put(url: string, ...handlers: Handler[]) {
        this._layer.push(async (req, res, next) => {
            if (req.method === "put" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }

    patch(url: string, ...handlers: Handler[]) {
        this._layer.push(async (req, res, next) => {
            if (req.method === "patch" && parseURLParams(req, url)) {
                await this._handle(...handlers)(req, res);
            }
            next?.();
        })
    }
}