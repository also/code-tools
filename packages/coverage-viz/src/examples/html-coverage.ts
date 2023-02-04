import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";
import { coverageOnly, getMimeType } from "../generate.js";
import { showEditor } from "../mapped-editor.js";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const coverage: ChromeBasicCoverage = require("./html-coverage.json")[0];

async function run() {
  const start = Date.now();
  const data = await coverageOnly(
    getMimeType(".html"),
    coverage.text!,
    coverage
  );
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
