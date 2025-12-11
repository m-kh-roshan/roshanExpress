import path from "path";
import { readFile, stat } from "fs/promises";
import type { Handler } from "./handler.js";
export class ServeStatic {
    private _folder: string
    constructor(folder: string){
        this._folder = folder
    }

    private setContentType(extention: string): string{
        const mimeTypes: Record<string, string> = {
            "html": "text/html",
            "css": "text/css",
            "js": "text/javascript",
            "json": "application/json",
            "txt": "text/plain",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "webp": "image/webp",
            "svg": "image/svg+xml",
            "pdf": "application/pdf",
            "zip": "application/zip",
        };

        return mimeTypes[extention] || "application/octet-stream";
    }

    static(): Handler {
        const root = path.resolve(this._folder);

        return async (req, res, next) => {
            try {
                const requestPath = req.path || req.url;
                const filePath = path.join(root, requestPath!);
                
                if (!filePath.startsWith(root)){
                    return next?.();
                    
                }
                const fileStat = await stat(filePath);
                if (fileStat.isFile()) {
                    const content = await readFile(filePath);

                    

                    const fileExtension = filePath.split(".").pop();
                    if (!fileExtension) {
                        return next?.();
                    }
                        
                    res.setHeader("content-type", this.setContentType(fileExtension));
                    res.end(content);
                    return;
                }

                next?.();
            } catch (error) {
                console.error(error);
                next?.();
            }
        }
    }
}
