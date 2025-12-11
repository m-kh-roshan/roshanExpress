import { Handle, type Handler } from "./handler";
import type { IRouter } from "./roshanExpress";




export class Route extends Handle<Route> implements IRouter{
    private _layer: Handler[] = [];

    get layers() {
        return this._layer
    }

    use(...handlers: Handler[]): void;
    use(path: string, ...handlers: Handler[]): void;
    use(prefix: string, router: Route): void;
    use(arg1: string | Handler, arg2: Handler | Route, ...args: Handler[]): void {
        this._use(this._layer, arg1, arg2, ...args);
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
}