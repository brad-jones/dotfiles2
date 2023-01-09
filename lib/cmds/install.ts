import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import { _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { writeDotFiles } from "../../home/mod.ts";
import * as gopass from "../gopass/mod.ts";
import * as gpg from "../gpg/mod.ts";
import * as gsudo from "../gsudo/mod.ts";
import * as pwsh from "../pwsh/mod.ts";
import { OS } from "../runtime/mod.ts";
import * as scoop from "../scoop/mod.ts";
import * as selfupdate from "../selfupdate/mod.ts";
import * as ssh from "../ssh/mod.ts";
import * as wincred from "../wincred/mod.ts";

export default new Command()
  .description("The command to run on a brand new system")
  .action(async () => {
    // Install ourselves so next time you can just call "dotfiles"
    // instead of the bash/pwsh oneliner.
    await selfupdate.installSelf();

    if (OS === "windows") {
      // On Windows we need a sudo equivalent
      await gsudo.installOrUpdate();

      // On Windows we need to be able to execute Powershell scripts
      await pwsh.setExecutionPolicy("Bypass", "CurrentUser");

      // On Windows I dislike UAC, this turns it off
      await pwsh.setReg(
        "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System",
        "ConsentPromptBehaviorAdmin",
        "0",
        { elevated: true },
      );

      // Install a powershell module that allows us to
      // get & set secrets on the built-in windows keychain
      await wincred.installOrUpdate();

      // For package management on Windows we use <https://scoop.sh>
      await scoop.installOrUpdate();
    }

    // This is going to do all the things required to
    // allow one to get secrets out of the gopass vault.
    // As this is the install command, some aspects are interactive.
    await gopass.unlockVault({ firstTime: true });

    // Install my other gpg keys that I use for the purposes
    // of signing git commits & other encryption duties
    await gpg.importTrustUnlockKey(
      "Brad Jones <brad@bjc.id.au>",
      await gopass.get("keys/gpg/brad@bjc.id.au", { binary: true }),
      await gopass.get("keys/gpg/brad@bjc.id.au.pass"),
    );
    await gpg.importTrustUnlockKey(
      "Brad Jones <brad.jones@xero.com>",
      await gopass.get("keys/gpg/brad.jones@xero.com", { binary: true }),
      await gopass.get("keys/gpg/brad.jones@xero.com.pass"),
    );

    // Now lets setup ssh
    await ssh.installOrUpdate();
    await ssh.startAgent();
    await ssh.addKey("brad@bjc.id.au");
    await ssh.addKey("brad.jones@xero.com");

    // This is the whole point right :)
    // Lets write our actual dotfiles to the filesystem.
    await writeDotFiles();

    // if runtime.GOOS == "windows" {
    //   steps.MustSetupWSL(answers)
    // }

    // Assuming everything worked & we got to here without issue lets make
    // the onlogin command, run on login. It's basically a subset of the steps
    // we have just done. Importantly it will check for updates & apply them
    // if you allow it.
    await selfupdate.installRunAtLogonScript();
  });
