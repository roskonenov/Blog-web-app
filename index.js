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
app.use(express.urlencoded({ extended: true }));
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
        res.cookie("flash", JSON.stringify({
            message: "Already logged in!",
            type: "warning"
        }));
        return res.redirect(req.get("referer") || "/");
    }
    next();
}

function requireAuth(req, res, next) {
    if (!res.locals.username) {
        res.cookie("flash", JSON.stringify({
            message: "Please login first!",
            type: "warning"
        }));
        return res.redirect("/login");
    }
    next();
}

function flashMiddleware(req, res, next) {
    const message = req.cookies.flash;

    if (message) {
        res.locals.flash = JSON.parse(message);
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

app.get("/login", requireGuest, (req, res) => {
    res.render("login.ejs");
});

app.post("/login", requireGuest, async (req, res) => {

    const { username, password } = req.body;

    const user = users.find(user => user.name === username);

    if (!user) {
        res.cookie("flash", JSON.stringify({
            message: "Username or Password incorect!",
            type: "danger"
        }));
        return res.redirect("/login");
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
        res.cookie("flash", JSON.stringify({
            message: "Username or Password incorect!",
            type: "danger"
        }));
        return res.redirect("/login");
    }

    const token = jwt.sign({ username: user.name }, SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.cookie("flash", JSON.stringify({
        message: "You are now logged in!",
        type: "success"
    }));
    res.redirect("/");
});

app.get("/register", requireGuest, (req, res) => {
    res.render("register.ejs");
});

app.post("/register", requireGuest, (req, res) => {
    const {username, password, repeatPassword} = req.body;
    const errors = {};

    if (!username || username.length < 3) {
        errors.username = "At least 3 characters!"
    }

    if (!password || password.length < 6) {
        errors.password = "At least 6 characters!"
    }

    if (password !== repeatPassword) {
        errors.repeatPassword = "Passwords do not match!"
    }

    const userExist = users.find(user => user.name === username);
    if (userExist) {
        errors.username = "Username already taken!"
    }

    if (Object.keys(errors).length > 0) {
        res.cookie("flash", JSON.stringify({
            type: "danger",
            errors,
            oldInput: {username}
        }));
        return res.redirect("/register");
    }

    users.push({
        id: users.length + 1,
        name: username,
        password: bcrypt.hashSync(password)
    });

    const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, secure: false });
    res.cookie("flash", JSON.stringify({
        type: "success",
        message: "Account created successfully!"
    }));
    res.redirect("/");
});

app.get("/logout", requireAuth, (req, res) => {
    res.clearCookie("token");
    res.cookie("flash", JSON.stringify({
        message: "You have been logged out!",
        type: "success"
    }));
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});