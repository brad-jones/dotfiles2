import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import { CONFIG } from "../../config.ts";
import * as steps from "../steps/mod.ts";
import * as wincred from "../wincred/mod.ts";

export default new Command()
  .description("The command to run on a brand new system")
  .action(async () => {
    //await steps.gsudo.install();
    // disable uac
    //await steps.pwsh.enableScripts();
    await wincred.installCredentialManager();
    //await steps.scoop.installOrUpdate(steps.scoop.DefaultConfig);
    // install gh for linux???
    // install glab for linux???
    //await steps.github.auth();
    //await steps.gitlab.auth();
    //await steps.gopass.install();
    //await steps.gopass.cloneVault();
    //await steps.gopass.importKey();
    await steps.gpg.startAgent();
    await steps.gpg.unlockKey(
      CONFIG.gopass.vaultKeyName,
      await wincred.getCred("gopass:vault"),
    );
  });
