#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$Version = '1.29.2';
$BinDir = "${env:USERPROFILE}\.local\bin"
$Archive = "$BinDir\deno.zip"
$Exe = "$BinDir\deno.exe"
$Target = 'x86_64-pc-windows-msvc'
$DownloadUrl = "https://github.com/denoland/deno/releases/download/v${Version}/deno-${Target}.zip"

# Install deno if it's not already installed
$installed = $false
try {
  if ($(& $Exe --version) -like "deno $Version*") {
    $installed = $true
  }
} catch {
  # swallow the not found exception
}
if (!$installed) {
  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null }
  curl.exe -Lo $Archive $DownloadUrl
  tar.exe xf $Archive -C $BinDir
  Remove-Item $Archive
}

# If working locally we don't want to run the code from the remote repo but our local one
$opts = "-rA"
$scriptRoot = "https://raw.githubusercontent.com/brad-jones/dotfiles/master"
if (![string]::IsNullOrEmpty($PSScriptRoot)) {
  $scriptRoot = $PSScriptRoot
  $opts = "-A"
}

# Execute our entrypoint
& $Exe run $opts "$scriptRoot/main.ts" $args
Exit $LASTEXITCODE
