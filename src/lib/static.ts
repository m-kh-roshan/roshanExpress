import { stat } from "fs/promises";

class ServeStatic {
    private _path: string;

    constructor(path:string) {
        this._path = path;
    }

    async rStat(){
        return await stat(this._path);
    }
}


export default ServeStatic;