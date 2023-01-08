#!/usr/bin/env bash
set -eou pipefail

# Example one liner:
# ???

Version="1.29.2"
BinDir="${HOME}\.local\bin"
Archive="$BinDir\deno.zip"
Exe="$BinDir\deno"
Target="x86_64-unknown-linux-gnu"
DownloadUrl="https://github.com/denoland/deno/releases/download/v${Version}/deno-${Target}.zip"

# Install deno if it's not already installed
# TODO

if [ ! -d "$BinDir" ]; then mkdir -p "$BinDir"; fi
curl --fail --location --progress-bar --output "$Archive" "$DownloadUrl"
unzip -d "$BinDir" -o "$Archive"
chmod +x "$Exe"
rm "$Archive"

# If working locally we don't want to run the code from the remote repo but our local one
scriptRoot="https://denopkg.com/brad-jones/dotfiles2@master"
#if (![string]::IsNullOrEmpty($PSScriptRoot)) {
#  $scriptRoot = $PSScriptRoot
#}

# Execute our entrypoint
exec "$Exe" run -A "$scriptRoot/main.ts" "$@"
