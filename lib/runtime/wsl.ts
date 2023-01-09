import { $, _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";

export const IsWSL = Deno.build.os === "linux" &&
  Deno.readTextFileSync("/proc/sys/kernel/osrelease").includes(
    "microsoft-standard-WSL2",
  );

export const WSLHOME = Deno.env.get("WSLENV")?.includes("USERPROFILE/up")
  ? Deno.env.get("USERPROFILE")!
  : "";

export const WindowsToWslPath = (path: string) => $(_("wslpath", path));

export const WslToWindowsPath = (path: string) => $(_("wslpath", "-w", path));
