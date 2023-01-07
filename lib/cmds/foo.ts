import { Command } from "https://deno.land/x/cliffy@v0.25.6/command/mod.ts";

export default new Command()
  .action(() => {
    console.log("foo called");
  });
