import { coverageOnly } from "./generate.js";
import { showEditor } from "./mapped-editor.js";

async function run() {
  const start = Date.now();
  const data = await coverageOnly(
    require("../example/coverage-input.html.txt"),
    require("../example/html-coverage-example.json")[0]
  );
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
