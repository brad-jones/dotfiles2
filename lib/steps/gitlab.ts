export async function auth() {
  if (
    !(await Deno.run({
      cmd: ["glab", "auth", "login"],
    })
      .status()).success
  ) {
    throw new Error(`failed to login to to gitlab`);
  }
  console.log();
}
