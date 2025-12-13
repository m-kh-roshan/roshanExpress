import roshanExpress from "../lib/roshanExpress";
import "../extensions/res";

const app = roshanExpress({logger: true});

app.get("/", (req, res, next) => {
    res.send("Welcom to roshanexpress");
})

app.use((req, res, next) => {
    res.status(404).send("page not found");
})

app.listen(3000, () => {
    console.log("server on http://localhost:3000");
    
})