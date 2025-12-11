# roshanexpress

A modern, lightweight, TypeScript-first HTTP framework inspired by Express — built from scratch for simplicity, performance, and full type safety.

`roshanexpress` provides a clean API for building web servers using middleware, routing, request parsing, static file serving, and modular routers.  
It is fully compatible with Node’s native `http` server and can be used in small scripts or large applications.

---

## ✨ Features

- Fully written in **TypeScript** with strict type definitions  
- Express-like API (`get`, `post`, `put`, `patch`, `delete`)  
- Middleware system with `app.use()`  
- Built-in `Router()` for modular routes  
- Built-in static file server  
- Automatic body parsing (JSON & text)  
- Route params via `req.params`  
- Query string parsing via `req.query`  
- Extended response helpers:  
  - `res.json()`  
  - `res.send()`  
  - `res.redirect()`  
  - `res.end()`

---

## 📦 Installation

```bash
npm install roshanexpress
or
yarn add roshanexpress
```

## 🚀 Quick Start
```ts
import roshanexpress from "roshanexpress";

const app = roshanexpress();

app.get("/", (req, res) => {
  res.send("Welcome to roshanexpress!");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```
### 🛠 Middleware Example
```ts
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
```
### 📌 Routing Example
```ts
app.get("/users", (req, res) => {
  res.json({ users: [] });
});

app.post("/users", (req, res) => {
  res.json(req.body);
});
```

### 🧩 Routers
```ts
import { Router } from "roshanexpress";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.json({ users: [] });
});

userRouter.get("/:id", (req, res) => {
  res.json({ id: req.params.id });
});

app.use("/users", userRouter);
```

### 📁 Static Files
```ts
import roshanexpress from "roshanexpress";

app.use("/static", roshanExpress.static("public"));
```
Serves files from the public folder like index.html, CSS, images, etc.

### 📤 Request Helpers
req.query → Access query string parameters

req.params → Access URL parameters

req.body → Access parsed JSON or text body

```ts
app.post("/login", (req, res) => {
  console.log(req.body); // { username: "abc", password: "123" }
});
```
### 📤 Response Helpers
```ts
res.send("Hello World");
res.json({ ok: true });
res.redirect("/home");
res.end();
```
### 🔌 Using with Native http.createServer
```ts
import http from "http";
import roshanexpress from "roshanexpress";

const app = roshanexpress();
const server = http.createServer(app);

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```
## 📦 Feature Summary
Feature	Supported
Strong TypeScript typings	✔
Middleware	✔
JSON & text body parsing	✔
Static file serving	✔
Routers	✔
Query string parsing	✔
Route params	✔
res.json(), res.send(), res.redirect()	✔
HTTP methods (GET/POST/PUT/PATCH/DELETE)	✔

## 📄 License
MIT © 2025 Mohammadreza Roshan