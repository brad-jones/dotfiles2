import { paramCase } from "https://deno.land/x/case@2.1.1/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import * as cmds from "./lib/cmds/mod.ts";

const rootCmd = new Command().name("dotfiles").version(import.meta.url);
rootCmd.action(() => rootCmd.showHelp());
for (const [name, cmd] of Object.entries(cmds)) {
  rootCmd.command(paramCase(name), cmd.default);
}
await rootCmd.parse();
