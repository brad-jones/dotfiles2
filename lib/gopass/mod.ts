import * as base64 from "https://deno.land/std@0.171.0/encoding/base64.ts#^";
import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { Secret } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts#^";
import { $, _, cwd, stdin } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { CONFIG } from "../../config.ts";
import { Digest } from "../digest/mod.ts";
import { downloadAndExtract } from "../download/mod.ts";
import * as git from "../git/mod.ts";
import * as gpg from "../gpg/mod.ts";
import { EXE, GOARCH, GOOS, HOME } from "../runtime/mod.ts";
import * as wincred from "../wincred/mod.ts";
import gopassConfig from "./config.ts";

export const exe = path.join(HOME, ".local", "bin", `gopass${EXE}`);

export const gopass = (...args: string[]) => _(exe, ...args);

export async function installOrUpdate(
  version = CONFIG.gopass.version,
  // deno-lint-ignore no-explicit-any
  d = Digest.parse((CONFIG.gopass.digest as any)[GOOS]),
) {
  switch (GOOS) {
    case "windows":
      await Deno.writeTextFile(
        path.join(HOME, "AppData", "Roaming", "gopass", "config"),
        gopassConfig(),
      );
      break;
    case "linux":
      await Deno.writeTextFile(
        path.join(HOME, ".config", "gopass", "config"),
        gopassConfig(),
      );
      break;
  }

  let installed = false;
  try {
    installed = (await $(_`${exe} --version`)).startsWith(`gopass ${version}`);
  } catch (_) {
    // swallow any exceptions, ie: the binary does not exist yet
  }
  if (installed) {
    console.log("gopass | is already installed");
    return;
  }

  console.log("gopass | installing");

  const extension = GOOS === "windows" ? ".zip" : ".tar.gz";
  const url = `https://github.com/gopasspw/gopass/releases/download` +
    `/v${version}/gopass-${version}-${GOOS}-${GOARCH}${extension}`;

  await downloadAndExtract(
    url,
    d,
    path.dirname(exe),
    (filename) => filename === `gopass${EXE}`,
  );

  if (GOOS !== "windows") {
    await Deno.chmod(exe, 0o755);
  }
}

export async function cloneVault() {
  const cloneDir = path.join(HOME, ".password-store");
  if (await fs.exists(cloneDir)) {
    await Deno.remove(cloneDir, { recursive: true });
  }

  await Deno.run({ cmd: ["gh", "repo", "clone", "brad-jones/vault", cloneDir] })
    .status();

  await cwd(
    cloneDir,
    _`git remote set-url origin git@github.com:brad-jones/vault.git`,
  );
}

export async function importKey() {
  const keyName = CONFIG.gopass.vaultKeyName;

  let passphrase;
  while (true) {
    passphrase = await Secret.prompt({
      message: `Passphrase for ${keyName}`,
    });

    const passphraseConfirm = await Secret.prompt({
      message: `Confirm passphrase for ${keyName}`,
    });

    if (passphrase === passphraseConfirm) break;

    console.error(`passphrase did not match, try again.`);
  }

  console.log(`gopass | saving key passphrase into wincred`);
  await wincred.setCred("gopass:vault", passphrase);

  console.log(`gopass | downloading vault private key from gitlab`);
  const privateKey = base64.decode(
    JSON.parse(
      await $(
        _(
          "glab",
          "api",
          `/projects/${CONFIG.gopass.vaultKeyProjId}/repository/files/private.pem?ref=master`,
        ),
      ),
    ).content,
  );

  console.log(`gopass | importing the key`);
  const privateKeyFile = await Deno.makeTempFile();
  try {
    await Deno.writeFile(privateKeyFile, privateKey);
    await $(
      _`gpg --pinentry-mode loopback --passphrase ${passphrase} --import ${privateKeyFile}`,
    );
  } finally {
    await Deno.remove(privateKeyFile);
  }

  console.log(`gopass | trusting the key`);
  await $(stdin("5\ny\n", _`gpg --command-fd 0 --edit-key ${keyName} trust`));
}

export async function unlockVault({ firstTime }: { firstTime: boolean }) {
  if (firstTime) {
    await git.installOrUpdate();
    await gpg.installOrUpdate();
    await installOrUpdate();
    await git.authWithGithub();
    await git.authWithGitlab();
    await cloneVault();
    await importKey();
  }

  await gpg.startAgent();
  await gpg.unlockKey(
    CONFIG.gopass.vaultKeyName,
    await wincred.getCred("gopass:vault"),
  );
}

export async function ls() {
  return (await $(gopass("ls", "-f"))).trim().split("\n");
}

export async function get(key: string, options?: { binary?: boolean }) {
  if (options?.binary ?? false) {
    return new TextDecoder().decode(
      await Deno.run({ cmd: [exe, "cat", key], stdout: "piped" }).output(),
    ).trim();
  }

  return (await $(gopass("show", "-o", key))).trim();
}

export async function set(
  key: string,
  value: string,
  options?: { binary?: boolean },
) {
  if (options?.binary ?? false) {
    await stdin(value, gopass("cat", key));
    return;
  }

  await stdin(`${value}\n${value}\n`, gopass("insert", "-f", key));
}

export async function rm(key: string) {
  await gopass("rm", "-f", key);
}

export async function fscopy(from: string, to: string) {
  await gopass("fscopy", from, to);
}

export async function fsmove(from: string, to: string) {
  await gopass("fsmove", from, to);
}
