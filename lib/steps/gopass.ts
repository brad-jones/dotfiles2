import * as base64 from "https://deno.land/std@0.171.0/encoding/base64.ts#^";
import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { Secret } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts#^";
import {
  $,
  _,
  cwd,
  env,
  stdin,
} from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { downloadAndExtract } from "../download/mod.ts";
import { EXE, GOARCH, GOOS, HOME } from "../runtime/mod.ts";
import * as wincred from "../wincred/mod.ts";

const version = "1.15.2";
const extension = GOOS === "windows" ? ".zip" : ".tar.gz";
const url = `https://github.com/gopasspw/gopass/releases/download` +
  `/v${version}/gopass-${version}-${GOOS}-${GOARCH}${extension}`;
const digest = GOOS === "windows"
  ? "0046e492f5a8fa1ee02730caecb2656b70c1dd59749833d30f2864538aef13c7"
  : "e6252af21a470aab843e890295167f623e5dd37c97eb7087fbe90ac5d0b42739";

export async function install() {
  let installed = false;
  try {
    installed = (await $(
      _`${path.join(HOME, ".local", "bin", `gopass${EXE}`)} --version`,
    )).startsWith(`gopass ${version}`);
  } catch (_) {
    // swallow any exceptions, ie: the binary does not exist yet
  }
  if (installed) {
    console.log("gopass | is already installed");
    return;
  }

  console.log("gopass | installing");

  await downloadAndExtract(
    url,
    ["SHA-256", digest],
    path.join(HOME, ".local", "bin"),
    (filename) => filename === `gopass${EXE}`,
  );

  if (GOOS !== "windows") {
    await Deno.chmod(path.join(HOME, ".local", "bin", "gopass"), 0o755);
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
  const keyName = "Brad Jones (vault) <brad@bjc.id.au>";

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
        _`glab api /projects/18020871/repository/files/private.pem?ref=master`,
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
