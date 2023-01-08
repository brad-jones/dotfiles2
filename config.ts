export const CONFIG = {
  gopass: {
    version: "1.15.2",
    digest: {
      linux: "e6252af21a470aab843e890295167f623e5dd37c97eb7087fbe90ac5d0b42739",
      windows:
        "0046e492f5a8fa1ee02730caecb2656b70c1dd59749833d30f2864538aef13c7",
    },
    vaultKeyName: "Brad Jones (vault) <brad@bjc.id.au>",
    vaultKeyProjId: "18020871",
  },
  gsudo: {
    version: "2.0.4",
    digest: "0596a670ae0d3f28ae3ce6b695d47db02096ff4b34fd89d4e6519a1d6df40078",
  },
  wincred: {
    version: "3.0",
    digest: "1df1c973c16c4e5f9872f74f5d92fc5bfdc0ef1c94c26f7dbbe0bb232f7e7732",
  },
  scoop: {
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
  },
};
