import * as decompressors from "./decompressors.ts";

export async function extractFromStream(
  type: "gz" | "tarGz" | "zip" | typeof decompressors.tarGz,
  src: ReadableStream<Uint8Array>,
  dst: string,
  filter?: (filename: string) => boolean,
) {
  if (typeof type === "string") {
    await decompressors[type].decompress(src, dst, filter);
    return;
  }
  await type.decompress(src, dst, filter);
}

export async function extractFromFile(
  src: string,
  dst: string,
  filter?: (filename: string) => boolean,
) {
  await pathToDecompressor(src).decompress(src, dst, filter);
}

export function pathToDecompressor(path: string) {
  switch (true) {
    case path.endsWith(".tgz"):
    case path.endsWith(".tar.gz"):
      return decompressors.tarGz;
    case path.endsWith(".gz"):
      return decompressors.gz;
    case path.endsWith(".zip"):
      return decompressors.zip;
    default:
      throw new Error(`do not know how to extract ${path}`);
  }
}
