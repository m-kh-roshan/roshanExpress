import roshanExpress from "../lib/roshanExpress";
import "../extensions/res";

const app = roshanExpress({logger: true});

app.get("/", (req, res, next) => {
    res.send("Welcom to roshanexpress");
})

app.post("/upload", async (req, res) => {
    res.json({
        message:"done"
    })
})



app.listen(3001, () => {
    console.log("server on http://localhost:3001");
    
})