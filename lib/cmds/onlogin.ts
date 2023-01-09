import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import * as gopass from "../gopass/mod.ts";
import * as gpg from "../gpg/mod.ts";
import * as ssh from "../ssh/mod.ts";

export default new Command()
  .description("This is designed to execute on first login for the day")
  .action(async () => {
    // This is going to do all the things required to
    // allow one to get secrets out of the gopass vault.
    // Here it relies on the wincred keychain to unlock & requires no interaction
    await gopass.unlockVault({ firstTime: false });

    // Install my other gpg keys that I use for the purposes
    // of signing git commits & other encryption duties
    await gpg.unlockKey(
      "Brad Jones <brad@bjc.id.au>",
      await gopass.get("keys/gpg/brad@bjc.id.au.pass"),
    );
    await gpg.unlockKey(
      "Brad Jones <brad.jones@xero.com>",
      await gopass.get("keys/gpg/brad.jones@xero.com.pass"),
    );

    // Also start the ssh agent
    await ssh.startAgent();
    await ssh.addKey("brad@bjc.id.au");
    await ssh.addKey("brad.jones@xero.com");

    // TODO: Check if there is an update & interactively ask the user if they want to update
  });
