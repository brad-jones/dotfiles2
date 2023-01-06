. $env:USERPROFILE\Documents\WindowsPowerShell\utils.ps1;

# Set a custom directory for scoop apps
# https://github.com/lukesampson/scoop/wiki/Quick-Start#installing-scoop-to-custom-directory
SetEnv -Key "SCOOP" -Value "$env:USERPROFILE\.scoop";

# Define our path as early as possible
SetEnv -Key "Path" -Value ( -join ("C:\Windows\System32;",
	"C:\Windows;",
	"C:\Windows\System32\wbem;",
	"C:\Program Files\Mozilla Firefox;",
	"C:\Windows\System32\WindowsPowerShell\v1.0;",
	"C:\Program Files\Docker\Docker\resources\bin;",
	"C:\ProgramData\DockerDesktop\version-bin;",
	"C:\Program Files\xop\bin;",
	"C:\Program Files\Microsoft SQL Server\150\DAC\bin;",
	"C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\bin;",
	"C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\IDE\Extensions\TestPlatform;",
	"C:\Program Files\Amazon\SessionManagerPlugin\bin;",
	"C:\ProgramData\chocolatey\bin;",
	"$env:USERPROFILE\AppData\Roaming\Code\User\globalStorage\ms-vscode-remote.remote-containers\cli-bin;",
	"$env:USERPROFILE\.local\bin;",
	"$env:USERPROFILE\.dotnet;",
	"$env:USERPROFILE\.dotnet\tools;",
  "$env:SCOOP\shims;"));

SetEnv -Key "GIT_SSH" -Value "$env:USERPROFILE\.scoop\apps\win32-openssh\current\ssh.exe";

# Configure aws-vault to use gopass to store our idenities
SetEnv -Key "AWS_VAULT_BACKEND" -Value "pass";
SetEnv -Key "AWS_VAULT_PASS_CMD" -Value "gopass";
SetEnv -Key "AWS_VAULT_PASS_PREFIX" -Value "aws-vault";
SetEnv -Key "AWS_VAULT_PASS_PASSWORD_STORE_DIR" -Value "$env:USERPROFILE\.password-store";
