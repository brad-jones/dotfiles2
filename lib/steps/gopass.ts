import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { downloadAndExtract } from "lib/download/mod.ts";
import { EXE, GOARCH, GOOS, HOME } from "lib/runtime/mod.ts";

const version = "1.14.11";
const extension = GOOS === "windows" ? ".zip" : ".tar.gz";
const url = `https://github.com/gopasspw/gopass/releases/download` +
  `/v${version}/gopass-${version}-${GOOS}-${GOARCH}${extension}`;
const digest = GOOS === "windows"
  ? "600f0ee84c305c08046b541c07e055596f4cc2c9b11b134e08a79ada5a0af085"
  : "b423493aa700a670e617c1abd6d36a056b1eacf6d5cd72fc3afde849ef0eed42";

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
