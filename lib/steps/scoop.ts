import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import {
  $,
  _,
  env,
  prefix,
} from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { HOME, OS } from "lib/runtime/mod.ts";

const scoopHome = path.join(HOME, ".scoop");

const scoopCmd = (cmd: string) =>
  prefix(
    "scoop",
    env(
      { "SCOOP": path.join(HOME, ".scoop") },
      _("powershell", "-C", cmd),
    ),
  );

export async function installOrUpdate(
  options: { buckets: Record<string, string>; apps: Record<string, string> },
) {
  if (OS !== "windows") {
    console.log("scoop | skipping, not windows");
    return;
  }

  if (await fs.exists(scoopHome)) {
    await scoopCmd("scoop update");
  } else {
    await scoopCmd("irm get.scoop.sh | iex");
  }

  await ensureBuckets(options.buckets);
  await ensureApps(options.apps);
}

export async function ensureBuckets(buckets: Record<string, string>) {
  for (const [name, url] of Object.entries(buckets)) {
    if (!await bucketExists(name)) {
      await scoopCmd(
        `scoop bucket add ${name}${url.length > 0 ? ` ${url}` : ""}`,
      );
    }
  }

  for await (const dirEntry of Deno.readDir(path.join(scoopHome, "buckets"))) {
    const bucketName = dirEntry.name;
    if (bucketName != "main" && !Object.hasOwn(buckets, bucketName)) {
      console.log(`scoop | bucket rm ${bucketName}`);
      await scoopCmd(`scoop bucket rm ${bucketName}`);
    }
  }
}

export async function ensureApps(apps: Record<string, string>) {
  for (const [name, version] of Object.entries(apps)) {
    if (await appExists(name, version)) {
      if (version === "*") {
        await scoopCmd(`scoop update ${name}`);
      }
    } else {
      await scoopCmd(
        `scoop install ${name}${version !== "*" ? `@${version}` : ""}`,
      );
    }
  }

  for await (const dirEntry of Deno.readDir(path.join(scoopHome, "apps"))) {
    const appName = dirEntry.name;
    if (appName != "scoop" && !Object.hasOwn(apps, appName)) {
      await scoopCmd(`scoop uninstall ${appName}`);
    }
  }
}

/**
 * appExists performs a quick sanity check against the filesystem,
 * much faster than shelling out to PowerShell, to see if a package
 * exists or not.
 */
export async function appExists(
  name: string,
  version: string,
): Promise<boolean> {
  version = version === "*" ? "current" : version;
  return await fs.exists(
    path.join(scoopHome, "apps", name, version, "manifest.json"),
  );
}

/**
 * bucketExists performs a quick sanity check against the filesystem,
 * much faster than shelling out to PowerShell, to see if a bucket
 * exists or not.
 */
export async function bucketExists(name: string): Promise<boolean> {
  return await fs.exists(
    path.join(scoopHome, "buckets", name, ".git"),
  );
}
