#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { input } from "@inquirer/prompts";
import { buildBase, buildExt } from "./template.js";

const exists = (path) =>
  fs
    .stat(path)
    .then(() => true)
    .catch(() => false);

const moonEmoji = "🌙";

async function write(dir, tmpl) {
  for (const [filePath, fileContents] of Object.entries(tmpl)) {
    const fullPath = path.join(dir, filePath);
    const fullPathDir = path.dirname(fullPath);
    if (!(await exists(fullPathDir))) await fs.mkdir(fullPathDir, { recursive: true });
    await fs.writeFile(fullPath, fileContents);
  }
}

const packageJson = path.resolve("./package.json");
if (await exists(packageJson)) {
  console.log(`${moonEmoji} Using existing project directory.`);
  let extId;
  while (true) {
    extId = await input({ message: "Choose an extension ID:", default: "sampleExtension" });
    const extDir = path.join("./src", extId);
    if ((await exists(extDir)) && (await fs.readdir(extDir)).length !== 0) {
      console.log("Extension already exists - please choose another.");
    } else {
      break;
    }
  }

  let tmpl = {};
  tmpl = { ...tmpl, ...(await buildExt(extId, path.resolve("./env.d.ts"))) };
  await write(path.resolve("."), tmpl);

  console.log("Done.");
} else {
  console.log(`${moonEmoji} Creating new project.`);

  let dir;
  while (true) {
    dir = await input({ message: "Choose a directory:", default: "./my-moonlight-extensions" });
    if ((await exists(dir)) && (await fs.readdir(dir)).length !== 0) {
      console.log("Directory already exists - please choose another.");
    } else {
      break;
    }
  }
  dir = path.resolve(dir);
  const packageName = path.basename(dir);

  const extId = await input({ message: "Choose an extension ID:", default: "sampleExtension" });

  let tmpl = {};
  tmpl = { ...tmpl, ...(await buildBase(packageName)) };
  tmpl = { ...tmpl, ...(await buildExt(extId)) };

  await write(dir, tmpl);

  console.log("Done. Now run:\n");
  console.log(`$ cd ${dir}`);
  console.log("$ pnpm i");
  console.log("$ git init");
  console.log("\nGood luck! Feel free to reach out:");
  console.log("Docs: https://moonlight-mod.github.io/ext-dev/getting-started");
  console.log("Discord server: https://discord.gg/FdZBTFCP6F");
}
