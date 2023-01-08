import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import ky from "https://esm.sh/ky@0.33.1#^";
import { HOME } from "../lib/runtime/mod.ts";

export const FILES: Record<string, (data?: Record<string, string>) => string> =
  {};

const __dirname = path.dirname(import.meta.url);

if (__dirname.startsWith("file://")) {
  const dir = path.fromFileUrl(__dirname);
  for await (const walkEntry of fs.walk(dir)) {
    if (
      walkEntry.isFile && walkEntry.name.endsWith(".ts") &&
      walkEntry.name != "mod.ts"
    ) {
      FILES[
        path.join(HOME, walkEntry.path.replace(dir, "")).replace(".ts", "")
      ] = (await import(`file:///${walkEntry.path}`))["default"];
    }
  }
} else if (__dirname.startsWith("https://")) {
  const meta = parseHttpUrl(__dirname);

  const gitTree = await ky.get(
    `https://api.github.com/repos/${meta.owner}/${meta.repo}` +
      `/git/trees/${meta.ref}?recursive=1`,
  ).json() as TreeResponse;

  for (
    const t of gitTree.tree.filter((_) =>
      _.path.startsWith(meta.path) && _.path.endsWith(".ts") &&
      _.path != `${meta}/mod.ts`
    )
  ) {
    const filepath = path.join(HOME, t.path.replace(`${meta.path}/`, "").replace(".ts", ""));
    const moduleUrl = `https://raw.githubusercontent.com/${meta.owner}/${meta.repo}/${meta.ref}/${t.path}`;
    FILES[filepath] = (await import(moduleUrl))["default"];
  }
}

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

// https://denopkg.com/brad-jones/dotfiles2@master/home
// https://raw.githubusercontent.com/brad-jones/dotfiles2/master/home
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
