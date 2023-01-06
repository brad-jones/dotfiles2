import * as steps from "lib/steps/mod.ts";

await steps.gsudo.install();
await steps.pwsh.enableScripts();
await steps.gopass.install();
