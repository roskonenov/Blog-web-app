import express from "express";
import blogData from "./data/blogData.js";
import truncateText from "./data/utils/truncateText.js";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {blogData: blogData, truncateText: truncateText});
})

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});