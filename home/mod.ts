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
  // https://denopkg.com/brad-jones/dotfiles2@master
  // https://raw.githubusercontent.com/brad-jones/dotfiles2/master
  console.log(`__dirname: ${__dirname}`);

  const r = await ky.get(
    `https://api.github.com/repos/brad-jones/dotfiles2/git/trees/master?recursive=1`,
  ).json() as TreeResponse;

  for (
    const t of r.tree.filter((_) =>
      _.path.startsWith("home/") && _.path.endsWith(".ts") &&
      _.path != "home/mod.ts"
    )
  ) {
    console.log(
      `https://raw.githubusercontent.com/brad-jones/dotfiles2/master/${t.path}`,
    );
    FILES[path.join(HOME, t.path.replace("home/", "").replace(".ts", ""))] =
      (await import(
        `https://raw.githubusercontent.com/brad-jones/dotfiles2/master/${t.path}`
      ))["default"];
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
