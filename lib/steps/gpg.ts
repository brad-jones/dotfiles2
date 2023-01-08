import { $, _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { retryAsync } from "https://deno.land/x/retry@v2.0.0/mod.ts#^";

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

export async function unlockKey(keyName: string, passphrase: string) {
  const out = await $(_`gpg -K --with-keygrip ${keyName}`);
  for (const line of out.split("\n").filter((_) => _.includes("Keygrip = "))) {
    const keyGrip = line.trim().split(" = ")[1];
    await _`gpg-preset-passphrase --passphrase ${passphrase} --preset ${keyGrip}`;
    console.log(`gpg | unlocked ${keyName} (keygrip: ${keyGrip})`);
  }
}

/*
func MustUnlockKey(keyName, keyPassphrase string) {
	prefix := colorchooser.Sprint("unlock-gpg-key-" + slug.Make(keyName))

	presetBin := "gpg-preset-passphrase"
	if runtime.GOOS == "linux" {
		presetBin = "/usr/libexec/gpg-preset-passphrase"
	}

	for _, line := range strings.Split(goexec.MustRunBuffered("gpg", "-K", "--with-keygrip", keyName).StdOut, "\n") {
		if !strings.Contains(line, "Keygrip = ") {
			continue
		}
		line = strings.TrimSpace(line)
		keyGrip := strings.Split(line, " = ")[1]
		fmt.Println(prefix, "|", "adding preset for", keyGrip)
		goexec.MustRunPrefixed(prefix, presetBin,
			"--passphrase", keyPassphrase,
			"--preset", keyGrip, // keygrip
		)
	}
}
*/
