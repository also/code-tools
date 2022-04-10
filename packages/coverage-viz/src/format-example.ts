import { formatOnly } from "./generate.js";
import { showEditor } from "./mapped-editor.js";

async function run() {
  const start = Date.now();
  const data = await formatOnly("const x=1;const    y=2");
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
