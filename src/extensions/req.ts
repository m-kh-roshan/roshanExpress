import { error } from "console";
import {IncomingMessage} from "http";
import { zipToObject } from "../lib/logic.js";

type ParseBodyOptions = {
    limit?: number;
    timeout?: number;
 }
export async function parseBody (req: IncomingMessage, options: ParseBodyOptions = {}) {
    const {limit = 1024 * 1024, timeout = 10_000} = options;

    if (req.method === "GET" || req.method === "HEAD") {
        req.body = {};
        return;
    }

    let size = 0;

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
            throw new Error("Invalid JSON");
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
    req: IncomingMessage, 
    routePattern: string
): boolean {
    const rawURL = req.url ?? "/";
    const pathOnly = rawURL.split("?")[0]?.split("#")[0];

    const normalize = (u: string) => u.replace(/(^\/+|\/+$)/g, "");

    const pattern = normalize(routePattern);
    const path = normalize(pathOnly ?? "");
    
    const patternParts = pattern === "" ? [] : pattern.split("/");
    const pathParts = path === "" ? [] : path.split("/");

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

export function parseURLQueryStrings(req: IncomingMessage) {
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

