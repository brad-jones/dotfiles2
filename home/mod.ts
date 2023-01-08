import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import ky from "https://esm.sh/ky@0.33.1#^";
import { HOME } from "../lib/runtime/mod.ts";

/**
 * All our managed dotfiles are need to export a
 * single default export matching this interface.
 */
export type FileTemplate = (data?: Record<string, string>) => string;

/**
 * This will be dynamically populated on first import of this module.
 * It's basically a map of filepath to template function.
 */
export const FILES: Record<string, FileTemplate> = {};

// If we are running locally we can easily just walk the filesystem to populate our FILES map
const __dirname = path.dirname(import.meta.url);
if (__dirname.startsWith("file://")) {
  const dir = path.fromFileUrl(__dirname);
  for await (const e of fs.walk(dir)) {
    if (e.isFile && e.name.endsWith(".ts") && e.name != "mod.ts") {
      const filepath = path.join(HOME, e.path.replace(dir, "")).replace(
        ".ts",
        "",
      );
      const moduleUrl = `file:///${e.path}`;
      FILES[filepath] = (await import(moduleUrl))["default"];
    }
  }
}

// Otherwise we make a github API call to get a list of files
if (__dirname.startsWith("https://")) {
  const meta = parseHttpUrl(__dirname);

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
    FILES[filepath] = (await import(moduleUrl))["default"];
  }
}

function parseHttpUrl(url: string) {
  if (url.includes("denopkg.com")) {
    const parts = url.replace("https://denopkg.com/", "").split("/");
    const owner = parts[0];
    let repo = parts[1];
    let ref = "master";
    if (repo.includes("@")) {
      const repoParts = repo.split("@");
      repo = repoParts[0];
      ref = repoParts[1];
    }
    const path = parts.slice(2).join("/");
    return { owner, repo, ref, path };
  }

  if (url.includes("raw.githubusercontent.com")) {
    const parts = url.replace("https://raw.githubusercontent.com/", "").split(
      "/",
    );
    const owner = parts[0];
    const repo = parts[1];
    const ref = parts[2];
    const path = parts.slice(3).join("/");
    return { owner, repo, ref, path };
  }

  throw new Error("unsupported remote");
}
