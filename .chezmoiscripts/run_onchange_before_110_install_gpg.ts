import { _ } from "https://deno.land/x/denoexec@v1.1.5/mod.ts#^";
import { OS } from "lib/runtime/mod.ts";

switch (OS) {
  case "windows":
    await _`scoop install gpg`;
    break;
}
