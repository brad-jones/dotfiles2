#!/usr/bin/env bash
set -eou pipefail

Version="2.29.1"
BinDir="$HOME/.local/bin"
TmpDir="$TEMP/chezmoiDownload-bradsDotFiles"
Archive="$TmpDir/chezmoi.zip"
Exe="$BinDir/chezmoi"
DownloadUrl="https://github.com/twpayne/chezmoi/releases/download/v$Version/chezmoi_${Version}_linux_amd64.tar.gz"

if [ ! -d "$BinDir" ]; then mkdir -p "$BinDir"; fi
if [ ! -d "$TmpDir/extracted" ]; then mkdir -p "$TmpDir/extracted"; fi
curl --fail --location --progress-bar --output "$Archive" "$DownloadUrl"
tar -xf "$Archive" -C "$TmpDir/extracted"
rm "$Exe"
mv "$TmpDir/extracted/chezmoi.exe" "$Exe"
chmod +x "$Exe"
rm -rf "$TmpDir"

exec "$Exe" "$@"
