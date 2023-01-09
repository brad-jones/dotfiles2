import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import ky from "https://esm.sh/ky@0.33.1#^";
import { parseHttpImportUrl } from "../deno/mod.ts";
import { pwshCmd } from "../pwsh/mod.ts";
import { HOME, OS } from "../runtime/mod.ts";

export async function installSelf() {
  const root = path.join(HOME, ".local");

  if (import.meta.url.startsWith("file://")) {
    const url = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "..",
      "..",
      "main.ts",
    );
    await _`${Deno.execPath()} install -frqA --cached-only --root ${root} --name dotfiles ${url}`;
    console.log(
      `selfupdate | installed dotfiles shim in ${root} pointing to ${url}`,
    );
    return;
  }

  const meta = parseHttpImportUrl(import.meta.url);
  const sha = meta.ref.length === 40 ? meta.ref : ((await ky.get(
    `https://api.github.com/repos/${meta.owner}/${meta.repo}/commits/${meta.ref}`,
    // deno-lint-ignore no-explicit-any
  ).json()) as any)["sha"];
  const url =
    `https://raw.githubusercontent.com/${meta.owner}/${meta.repo}/${sha}/main.ts`;

  await _`${Deno.execPath()} install -frqA --cached-only --root ${root} --name dotfiles ${url}`;
  console.log(
    `selfupdate | installed dotfiles shims in ${root} pointing to ${url}`,
  );
}

export async function updateSelf() {
  if (import.meta.url.startsWith("file://")) {
    console.log(`selfupdate | can not update a local fs shim`);
    return false;
  }

  const root = path.join(HOME, ".local");
  const meta = parseHttpImportUrl(import.meta.url);
  const sha = ((await ky.get(
    `https://api.github.com/repos/${meta.owner}/${meta.repo}/commits/HEAD`,
    // deno-lint-ignore no-explicit-any
  ).json()) as any)["sha"];
  const url =
    `https://raw.githubusercontent.com/${meta.owner}/${meta.repo}/${sha}/main.ts`;

  if (
    (await Deno.readTextFile(path.join(root, "bin", "dotfiles"))).includes(url)
  ) {
    console.log(`selfupdate | already up to date`);
    return false;
  }

  await _`${Deno.execPath()} install -frqA --cached-only --root ${root} --name dotfiles ${url}`;
  console.log(
    `selfupdate | updated dotfiles shims in ${root} pointing to ${url}`,
  );
  return true;
}

export async function installRunAtLogonScript() {
  switch (OS) {
    case "windows":
      console.log(
        `selfupdate | installing windows scheduled task to execute "dotfiles onlogin"`,
      );
      await $(pwshCmd(
        [
          `Unregister-ScheduledTask -TaskName "Run at Logon" -Confirm:$false -ErrorAction SilentlyContinue`,
          `$u = whoami`,
          `$Stt = New-ScheduledTaskTrigger -AtLogOn -User "$u"`,
          `$Sta = New-ScheduledTaskAction -Execute "${
            path.join(HOME, ".local", "bin", "dotfiles.cmd")
          }" -Argument "onlogin" -WorkingDirectory "$env:USERPROFILE"`,
          `$STPrincipal = New-ScheduledTaskPrincipal -UserID "$u" -LogonType Interactive`,
          `Register-ScheduledTask "Run at Logon" -Principal $STPrincipal -Trigger $Stt -Action $Sta`,
        ]
          .join(";"),
        { elevated: true },
      ));
      console.log(`selfupdate | task installed and should run on next login`);
      break;
  }
}
