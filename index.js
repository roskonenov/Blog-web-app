import express from "express";
import blogData from "./data/blogData.js";
import truncateText from "./utils/truncateText.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import users from "./data/users.js";
import bcrypt from "bcryptjs";
import highlightedText from "./utils/highlightedText.js";
import isValidImageURL from "./utils/isValidImageURL.js";

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
        return res.redirect("/");
    }
    next();
}

function requireAuth(req, res, next) {
    if (!res.locals.username) {
        res.cookie("returnTo", req.originalUrl, { httpOnly: true });

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
    res.render("index.ejs", { blogData, truncateText });
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

    const returnTo = req.cookies.returnTo;
    res.clearCookie("returnTo");
    res.redirect(!returnTo || !returnTo.startsWith("/") ? "/" : returnTo);
});

app.get("/register", requireGuest, (req, res) => {
    res.render("register.ejs");
});

app.post("/register", requireGuest, (req, res) => {
    const { username, password, repeatPassword } = req.body;
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
            oldInput: { username }
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

app.get("/search", (req, res) => {
    const query = req.query.q?.toLowerCase() || "";

    const result = blogData.filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        blog.text.toLowerCase().includes(query)
    );

    res.render("index.ejs", {
        blogData: result,
        truncateText,
        query,
        highlightedText
    });
});

app.get("/blog/:id", (req, res) => {
    res.render("personalBlogs.ejs", {
        blogData: blogData.filter(blog => blog.user === res?.local?.username),
        truncateText,
        selectedBlog: blogData.find(post => post.id === Number(req.params.id))
    });
});

app.get("/my-blogs/:id", requireAuth, (req, res) => {

    const username = res.locals.username;
    const myPosts = blogData.filter(blog => blog.user === username);

    if (!myPosts || myPosts.length === 0) {
        res.cookie("flash", JSON.stringify({
            message: "You don't have any posts yet. Write your first one now!",
            type: "warning"
        }));
        return res.redirect("/add-post");
    }
    let selectedBlog = myPosts.find(blog => blog.id === Number(req.params.id));
    if (!selectedBlog) {
        selectedBlog = myPosts[0];
    }

    res.render("personalBlogs.ejs", {
        blogData: myPosts,
        truncateText,
        selectedBlog
    });
});

app.get("/add-post", requireAuth, (req, res) => {
    res.render("addUpdateBlog.ejs", {blog: null});
});

app.post("/add-post", requireAuth, (req, res) => {
    const { subject, title, imageURL, text } = req.body;
    const errors = {};

    if (!subject || subject.length < 3) {
        errors.subject = "'Subject' must be at least 3 characters!";
    }

    if (!title || title.length < 6) {
        errors.title = "'Title' must be at least 6 characters!";
    }

    if (!imageURL || !isValidImageURL(imageURL)) {
        errors.imageURL = "Please enter valid image URL!"
    }

    if (!text || text.length < 200) {
        errors.text = "Your post must be at least 200 characters!"
    }

    if (Object.keys(errors).length > 0) {
        res.cookie("flash", JSON.stringify({
            type: "danger",
            errors,
            oldInput: {subject, title, imageURL, text}
        }));
        return res.redirect("/add-post");
    }

    blogData.push({
        id: blogData.length + 1,
        subject,
        title,
        date: new Date(),
        text,
        user: res.locals.username,
        imageURL
    });

    res.redirect(`/my-blogs/${blogData.length}`)
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});