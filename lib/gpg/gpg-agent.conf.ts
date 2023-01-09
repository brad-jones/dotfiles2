import { IsWSL, WSLHOME } from "../runtime/mod.ts";

export default () => `
allow-preset-passphrase
default-cache-ttl 34560000
max-cache-ttl 34560000
${
  IsWSL
    ? `pinentry-program ${WSLHOME}/.scoop/apps/gpg/current/bin/pinentry-basic.exe`
    : ""
}
`;
