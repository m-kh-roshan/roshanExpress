import { Router } from "../../lib/roshanExpress.js";
import { User } from "./user.model.js";

const Users = new User();

const router = Router();
router.post("/", (req, res, next) => {
    const {username, age, email} = req.body;
    if (!username || !email) {
        
        return res.json({
            code: "INVALIDE_DATA",
            message: "Username and email required"
        });
    }

    if (username.length < 4){
        return res.status(400).json({
            code: "INVALIDE_DATA",
            message: "Username length must be more than 3 charecter"
        });
    }
    if (age < 18) {
        return res.status(400).json({
            code: "INVALIDE_DATA",
            message: "user must be more than 18 years old."
        });
    }

    Users.add(req.body);
    return res.status(201).json({
            code: "USER_CREATED",
            message: "User created successfully"
        });
    
});

router.get("/", (req, res, next) => {
    const users = Users.users;

    return res.json({
            code: "USERS_FETCHED",
            message: "Users fetched successfully",
            data: {
                users
            }
        });
    
});

router.get("/:id", (req, res, next) => {
    console.log(req.params);
    const user = Users.getOne(Number(req.params.id));

    if (!user) return res.status(404).json({
            code: "NOT_fOUND",
            message: "User not found"
        });

    return res.json({
            code: "USERS_FETCHED",
            message: "Users fetched successfully",
            data: {
                user
            }
        });
    
});

export default router;