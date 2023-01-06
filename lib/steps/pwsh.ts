import { _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { OS } from "lib/runtime/mod.ts";

export async function enableScripts() {
  if (OS !== "windows") {
    console.log("pwsh | skipping ExecutionPolicy, not windows");
    return;
  }

  console.log("pwsh | Set-ExecutionPolicy Bypass -Scope CurrentUser");
  await _`gsudo { Set-ExecutionPolicy Bypass -Scope CurrentUser }`;
  console.log("pwsh | done");
}
