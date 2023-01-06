import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts#^";
import * as path from "https://deno.land/std@0.95.0/path/mod.ts#^";
import * as fflate from "https://esm.sh/fflate@0.7.4#^";

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

  for await (const entry of unzip(src)) {
    if (entry.type === "file") {
      if (entry.name.includes("..")) throw new Error("path contains ..");
      if (filter && !filter(entry.name)) continue;
      if (typeof dst === "string") {
        const dstFilePath = path.join(dst, entry.name);
        await fs.ensureFile(dstFilePath);
        const f = await Deno.open(dstFilePath, {
          create: true,
          truncate: true,
          write: true,
        });
        await entry.readable.pipeTo(f.writable);
      } else {
        await dst(entry.name, entry.readable);
      }
    }
  }
}

interface ReadableUnZipFile extends fflate.UnzipFile {
  type: "dir" | "file";
  readable: ReadableStream<Uint8Array>;
}

async function* unzip(src: ReadableStream<Uint8Array>) {
  const ac = new AbortController();
  const files: fflate.UnzipFile[] = [];
  const unzip = new fflate.Unzip((f) => files.push(f));
  unzip.register(fflate.UnzipInflate);

  const pipe = src.pipeTo(
    new WritableStream({
      write(dat: Uint8Array) {
        unzip.push(dat);
      },
      close() {
        unzip.push(new Uint8Array(0), true);
        ac.abort();
      },
    }),
  );

  while (!ac.signal.aborted) {
    await new Promise((r) => setTimeout(r, 0));
    while (files.length > 0) {
      const file = files.shift();
      if (file) {
        const f = file as ReadableUnZipFile;
        f.type = f.name.endsWith("/") ? "dir" : "file";
        f.readable = new ReadableStream({
          start(controller: ReadableStreamDefaultController<Uint8Array>) {
            file.ondata = (err, chunk, final) => {
              if (err) throw err;
              controller.enqueue(chunk);
              if (final) controller.close();
            };
            file.start();
          },
          cancel() {
            file.terminate();
          },
        });
        yield f;
      }
    }
  }

  await pipe;
}
