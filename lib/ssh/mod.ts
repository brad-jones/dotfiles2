import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _, stdin } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import * as gopass from "../gopass/mod.ts";
import { pwshCmd } from "../pwsh/mod.ts";
import { HOME, OS } from "../runtime/mod.ts";
import * as scoop from "../scoop/mod.ts";

export async function installOrUpdate() {
  switch (OS) {
    case "windows":
      await scoop.addBuckets({
        "brad-jones": "https://github.com/brad-jones/scoop-bucket.git",
      });
      await scoop.installOrUpdateApps({
        "win32-openssh": "*",
        "putty": "*",
        "ssh_add_with_pass": "*",
      });
      return;
  }
}

export async function startAgent() {
  switch (OS) {
    case "windows":
      console.log(`ssh | agent starting...`);
      await pwshCmd("Start-Service ssh-agent", { elevated: true });
      console.log(`ssh | agent started`);

      console.log(`ssh | pageant starting...`);
      if (
        !(await Deno.run({
          cmd: [
            "powershell.exe",
            "-C",
            `if ((Get-Process "pageant" -ea SilentlyContinue) -eq $Null) { ` +
            `Start-Process -NoNewWindow pageant.exe; ` +
            `}`,
          ],
        }).status()).success
      ) {
        throw new Error("pageant.exe did not start");
      }
      console.log(`ssh | pageant started`);
      return;
  }
}

export async function addKey(keyName: string) {
  const keyPath = path.join(HOME, ".ssh", keyName);
  await gopass.fscopy(`keys/ssh/${keyName}`, path.join(HOME, ".ssh", keyName));
  await stdin(
    `${await gopass.get(`keys/ssh/${keyName}.pass`)}\n`,
    _`ssh_add_with_pass ${keyPath}`,
  );
  console.log(`ssh | added ${keyPath}`);

  if (OS === "windows") {
    const pagentKeyPath = path.join(HOME, ".ssh", `${keyName}.ppk`);
    await gopass.fscopy(`keys/ssh/${keyName}.ppk`, pagentKeyPath);
    try {
      await _`pageant ${pagentKeyPath}`;
      console.log(`ssh | added ${pagentKeyPath}`);
    } finally {
      await Deno.remove(pagentKeyPath);
    }
  }
}
