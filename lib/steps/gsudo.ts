import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { $, _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { downloadAndExtract } from "lib/download/mod.ts";
import { HOME, OS } from "lib/runtime/mod.ts";

const version = "2.0.4";
const url = `https://github.com/gerardog/gsudo/releases/download` +
  `/v${version}/gsudo.v${version}.zip`;
const digest =
  "0596a670ae0d3f28ae3ce6b695d47db02096ff4b34fd89d4e6519a1d6df40078";

export async function install() {
  if (OS !== "windows") {
    console.log("gsudo | skipping install, not windows");
    return;
  }

  let installed = false;
  try {
    installed = (await $(
      _`${path.join(HOME, ".local", "bin", "gsudo.exe")} --version`,
    )).startsWith(`gsudo v${version}`);
  } catch (_) {
    // swallow any exceptions, ie: the binary does not exist yet
  }
  if (installed) {
    console.log("gsudo | is already installed");
    return;
  }

  console.log("gsudo | installing");

  await downloadAndExtract(
    url,
    ["SHA-256", digest],
    async (filename, stream) => {
      if (filename.startsWith("x64")) {
        const dstFilePath = path.join(
          HOME,
          ".local",
          "bin",
          path.basename(filename),
        );
        await fs.ensureFile(dstFilePath);
        await stream.pipeTo(
          (await Deno.open(dstFilePath, {
            create: true,
            truncate: true,
            write: true,
          })).writable,
        );
      }
    },
  );
}
