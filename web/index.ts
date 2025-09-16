import express from "express";
import path from "path";

export const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/success", (req, res) => {
	res.render("success");
});

app.get("/", (_req, res) => {
	res.render("index");
});

app.get("/about", (_req, res) => {
	res.render("about");
});

app.get("/commands", (_req, res) => {
	res.render("commands");
});

import malRouter from "./routes/mal.route";
app.use("/mal", malRouter);
