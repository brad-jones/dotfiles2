import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import * as selfupdate from "../selfupdate/mod.ts";

export default new Command()
  .description("Run this to update the dotfiles shim scripts")
  .action(selfupdate.updateSelf);
