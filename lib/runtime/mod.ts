export * from "./deno.ts";
export * from "./go.ts";
export * from "./rust.ts";

export const HOME = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "";

export const EXE = Deno.build.os === "windows" ? ".exe" : "";
