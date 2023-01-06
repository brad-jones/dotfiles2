import { ARCH, OS } from "./deno.ts";

// see: https://go.dev/doc/install/source#environment
// also: https://github.com/golang/go/blob/master/src/go/build/syslist.go
// and: https://gist.github.com/asukakenji/f15ba7e588ac42795f421b48b8aede63

export type GOOS =
  | "aix"
  | "android"
  | "darwin"
  | "dragonfly"
  | "freebsd"
  | "hurd"
  | "illumos"
  | "ios"
  | "js"
  | "linux"
  | "nacl"
  | "netbsd"
  | "openbsd"
  | "plan9"
  | "solaris"
  | "windows"
  | "zos";
export const GOOS: GOOS = toGOOS(Deno.build.os);
export function toGOOS(os: OS): GOOS {
  return os;
}

export type GOARCH =
  | "386"
  | "amd64"
  | "amd64p32"
  | "arm"
  | "arm64"
  | "arm64be"
  | "armbe"
  | "loong64"
  | "mips"
  | "mips64"
  | "mips64le"
  | "mips64p32"
  | "mips64p32le"
  | "mipsle"
  | "ppc"
  | "ppc64"
  | "ppc64le"
  | "riscv"
  | "riscv64"
  | "s390"
  | "s390x"
  | "sparc"
  | "sparc64"
  | "wasm";
export const GOARCH: GOARCH = toGOARCH(Deno.build.arch);
export function toGOARCH(arch: ARCH): GOARCH {
  switch (arch) {
    case "x86_64":
      return "amd64";
    case "aarch64":
      return "arm64";
  }
}
