import express from "express";
import blogData from "./data/blogData.js";
import truncateText from "./utils/truncateText.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import users from "./data/users.js";
import bcrypt from "bcryptjs";

const app = express();
const port = 3000;
const SECRET = "mySecretKey";

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

function attachUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        res.locals.username = null;
        return next();
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            res.locals.username = null;
        } else {
            res.locals.username = decoded.username;
        }

        next();
    });
}

app.use(attachUser);

app.get("/", (req, res) => {
    res.render("index.ejs", { blogData: blogData, truncateText: truncateText });
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.name === username);
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!user || !passwordIsValid) {
        res.status(404).send("Username or Password incorect!");
    }

    const token = jwt.sign({ username: user.name }, SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});