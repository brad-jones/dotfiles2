import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { CONFIG } from "../../config.ts";
import { Digest } from "../digest/mod.ts";
import { downloadAndExtract } from "../download/mod.ts";
import { HOME, OS } from "../runtime/mod.ts";

export async function installOrUpdate(
  version = CONFIG.wincred.version,
  d = Digest.parse(CONFIG.wincred.digest),
) {
  if (OS !== "windows") {
    console.log("wincred | skipping install, not windows");
    return;
  }

  const moduleDir = path.join(
    HOME,
    "Documents",
    "WindowsPowerShell",
    "Modules",
    "TUN.CredentialManager",
    version,
  );

  if (await fs.exists(moduleDir)) {
    console.log("wincred | is already installed");
    return;
  }

  const url = `https://github.com/echalone/PowerShell_Credential_Manager` +
    `/releases/download/v${version}/TUN.CredentialManager_${version}.zip`;

  console.log("wincred | installing");
  await downloadAndExtract(url, d, moduleDir);
}

export async function getCred(username: string) {
  return (await $(_(
    "powershell",
    "-C",
    `[System.Net.NetworkCredential]::new("",
      (Get-StoredCredential -Target '${username}').Password
    ).Password`,
  ))).trim();
}

export async function setCred(username: string, password: string) {
  await $(_(
    "powershell",
    "-C",
    `New-StoredCredential -UserName '${username}' -Password '${password}' ` +
      `-Target '${username}' -Persist 'LocalMachine'`,
  ));
}
