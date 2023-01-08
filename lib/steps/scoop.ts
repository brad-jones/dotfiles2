import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { _, env, prefix } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { HOME as UserHome, OS } from "../runtime/mod.ts";

export const HOME = path.join(UserHome, ".scoop");

export const Cmd = (cmd: string) =>
  prefix(
    "scoop",
    env(
      {
        "SCOOP": HOME,
        "PSModulePath":
          "C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules",
      },
      _("powershell", "-C", cmd),
    ),
  );

export interface Config {
  buckets: Record<string, string>;
  apps: Record<string, string>;
}

export const DefaultConfig: Config = {
  buckets: {
    "extras": "",
    "nonportable": "",
    "brad-jones": "https://github.com/brad-jones/scoop-bucket.git",
  },
  apps: {
    "7zip": "*",
    "aria2": "*",
    "aws": "*",
    "dprint": "*",
    "gh": "*",
    "git": "*",
    "gitkraken": "*",
    "glab": "*",
    "gpg": "*", // 2.3.1
    "nodejs": "*",
    "nuget": "*",
    "putty": "*",
    "pwsh": "*",
    "vlc": "*",
    "vscode": "*",
    "win32-openssh": "*", // 8.6.0.0p1-Beta
    "windows-terminal": "*",
  },
};

export async function installOrUpdate(options: Config) {
  if (OS !== "windows") {
    console.log("scoop | skipping, not windows");
    return;
  }

  if (await fs.exists(HOME)) {
    await Cmd("scoop update");
  } else {
    await Cmd("irm get.scoop.sh | iex");
  }

  await ensureBuckets(options.buckets);
  await ensureApps(options.apps);
}

export async function ensureBuckets(buckets: Record<string, string>) {
  for (const [name, url] of Object.entries(buckets)) {
    if (!await bucketExists(name)) {
      await Cmd(
        `scoop bucket add ${name}${url.length > 0 ? ` ${url}` : ""}`,
      );
    }
  }

  for await (const dirEntry of Deno.readDir(path.join(HOME, "buckets"))) {
    const bucketName = dirEntry.name;
    if (bucketName != "main" && !Object.hasOwn(buckets, bucketName)) {
      console.log(`scoop | bucket rm ${bucketName}`);
      await Cmd(`scoop bucket rm ${bucketName}`);
    }
  }
}

export async function ensureApps(apps: Record<string, string>) {
  for (const [name, version] of Object.entries(apps)) {
    if (await appExists(name, version)) {
      if (version === "*") {
        await Cmd(`scoop update ${name}`);
      }
    } else {
      await Cmd(
        `scoop install ${name}${version !== "*" ? `@${version}` : ""}`,
      );
    }
  }

  for await (const dirEntry of Deno.readDir(path.join(HOME, "apps"))) {
    const appName = dirEntry.name;
    if (appName != "scoop" && !Object.hasOwn(apps, appName)) {
      await Cmd(`scoop uninstall ${appName}`);
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
    path.join(HOME, "apps", name, version, "manifest.json"),
  );
}

/**
 * bucketExists performs a quick sanity check against the filesystem,
 * much faster than shelling out to PowerShell, to see if a bucket
 * exists or not.
 */
export async function bucketExists(name: string): Promise<boolean> {
  return await fs.exists(
    path.join(HOME, "buckets", name, ".git"),
  );
}
