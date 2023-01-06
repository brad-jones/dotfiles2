import { Untar } from "https://deno.land/std@0.171.0/archive/mod.ts";
import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts";
import * as streams from "https://deno.land/std@0.171.0/streams/mod.ts";
import * as path from "https://deno.land/std@0.95.0/path/mod.ts";

export async function decompress(
  src: string | ReadableStream<Uint8Array>,
  dst:
    | string
    | ((
      filename: string,
      stream: ReadableStream<Uint8Array>,
    ) => Promise<void> | void),
  filter?: (filename: string) => boolean,
) {
  src = typeof src === "string"
    ? (await Deno.open(src, { read: true })).readable
    : src;

  const unCompressed = streams.readerFromStreamReader(
    src.pipeThrough(new DecompressionStream("gzip")).getReader(),
  );

  for await (const entry of new Untar(unCompressed)) {
    if (entry.type === "file") {
      if (entry.fileName.includes("..")) throw new Error("path contains ..");
      if (filter && !filter(entry.fileName)) continue;
      if (typeof dst === "string") {
        const dstFilePath = path.join(dst, entry.fileName);
        await fs.ensureFile(dstFilePath);
        await streams.copy(
          entry,
          await Deno.open(dstFilePath, {
            create: true,
            truncate: true,
            write: true,
          }),
        );
      } else {
        await dst(entry.fileName, streams.readableStreamFromReader(entry));
      }
    }
  }
}
