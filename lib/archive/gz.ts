import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts";

export async function decompress(
  srcFile: string | ReadableStream<Uint8Array>,
  dstFile: string | WritableStream<Uint8Array>,
) {
  const src = typeof srcFile === "string"
    ? (await Deno.open(srcFile, { read: true })).readable
    : srcFile;

  let dst;
  if (typeof dstFile === "string") {
    await fs.ensureFile(dstFile);
    const w = await Deno.open(dstFile, {
      create: true,
      truncate: true,
      write: true,
    });
    dst = w.writable;
  } else {
    dst = dstFile;
  }

  await src.pipeThrough(new DecompressionStream("gzip")).pipeTo(dst);
}
