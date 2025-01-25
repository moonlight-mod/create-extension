import fs from "node:fs/promises";
import path from "node:path";

const template = path.join(import.meta.dirname, "template");

const read = (file) => fs.readFile(path.join(template, file), "utf8");

export async function buildBase(projectName) {
  const files = {};

  const baseFiles = [
    ".github/workflows/deploy.yml",

    ".prettierrc",
    ".prettierignore",
    "eslint.config.mjs",

    "build.mjs",
    "repo.mjs",

    "tsconfig.json"
  ];

  for (const file of baseFiles) files[file] = await read(file);

  const packageJSON = JSON.parse(await read("package.json"));
  packageJSON.name = projectName;

  const typesPackage = await fetch("https://registry.npmjs.com/@moonlight-mod/types", {
    headers: {
      "User-Agent": "@moonlight-mod/create-extension (+https://github.com/moonlight-mod/create-extension)"
    }
  }).then((r) => r.json());
  packageJSON.dependencies["@moonlight-mod/types"] = "^" + typesPackage["dist-tags"]["latest"];
  files["package.json"] = JSON.stringify(packageJSON, null, 2);

  // npm is too smart about stripping files
  files[".gitignore"] = `/dist
/repo
/node_modules
`;

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
    files["env.d.ts"] = await read("env.d.ts").then((r) => r.replaceAll("sampleExtension", extId));
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
