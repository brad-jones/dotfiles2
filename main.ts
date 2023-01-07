import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { Command } from "https://deno.land/x/cliffy@v0.25.6/command/mod.ts";
import * as cmds from "./lib/cmds/mod.ts";

console.log("main.ts: 1");

const __dirname = path.dirname(import.meta.url);
console.log("main.ts: 2");
// eg: file:///C:/Users/brad.jones/Projects/Personal/dotfiles2
// eg: https://denopkg.com/brad-jones/dotfiles2@master
// eg: https://raw.githubusercontent.com/brad-jones/dotfiles2/master

const rootCmd = new Command().name("dotfiles");
rootCmd.action(() => rootCmd.showHelp());
for (const [name, cmd] of Object.entries(cmds)) {
  rootCmd.command(name, cmd.default);
}
console.log("main.ts: 3");
await rootCmd.parse();
console.log("main.ts: 4");
