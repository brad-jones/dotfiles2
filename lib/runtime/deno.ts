export type OS = typeof Deno.build.os;
export const OS: OS = Deno.build.os;

export type ARCH = typeof Deno.build.arch;
export const ARCH: ARCH = Deno.build.arch;
