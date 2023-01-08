import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import * as streams from "https://deno.land/std@0.171.0/streams/mod.ts#^";
import ProgressBar from "https://deno.land/x/progress@v1.3.6/mod.ts#^";
import ky from "https://esm.sh/ky@0.33.1#^";
import { extractFromStream, pathToDecompressor } from "../archive/mod.ts";
import { Digest } from "../digest/mod.ts";

export async function downloadToFile(src: string, d: Digest, dst: string) {
  // Fetch the file
  const bar = new ProgressBar({ title: src });
  const rsp = await ky.get(src, {
    onDownloadProgress: (progress) => {
      bar.render(progress.transferredBytes, { total: progress.totalBytes });
    },
  });
  const stream = rsp.body?.getReader();
  if (!stream) throw new Error("no stream");

  // Write it to the filesystem
  await Deno.mkdir(path.dirname(dst), { recursive: true });
  const fW = await Deno.open(dst, {
    create: true,
    write: true,
    truncate: true,
  });
  try {
    await streams.copy(streams.readerFromStreamReader(stream), fW);
  } finally {
    fW.close();
  }

  // Check digest
  if (!await d.verifyFile(dst)) {
    throw new Error("digest mismatch");
  }
}

export async function downloadAndExtract(
  src: string,
  d: Digest,
  dst:
    | string
    | ((
      filename: string,
      stream: ReadableStream<Uint8Array>,
    ) => Promise<void> | void),
  filter?: (filename: string) => boolean,
) {
  const bar = new ProgressBar({ title: src });
  const rsp = await ky.get(src, {
    onDownloadProgress: (progress) => {
      bar.render(progress.transferredBytes, { total: progress.totalBytes });
    },
  });
  const stream = rsp.body;
  if (!stream) throw new Error("no stream");
  const [s1, s2] = stream.tee();

  const hasher = d.verifyBuffer(s1);
  const extractor = extractFromStream(pathToDecompressor(src), s2, dst, filter);

  const [hasherResult] = await Promise.all([hasher, extractor]);
  if (!hasherResult) {
    throw new Error("digest mismatch");
  }
}
