import { parse } from "https://deno.land/std@0.149.0/flags/mod.ts";
import { saveJsonFormatted } from "./lib.ts";
import {
  ensureDirSync,
  ensureFileSync,
} from "https://deno.land/std@0.151.0/fs/mod.ts";
import { createPostmanCollection } from "./index.ts";

// @TODO: improve the CLI

function help() {
  console.log(`Error: not enough arguments.
Usage:
	deno run index.ts <GRAPHQL_ENDPOINT_URL> {--out=OUTPUT_FILE, --authorization=AUTHORIZATION_HEADER}
Help:
  deno run index.ts [--help | -h]
`);
}

const args = parse(Deno.args, { boolean: ["help", "h"] }) as {
  _: [string];
  help?: boolean;
  h?: boolean;
  out?: string;
  headers?: string;
};

if (Deno.args.length < 1 || args.help || args.h) {
  help();
  Deno.exit(1);
}

const url = args._[0];
let path = args.out;
const headerString = args.headers;

const customHeaders = (headerString?.split(",") || [])
  .map((header) => ({ key: header.split(":")[0], value: header.split(":")[1] }))
  .reduce((map, pair: { key: string; value: string }) => {
    map[pair.key.trim()] = pair.value.trim();
    return map;
  }, {});

const urlRegexp = /https?:\/\/*/;
if (!urlRegexp.test(url)) {
  console.error(`${url} is not a valid url`);
  Deno.exit(1);
}

console.log(`Creating the postman collection for ${url}`);

const { postmanCollection } = await createPostmanCollection(
  url,
  customHeaders,
);

path = path ||
  "./out/" + postmanCollection.info.name + ".postman_collection.json";
path && ensureDirSync("./out/");
try {
  !path && ensureFileSync(path);
} catch (e) {
  console.error(`Error: ${e.message}`);
  Deno.exit(1);
}
saveJsonFormatted(postmanCollection, path);
console.log(`Collection saved at ${path}`);

console.log(`Import it in postman and complete the queries ! 🚀`);
