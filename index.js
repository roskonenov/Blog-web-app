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

function requireGuest(req, res, next) {
    if (res.locals.username) {
        res.cookie("flash", "Already logged in!")
        return res.redirect(req.get("referer") || "/");
    }
    next();
}

function requireAuth(req, res, next) {
    if (!res.locals.username) {
        return res.redirect("/login");
    }
    next();
}

function flashMiddleware(req, res, next) {
    const message = req.cookies.flash;

    if (message) {
        res.locals.flash = message;
        res.clearCookie("flash");
    } else {
        res.locals.flash = null;
    }
    next();
}

app.use(attachUser);
app.use(flashMiddleware);

app.get("/", (req, res) => {
    res.render("index.ejs", { blogData: blogData, truncateText: truncateText });
});

app.get("/login", requireGuest, requireGuest, (req, res) => {
    res.render("login.ejs");
});

app.post("/login", requireGuest, async (req, res) => {
    
    const { username, password } = req.body;

    const user = users.find(user => user.name === username);
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!user || !passwordIsValid) {
        res.cookie("flash", "Username or Password incorect!");
       return res.redirect("/login");
    }

    const token = jwt.sign({ username: user.name }, SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.redirect("/");
});

app.get("/logout", requireAuth, (req, res) => {
    res.clearCookie("token");
    res.cookie("flash", "You have been logged out!");
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});