import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _, stdin } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { retryAsync } from "https://deno.land/x/retry@v2.0.0/mod.ts#^";
import { HOME, OS } from "../runtime/mod.ts";
import * as scoop from "../scoop/mod.ts";
import gpgAgentConf from "./gpg-agent.conf.ts";

export async function installOrUpdate() {
  const agentConfig = gpgAgentConf();

  switch (OS) {
    case "windows":
      await scoop.installOrUpdateApps({ "gpg": "*" });
      await Deno.writeTextFile(
        path.join(scoop.scoopHome, "persist", "gpg", "home", "gpg-agent.conf"),
        agentConfig,
      );
      return;
    case "linux":
      await Deno.writeTextFile(
        path.join(HOME, ".gnupg", "gpg-agent.conf"),
        agentConfig,
      );
  }
}

export async function startAgent() {
  await retryAsync(
    () => _`gpg-connect-agent /bye`,
    {
      delay: 1000,
      maxTry: 5,
    },
  );
  console.log(`gpg | agent running`);
}

export async function importKey(
  keyBytes: Uint8Array | string,
  passphrase: string,
) {
  const privateKeyFile = await Deno.makeTempFile();
  try {
    if (typeof keyBytes === "string") {
      await Deno.writeTextFile(privateKeyFile, keyBytes);
    } else {
      await Deno.writeFile(privateKeyFile, keyBytes);
    }
    await $(
      _`gpg --pinentry-mode loopback --passphrase ${passphrase} --import ${privateKeyFile}`,
    );
  } finally {
    await Deno.remove(privateKeyFile);
  }
}

export async function trustKey(keyName: string) {
  await $(stdin("5\ny\n", _`gpg --command-fd 0 --edit-key ${keyName} trust`));
}

export async function unlockKey(keyName: string, passphrase: string) {
  const out = await $(_`gpg -K --with-keygrip ${keyName}`);
  for (const line of out.split("\n").filter((_) => _.includes("Keygrip = "))) {
    const keyGrip = line.trim().split(" = ")[1];
    await _`gpg-preset-passphrase --passphrase ${passphrase} --preset ${keyGrip}`;
    console.log(`gpg | unlocked ${keyName} (keygrip: ${keyGrip})`);
  }
}

export async function importTrustUnlockKey(
  keyName: string,
  keyBytes: Uint8Array | string,
  passphrase: string,
) {
  await importKey(keyBytes, passphrase);
  await trustKey(keyName);
  await unlockKey(keyName, passphrase);
}
