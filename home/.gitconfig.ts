import { OS } from "../lib/runtime/mod.ts";

export default () => `
[init]
	defaultBranch = master

[core]
	eol = lf
	autocrlf = false

[push]
	default = simple

[pull]
	rebase = true

[includeIf "gitdir:~/Projects/Personal/"]
	path = ~/Projects/Personal/.gitconfig

[includeIf "gitdir:~/Projects/Xero/"]
	path = ~/Projects/Xero/.gitconfig

[includeIf "gitdir:~/.password-store/"]
	path = ~/Projects/Personal/.gitconfig

[includeIf "gitdir:%(prefix)/mnt/C/Users/brad.jones/Projects/Personal/"]
	path = /mnt/C/Users/brad.jones/Projects/Personal/.gitconfig

[includeIf "gitdir:%(prefix)/mnt/C/Users/brad.jones/Projects/Xero/"]
	path = /mnt/C/Users/brad.jones/Projects/Xero/.gitconfig

[credential]
	helper = ${OS === "windows" ? "manage" : "cache"}

[credential "https://github.com"]
	helper =
	helper = !'C:\\Users\\brad.jones\\.scoop\\apps\\gh\\current\\bin\\gh.exe' auth git-credential

[credential "https://gist.github.com"]
	helper =
	helper = !'C:\\Users\\brad.jones\\.scoop\\apps\\gh\\current\\bin\\gh.exe' auth git-credential

[gpg]
	program = ${
  OS === "windows"
    ? "C:\\Users\\brad.jones\\.scoop\\apps\\gpg\\current\\bin\\gpg.exe"
    : "/usr/bin/gpg"
}

[commit]
	gpgSign = true

[tag]
	forceSignAnnotated = true
`;
