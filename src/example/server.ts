import roshanExpress from "../lib/roshanExpress";
import "../extensions/res";
import type { UploadedFile } from "../lib/file";

const app = roshanExpress({logger: true});

app.get("/", (req, res, next) => {
    res.send("Welcom to roshanexpress");
})

app.post("/upload", async (req, res) => {
    const {files, fields} = req.body;
    
    res.json({
        fields,
        message: "done",
        files: files.map((f: UploadedFile) => f.filename)
    })
})



app.listen(3001, () => {
    console.log("server on http://localhost:3001");
    
})