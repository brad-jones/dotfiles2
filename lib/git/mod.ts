import { OS } from "../runtime/mod.ts";
import * as scoop from "../scoop/mod.ts";

export async function installOrUpdate() {
  switch (OS) {
    case "windows":
      await scoop.installOrUpdateApps({ "git": "*", "gh": "*", "glab": "*" });
      return;
  }
}

export async function authWithGithub() {
  if (
    !(await Deno.run({
      cmd: ["gh", "auth", "login", "-p", "https", "-w"],
    })
      .status()).success
  ) {
    throw new Error(`failed to login to to github`);
  }
  console.log();
}

export async function authWithGitlab() {
  if (
    !(await Deno.run({
      cmd: ["glab", "auth", "login"],
    })
      .status()).success
  ) {
    throw new Error(`failed to login to to gitlab`);
  }
  console.log();
}
