import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts#^";

export default new Command()
  .description("Run this to perform subsequent updates of the dotfiles")
  .action(() => {
    console.log("foo called");

    // Wait for network connectivity
    // When run on logon sometimes the network stack isn't ready for us
    /*
    goerr.Check(retry.Do(func() error {
				r, err := resty.New().R().Get("https://www.google.com")
				if err != nil {
					return err
				}
				if !r.IsSuccess() {
					return goerr.New("not 200")
				}
				return nil
			}, retry.OnRetry(func(n uint, err error) {
				fmt.Printf("waiting for internet access (attempt: %v)...\n", n)
			})), "timed out waiting for internet access")
    */
  });
