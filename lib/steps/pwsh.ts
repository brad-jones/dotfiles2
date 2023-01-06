import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { _, env } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { HOME, OS } from "lib/runtime/mod.ts";

const stateFile = path.join(HOME, ".cache", "pwshExecutionPolicy");
const stateBuster = "1";

export async function enableScripts() {
  if (OS !== "windows") {
    console.log("pwsh | skipping ExecutionPolicy, not windows");
    return;
  }

  let installed = false;
  try {
    installed = (await Deno.readTextFile(stateFile)) === stateBuster;
  } catch (_) {
    // swallow any exceptions, ie: the binary does not exist yet
  }
  if (installed) {
    console.log("pwsh | ExecutionPolicy already set");
    return;
  }

  console.log("pwsh | setting ExecutionPolicy");
  await env(
    {
      "PSModulePath": "C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules",
    },
    _(
      "gsudo",
      "powershell",
      "-C",
      "Set-ExecutionPolicy Bypass -Scope CurrentUser",
    ),
  );

  await fs.ensureFile(stateFile);
  await Deno.writeTextFile(stateFile, stateBuster);
  console.log("pwsh | ExecutionPolicy set");
}
