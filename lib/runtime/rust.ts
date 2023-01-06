import { ARCH, OS } from "./deno.ts";

// see: https://doc.rust-lang.org/std/env/consts/constant.OS.html
export type RUSTOS =
  | "linux"
  | "macos"
  | "ios"
  | "freebsd"
  | "dragonfly"
  | "netbsd"
  | "openbsd"
  | "solaris"
  | "android"
  | "windows";
export const RUSTOS: RUSTOS = toRUSTOS(Deno.build.os);
export function toRUSTOS(os: OS): RUSTOS {
  // Seems like deno wanted to copy GOOS, instead of just passing through
  // the underlying rust constant like they seem to have for the arch.
  if (os === "darwin") return "macos";
  return os;
}

// see: https://doc.rust-lang.org/std/env/consts/constant.ARCH.html
export type RUSTARCH =
  | "x86"
  | "x86_64"
  | "arm"
  | "aarch64"
  | "m68k"
  | "mips"
  | "mips64"
  | "powerpc"
  | "powerpc64"
  | "riscv64"
  | "s390x"
  | "sparc64";
export const RUSTARCH: RUSTARCH = toRUSTARCH(Deno.build.arch);
export function toRUSTARCH(arch: ARCH): RUSTARCH {
  return arch; // deno arch identifiers are the same as rust's funnily enough :)
}
