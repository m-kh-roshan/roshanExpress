import {IncomingMessage} from "http";
import "http";
import fs from "fs";
import { BadJsonError } from "../lib/errors/req.error.js";
import { urlAndPatternNormalize } from "../lib/logic.js";
import Busboy from "busboy";
import { InternalUploadedFile } from "../lib/file.js";
import path from "path";
import os from "os";
import type { RoshanExpressRespons } from "./res.js";

type ParseBodyOptions = {
    limit?: number;
    timeout?: number;
 }

 
export interface RoshanExpressRequest extends IncomingMessage {
    body?: any;
    params?: any;
    pathStack?: string[];
    subUrl?: string;
    query?: any;
    path: string;
};

function parseMultipart (req: RoshanExpressRequest, res: RoshanExpressRespons) {
    const MEMORY_LIMIT = 5 * 1024 * 1024;
    return new Promise<void>((resolve, reject) => {
        const contentType = req.headers["content-type"];
        if (!contentType?.startsWith("multipart/form-data")) {
            return resolve();
        }

        const busboy = Busboy({headers: req.headers});

        const fields: Record<string, string> = {};
        const files: InternalUploadedFile[] = [];

        busboy.on("field", (name, value) => {
            fields[name] = value;
        });

        busboy.on("file", (name, stream , info) => {
            const {filename, mimeType} = info;
            
            const file = new InternalUploadedFile(
                name,
                info.filename,
                info.mimeType
            );

            let buffers: Buffer[] = [];
            let tempStream: fs.WriteStream | null = null;

            stream.on("data", chunk => {
                file.size += chunk.length;

                if (!tempStream && file.size > MEMORY_LIMIT) {
                    const tempPath = path.join(
                        os.tmpdir(), `roshan-${Date.now()}-${Math.random()}`
                    );

                    file.tempPath = tempPath;
                    tempStream = fs.createWriteStream(tempPath);

                    for (const b of buffers) tempStream.write(b);

                    buffers = [];
                }

                if (tempStream) {
                    tempStream.write(chunk);
                } else {
                    buffers.push(chunk);
                }
            });

            stream.on("end", () => {
                if (tempStream) {
                    tempStream.end();
                } else {
                    file.buffer = Buffer.concat(buffers);
                }
            });

            files.push(file);
        });

        busboy.on("finish", () => {
            req.body = { fields, files };

            res.once("finish", () => {
                for (const f of files) {
                    if (!f.consumed) f.cleanup();
                }
            });

            resolve();
        });

        busboy.on("error", reject);

        req.pipe(busboy);
    })
}


export async function parseBody (req: RoshanExpressRequest, res: RoshanExpressRespons, options: ParseBodyOptions = {}) {
    const {limit = 1024 * 1024, timeout = 10_000} = options;

    if (req.method === "GET" || req.method === "HEAD") {
        req.body = {};
        return;
    }

    let size = 0;

    const contentTypeMulti = req.headers["content-type"] ?? "";

    if (contentTypeMulti.startsWith("multipart/form-data")) {
        await parseMultipart(req, res);
        return;
    }

    const chunks: Buffer[] = [];
    await new Promise<void> ((resolve, reject) => {
        const timer = setTimeout(() => {
            req.destroy();
            reject(new Error("Request body timeout!!"));
        }, timeout);

        req.on("data", (chunk) => {
            size += chunk.length;

            if (size > limit) {
                req.destroy();
                clearTimeout(timeout);
                reject(new Error("Body to large!!!"));
                return;
            }
            chunks.push(chunk);
        });
        
        req.on("end", () =>{
            clearTimeout(timeout);
            resolve();
        });
        req.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });

    if (chunks.length === 0) {
            req.body = {};
            return;
        }

    const buff = Buffer.concat(chunks);
    const contentType = req.headers["content-type"]?.split(";")[0] ?? "";

    if (contentType === "application/json") {
        try {
            req.body = JSON.parse(buff.toString("utf8"));
        } catch (error) {
            throw new BadJsonError();
        }
        return;
    }
    if (contentType === "application/x-www-form-urlencoded") {
        const str = buff.toString("utf8");
        req.body = Object.fromEntries(new URLSearchParams(str));
        return;
    }

    if (contentType.startsWith("text/")) {
        req.body = buff.toString("utf8");
        return;
    }

    req.body = buff;
}



export function parseURLParams(
    req: RoshanExpressRequest
): boolean {
    const {pathParts, patternParts} = urlAndPatternNormalize(req.pathStack, req.url);
    if (pathParts.length !== patternParts.length) return false;

    const result: Record<string, string | undefined> = {};

    for (let i=0 ; i < patternParts.length; i++) {
        const p = patternParts[i];

        if (p === "*") {
            const rest = pathParts.slice(i).join("/");
            result["*"] = rest ? decodeURIComponent(rest) : "";
            break;
        }

        const isParam = p?.startsWith(":");
        if (!isParam) {
            if (p !== pathParts[i]) return false;
            continue;
        }

        const paramNameRaw = p?.slice(1);
        const isOptional = paramNameRaw?.endsWith("?");
        const paramName = isOptional ? paramNameRaw?.slice(0, -1) : paramNameRaw;
        if (!paramName) continue;
        const value = pathParts.length > i ? pathParts[i] : undefined;

        result[paramName] = value === undefined ? undefined: decodeURIComponent(value);
    }

    req.params = result;
    return true;
}

export function parseURLQueryStrings(req: RoshanExpressRequest) {
    const url = req.url ?? "";
    const host = req.headers.host ?? "localhost"
    try {
        const urlObject = new URL(url, `http://${host}`);
        const query = Object.fromEntries(urlObject.searchParams);

        req.query = query;
    } catch (error) {
        req.query = {};    
    }
}

