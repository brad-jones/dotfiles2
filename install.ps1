#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

# Example one liner:
# Set-ExecutionPolicy Bypass -scope CurrentUser; curl.exe https://raw.githubusercontent.com/brad-jones/dotfiles/master/install.ps1 | powershell -c - -- --help

$Version = '2.29.1';
$BinDir = "${env:USERPROFILE}\.local\bin"
$TmpDir = "${env:TEMP}\chezmoiDownload-bradsDotFiles"
$Archive = "$TmpDir\chezmoi.zip"
$Exe = "$BinDir\chezmoi.exe"
$DownloadUrl = "https://github.com/twpayne/chezmoi/releases/download/v${Version}/chezmoi_${Version}_windows_amd64.zip"

if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null }
if (!(Test-Path "$TmpDir\extracted")) { New-Item "$TmpDir\extracted" -ItemType Directory | Out-Null }
curl.exe -Lo $Archive $DownloadUrl
tar.exe xf $Archive -C "$TmpDir\extracted"
Remove-Item $Exe
mv "$TmpDir\extracted\chezmoi.exe" $Exe
Remove-Item -Recurse -Force $TmpDir

& $Exe $args
