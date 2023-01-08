export async function auth() {
  if (
    !(await Deno.run({
      cmd: ["gh", "auth", "login", "-p", "https", "-w"],
    })
      .status()).success
  ) {
    throw new Error(`failed to login to to github`);
  }
  console.log();
}
