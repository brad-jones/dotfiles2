# Brads DotFiles

This repo, represents Brads home directory dotfiles for both _*nix_ based
systems & Windows ones. It is a Deno CLI tool, execute it with the following
oneliners. _Brad does not use MacOS... yet_

## Quick Start

### *nix

```sh
curl -fsSL https://raw.githubusercontent.com/brad-jones/dotfiles/master/main.sh | sh
```

### Windows

```ps
&powershell -NoProfile -ExecutionPolicy unrestricted -C "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/brad-jones/dotfiles/master/main.ps1'))) <additional args>"
```

These one liners are designed to get you up and running on a fresh system,
quickly & easily. The scripts are designed to be small, simple and auditable.
_You should never just execute any arbitrary code from the internet!_

## Features

- Zero dependency installation & 100% automated setup.

- 100% idempotent, ie: safe to run many times over and get the same results.
  <https://en.wikipedia.org/wiki/Idempotence>

- Automatically updates it's self on login / this repo automatically updates
  through [dependabot](https://dependabot.com/) _like_ workflows.

- On Windows based systems it will create a WSL instance and then automatically
  run the Linux version of the tool and apply the setup inside the VM as well
  - inception :wink:

- Easily apply rollbacks by simply running a previous commit.

- `ssh` / `gpg` / `git` configuration for a Personal & Professional Identity.
  Similar to: <https://dev.to/milhamh95/how-to-set-multiple-git-identities-with-git-config-4m66>

- Uses [gopass](https://www.gopass.pw/) for secret management.

  - I am thinking about replacing this with something else.
    I find the GPG/team management features are overkill.
    These are my personal secrets that I will never share with anyone else.
    A symmetric encryption based password manager would be preferred.

- [aws-vault](https://github.com/99designs/aws-vault) _(with secret MFA sauce -
  connected to gopass)_ for managing AWS sessions.

- On Linux we install [asdf](https://asdf-vm.com/) for all your dev env tooling needs.

- On Windows we use [scoop](https://scoop.sh/) instead.

- An ok PowerShell profile & Windows Terminal for when the job absolutely has
  to be done on Windows :joy:

- And much more...

## Why this custom thing & not some off the shelf dotfile manager?

There was a time where I only cared for Linux, I started out with a
[chezmoi](https://www.chezmoi.io/) repo for my Linux dotfiles and this
worked very well.

But then I got a new job at [Xero](https://www.xero.com/) and had to make do
with a Windows laptop.

While [chezmoi](https://www.chezmoi.io/) does work on Windows, it's got some
rough edges & to create a single [chezmoi](https://www.chezmoi.io/) repo that
works well for both Linux & Windows became a challenge.

Maybe thats the answer, to create two separate repositories but then you would
have some duplicated stuff & I didn't want that either.

The other main concern was that [chezmoi](https://www.chezmoi.io/) focuses on a
declarative approach and discourages any imperative setup like the installing of
software.

While I see why they have made this choice & on *nix based systems you can
easily work with-in the declarative guard rails, on Windows I found this more
challenging due to things like the Registry urgh...

And I couldn't help but feel that it's a bit of a cop out to just discard that
part of ones environment setup. For me I wanted something 100% automated.
_(Or as close as possible to this that I can get.)_

## TODO

Stuff that I'd like to get managed through this dotfile repo but haven't done so yet.

- On first use install desktop apps, like Chrome, Firefox & Wavebox.
  Then let those things auto update, that are pretty good at that.

- Sweet git diffs in your terminal: <https://github.com/banga/git-split-diffs>

- Install AWS SessionManagerPlugin
  - <https://s3.amazonaws.com/session-manager-downloads/plugin/latest/windows/SessionManagerPluginSetup.exe>
  - <https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip>
  - <https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb>
  - <https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm>

### Remaining items from Go to Deno port

Yes if you bother to look back in the history of this repo you will note that it
started out as a Golang project but for reasons I decided to port it to Deno.
Mainly so I didn't need a pipeline to release changes & well I wanted to try Deno.

- Install & configure [aws-vault](https://github.com/99designs/aws-vault)

- Install dotnet (no I don't want to use tools like asdf or scoop because they
  break the built-in versioning that the dotnet tool provides)

- Install & setup a WSL distro. Yeah the whole inception thing.
