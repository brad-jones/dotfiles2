import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { _, prefix } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { CONFIG } from "../../config.ts";
import { pwshCmd } from "../pwsh/mod.ts";
import { HOME, OS } from "../runtime/mod.ts";

// TODO aria2 config

export const scoopHome = path.join(HOME, ".scoop");

export const scoopCmd = (cmd: string) =>
  prefix("scoop", pwshCmd(`scoop ${cmd}`, { env: { SCOOP: scoopHome } }));

export async function installOrUpdate() {
  if (OS !== "windows") {
    console.log("scoop | skipping, not windows");
    return;
  }

  if (await fs.exists(scoopHome)) {
    await scoopCmd("update");
  } else {
    await prefix(
      "scoop",
      pwshCmd("irm get.scoop.sh | iex", { env: { SCOOP: scoopHome } }),
    );
  }

  await addBuckets(CONFIG.scoop.buckets);
  await installOrUpdateApps(CONFIG.scoop.apps);
}

export async function addBuckets(buckets: Record<string, string>) {
  for (const [name, url] of Object.entries(buckets)) {
    if (!await bucketExists(name)) {
      await scoopCmd(
        `bucket add ${name}${url.length > 0 ? ` ${url}` : ""}`,
      );
    }
  }
}

export async function installOrUpdateApps(apps: Record<string, string>) {
  for (const [name, version] of Object.entries(apps)) {
    if (await appExists(name, version)) {
      if (version === "*") {
        await scoopCmd(`update ${name}`);
      }
    } else {
      await scoopCmd(`install ${name}${version !== "*" ? `@${version}` : ""}`);
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
