import * as path from "https://deno.land/std@0.171.0/path/mod.ts#^";
import { HOME } from "../runtime/mod.ts";

export default () => `
[mounts]
	path = ${path.join(HOME, ".password-store")}
`;
