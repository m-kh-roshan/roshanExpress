import http from "http";
import "./extensions/res.js";
const server = http.createServer((req, res) => {
    res.json({
        name: "reza",
        family: "roshan"
    })
})

server.listen(3001 , () => {
    console.log("server is on http://localhost:3001");
    
});