export function parseHttpImportUrl(url: string) {
  if (url.includes("denopkg.com")) {
    const parts = url.replace("https://denopkg.com/", "").split("/");
    const owner = parts[0];
    let repo = parts[1];
    let ref = "HEAD";
    if (repo.includes("@")) {
      const repoParts = repo.split("@");
      repo = repoParts[0];
      ref = repoParts[1];
    }
    const path = parts.slice(2).join("/");
    return { owner, repo, ref, path };
  }

  if (url.includes("raw.githubusercontent.com")) {
    const parts = url.replace("https://raw.githubusercontent.com/", "").split(
      "/",
    );
    const owner = parts[0];
    const repo = parts[1];
    const ref = parts[2];
    const path = parts.slice(3).join("/");
    return { owner, repo, ref, path };
  }

  // NB: There are also these other CDNs
  // https://denopkg.dev/
  // https://statically.io/
  // And countless others no doubt, I'm not sure I can be bothered
  // & will just use raw.githubusercontent.com directly.

  throw new Error("unsupported remote");
}
