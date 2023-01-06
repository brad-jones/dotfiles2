import * as steps from "lib/steps/mod.ts";

await steps.gsudo.install();
await steps.pwsh.enableScripts();
await steps.scoop.installOrUpdate({
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
    "git": "*",
    "gitkraken": "*",
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
});
await steps.gopass.install();
