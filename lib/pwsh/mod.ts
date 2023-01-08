import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { _, env } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { HOME, OS } from "../runtime/mod.ts";

export const pwshCmd = (
  script: string,
  options = {
    elevated: false,
    exe: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    modulePaths: [
      "C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules",
      path.join(HOME, "Documents", "WindowsPowerShell", "Modules"),
    ],
  },
) =>
  env(
    { "PSModulePath": options.modulePaths.join(";") },
    _(
      ...(options.elevated
        ? ["gsudo", options.exe, "-C", script]
        : [options.exe, "-C", script]),
    ),
  );

export type ExecutionPolicy =
  | "Unrestricted"
  | "RemoteSigned"
  | "AllSigned"
  | "Restricted"
  | "Default"
  | "Bypass"
  | "Undefined";

export type ExecutionPolicyScope =
  | "Process"
  | "CurrentUser"
  | "LocalMachine"
  | "UserPolicy"
  | "MachinePolicy";

export async function setExecutionPolicy(
  policy: ExecutionPolicy,
  scope: ExecutionPolicyScope,
) {
  if (OS !== "windows") return;
  await pwshCmd(`Set-ExecutionPolicy ${policy} -Scope ${scope}`);
  console.log(`pwsh | ExecutionPolicy set to ${policy} for ${scope}`);
}

export async function installProfile() {
}
