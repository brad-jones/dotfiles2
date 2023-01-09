import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import ky from "https://esm.sh/ky@0.33.1#^";
import { parseHttpImportUrl } from "../lib/deno/mod.ts";
import { HOME } from "../lib/runtime/mod.ts";

const __dirname = path.dirname(import.meta.url);

export type FileTemplate = () => string;

export async function writeDotFiles() {
  let dotFiles: Record<string, FileTemplate>;
  if (__dirname.startsWith("file://")) {
    dotFiles = await readFromLocalFS();
  } else if (__dirname.startsWith("https://")) {
    dotFiles = await readFromRemoteRepo();
  } else {
    throw new Error(`unrecognised - __dirname: ${__dirname}`);
  }

  for (const [filepath, template] of Object.entries(dotFiles)) {
    await Deno.writeTextFile(filepath, template());
    console.log(`home | written ${filepath}`);
  }
}

async function readFromLocalFS(): Promise<Record<string, FileTemplate>> {
  const df: Record<string, FileTemplate> = {};
  const dir = path.fromFileUrl(__dirname);
  for await (const e of fs.walk(dir)) {
    if (e.isFile && e.name.endsWith(".ts") && e.name != "mod.ts") {
      const filepath = path.join(HOME, e.path.replace(dir, "")).replace(
        ".ts",
        "",
      );
      const moduleUrl = `file:///${e.path}`;
      df[filepath] = (await import(moduleUrl))["default"];
    }
  }
  return df;
}

async function readFromRemoteRepo(): Promise<Record<string, FileTemplate>> {
  const df: Record<string, FileTemplate> = {};
  const meta = parseHttpImportUrl(__dirname);
  const apiCall = `https://api.github.com/repos/${meta.owner}/${meta.repo}` +
    `/git/trees/${meta.ref}?recursive=1`;

  interface TreeResponse {
    sha: string;
    url: string;
    truncated: boolean;
    tree: TreeEntry[];
  }

  interface TreeEntry {
    "path": string;
    "mode": string;
    "type": string;
    "sha": string;
    "url": string;
  }

  const paths = (await ky.get(apiCall).json() as TreeResponse).tree
    .map((_) => _.path)
    .filter((_) => _.startsWith(meta.path))
    .filter((_) => _.endsWith(".ts"))
    .filter((_) => _ != `${meta.path}/mod.ts`);

  for (const p of paths) {
    const filepath = path.join(
      HOME,
      p.replace(`${meta.path}/`, "").replace(".ts", ""),
    );
    const moduleUrl =
      `https://raw.githubusercontent.com/${meta.owner}/${meta.repo}/${meta.ref}/${p}`;
    df[filepath] = (await import(moduleUrl))["default"];
  }

  return df;
}
