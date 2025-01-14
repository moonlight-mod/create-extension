import fs from "node:fs/promises";
import path from "node:path";

const template = path.join(import.meta.dirname, "template");

const read = (file) => fs.readFile(path.join(template, file), "utf8");

export async function buildBase(projectName) {
  const files = {};

  const baseFiles = [
    ".github/workflows/deploy.yml",
    ".gitignore",

    ".prettierrc",
    ".prettierignore",
    "eslint.config.mjs",

    "build.mjs",
    "repo.mjs",

    "tsconfig.json"
  ];

  for (const file of baseFiles) files[file] = await read(file);
  files["package.json"] = await read("package.json").then((r) => r.replace("sample-extension", projectName));

  return files;
}

export async function buildExt(extId, envPath) {
  const files = {};

  if (envPath) {
    let str = await fs.readFile(envPath, "utf8");
    str += `
declare module "@moonlight-mod/wp/${extId}_someLibrary" {
  export * from "${extId}/webpackModules/someLibrary";
}
`;
    files["env.d.ts"] = str;
  } else {
    files["env.d.ts"] = await read("env.d.ts").then((r) => r.replace("sampleExtension", extId));
  }

  const extSpecific = [
    "manifest.json",
    "index.tsx",
    "node.ts",
    "webpackModules/entrypoint.ts",
    "webpackModules/someLibrary.ts"
  ];
  for (const file of extSpecific) {
    files[`src/${extId}/${file}`] = await read(`src/sampleExtension/${file}`).then((r) =>
      r.replaceAll("sampleExtension", extId)
    );
  }

  return files;
}