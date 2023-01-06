#!/usr/bin/env bash
set -eou pipefail

Version="v1.29.2"
BinDir="${HOME}\.local\bin"
DenoZip="$BinDir\deno.zip"
DenoExe="$BinDir\deno"
Target="x86_64-unknown-linux-gnu"
DownloadUrl="https://github.com/denoland/deno/releases/download/${Version}/deno-${Target}.zip"

if [ ! -d "$BinDir" ]; then mkdir -p "$BinDir"; fi
curl --fail --location --progress-bar --output "$DenoZip" "$DownloadUrl"
unzip -d "$BinDir" -o "$DenoZip"
chmod +x "$DenoExe"
rm "$DenoZip"
