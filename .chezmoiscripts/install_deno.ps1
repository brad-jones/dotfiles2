#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$Version = 'v1.29.2';
$BinDir = "${HOME}\.local\bin"
$DenoZip = "$BinDir\deno.zip"
$DenoExe = "$BinDir\deno.exe"
$Target = 'x86_64-pc-windows-msvc'
$DownloadUrl = "https://github.com/denoland/deno/releases/download/${Version}/deno-${Target}.zip"

if (!(Test-Path $BinDir)) New-Item $BinDir -ItemType Directory | Out-Null
curl.exe -Lo $DenoZip $DownloadUrl
tar.exe xf $DenoZip -C $BinDir
Remove-Item $DenoZip