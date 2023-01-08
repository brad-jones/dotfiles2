//import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
//import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";
import { FILES } from "./home/mod.ts";
import * as cmds from "./lib/cmds/mod.ts";

console.log("main.ts", FILES);
console.log("main.ts", cmds);

//const rootCmd = new Command().name("dotfiles");
//rootCmd.action(() => rootCmd.showHelp());
//for (const [name, cmd] of Object.entries(cmds)) {
//  rootCmd.command(name, cmd.default);
//}
//await rootCmd.parse();
