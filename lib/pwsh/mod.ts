import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _, env } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { HOME, OS } from "../runtime/mod.ts";

export function pwshCmd(
  script: string,
  options?: {
    elevated?: boolean;
    exe?: string;
    modulePaths?: string[];
    env?: Record<string, string>;
  },
) {
  const modulePaths = [
    ...(options?.modulePaths ?? []),
    "C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules",
    path.join(HOME, "Documents", "WindowsPowerShell", "Modules"),
  ].join(";");

  const environmentVariables = { "PSModulePath": modulePaths };

  let args = [
    options?.exe ??
      "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    "-C",
    script,
  ];

  if (options?.elevated ?? false) {
    args = ["gsudo", ...args];
  }

  return env(environmentVariables, _(...args));
}

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

export async function getReg(
  path: string,
  name: string,
  options?: { elevated?: boolean },
) {
  return (await $(
    pwshCmd(`(Get-ItemProperty -Path REGISTRY::${path}).${name}`, {
      elevated: options?.elevated,
    }),
  )).trim();
}

export async function setReg(
  path: string,
  name: string,
  value: string,
  options?: { elevated?: boolean },
) {
  await pwshCmd(
    `Set-ItemProperty -Path REGISTRY::${path} -Name ${name} -Value ${value}`,
    {
      elevated: options?.elevated,
    },
  );
  console.log(`pwsh | ${path}\\${name} set to ${value}`);
}
