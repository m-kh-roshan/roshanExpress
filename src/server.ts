import http from "http";
import "./extensions/res.js";
import { App } from "./lib/roshanExpress.js";
import roshanExpress from "./index.js";
import type { IncomingMessage } from "http";
import type { ServerResponse } from "http";
import userRouter from "./example/users/index.js"
import ServeStatic from "./lib/static.js";
import { readFile } from "fs/promises";
import { resolve } from "path";




const app = roshanExpress();

app.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    req.user = {
        id: 1,
        username: "admin"
    };

    next?.();
})

app.get("/users/:name", async(req: IncomingMessage, res: ServerResponse, next) => {
    console.log(req.params);
    res.json(req.params);
});

app.get("/users/admin/:id", async(req: IncomingMessage, res: ServerResponse, next) => {
    console.log(req.params);
    console.log(req.query);
    const result = {
        params: req.params,
        query: req.query
    }
    res.json(result);
});

app.get("/", async(req: IncomingMessage, res: ServerResponse) => {
    console.log(req.query);
    if (req.user) return res.json(req.user);
    return res.json({message: "no user"});
});

app.get("/redirect", async (req, res) => {
    console.log("redirecting....");
    res.redirect("/");
    console.log("redirected");
});

app.post("/api/v1/user", (req, res, next) => {
    if (!req.body || !["amin", "reza", "akbar"].includes(req.body.name)) {
        res.statusCode = 400;
        return res.json({
            code: "NOT_ALLOWED",
            message: "This name is not allowed"
        })
    }
    req.name = req.body.name;
    next?.();
}, (req, res, next) => {
    console.log({
        name: req.name
    });
    return res.json({
        code: "Allowed",
        message: "This name is allowed",
        data: req.body
    });
});

app.post("/stat", async (req, res, next) => {
    const {file} = req.body;
    const base = resolve("src", "lib", file);
    const sStatic = new ServeStatic(base.toString());
    const content = await readFile(base);
    res.send(content)
});

app.get("/stat/:file", async (req, res, next) => {
    const {file} = req.params;
    const base = resolve("src", "lib", file);
    const sStatic = new ServeStatic(base.toString());
    const content = await readFile(base);
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
    const extension = file.split(".").pop();
    res.setHeader("content-type", mimeTypes[extension!] || "application/octet-stream");
    res.end(content.toString());
});

app.use("/api/v1/users", userRouter);

app.get("/fars", (req, res, next) => {
    res.redirect("https://farsnews.ir");
})

app.use((req, res, next) => {
    res.statusCode = 404
    res.json({
        code: "NOT_FOUND",
        message: "Page not found",
    })
});


const server = http.createServer(app);
server.listen(3000, () => {
    console.log(`server is running on http://localhost:3000 && ${server.address()}`)
});
