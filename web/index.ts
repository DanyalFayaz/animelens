import { dumpCommands, getCategories } from "@util/funcs";
import express from "express";
import path from "path";
import fs from "fs";

export const app = express();
const viewsDir = path.join(__dirname, "views");

app.set("views", viewsDir);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "..", "public")));

const files = fs.readdirSync(viewsDir);

app.get("/commands", async (_req, res) => {
	const categories = getCategories(await dumpCommands(true) as any[]);

	res.render("commands", { categories });
});

files.forEach((file) => {
	if (!file.endsWith(".ejs")) return;
	const name = path.parse(file).name;
	app.get(name === "index" ? "/" : `/${name}`, (_req, res) => {
		res.render(name);
	});
});

import malRouter from "./routes/mal.route";
app.use("/mal", malRouter);
