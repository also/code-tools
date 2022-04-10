import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";
import { coverageOnly } from "./generate.js";
import { showEditor } from "./mapped-editor.js";

const coverage: ChromeBasicCoverage =
  require("../example/html-coverage-example.json")[0];

async function run() {
  const start = Date.now();
  const data = await coverageOnly(coverage.text!, coverage);
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
