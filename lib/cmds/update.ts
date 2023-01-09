import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import { writeDotFiles } from "../../home/mod.ts";
import * as git from "../git/mod.ts";
import * as gopass from "../gopass/mod.ts";
import * as gpg from "../gpg/mod.ts";
import * as gsudo from "../gsudo/mod.ts";
import { OS } from "../runtime/mod.ts";
import * as scoop from "../scoop/mod.ts";
import * as ssh from "../ssh/mod.ts";
import * as wincred from "../wincred/mod.ts";

export default new Command()
  .description("Run this to update software & re-apply dotfiles.")
  .action(async () => {
    // Ensure all the software is up to date.
    // NB: Apps that have a pinned version won't necessarily be updated
    await gopass.installOrUpdate();
    if (OS === "windows") {
      await gsudo.installOrUpdate();
      await wincred.installOrUpdate();
      await scoop.installOrUpdate();
    }
    await git.installOrUpdate();
    await gpg.installOrUpdate();
    await ssh.installOrUpdate();

    // Re-apply our dotfiles
    await writeDotFiles();
  });
