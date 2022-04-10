import { getData } from "./coverage-example-data.js";
import { generateFormatted } from "./generate.js";
import { showEditor } from "./mapped-editor.js";

async function run() {
  const inputData = await getData();
  const start = Date.now();
  // const data = await formatOnly(`const x = 0; const y = 1; const z = 2;`);

  const data = await generateFormatted(
    inputData.code,
    inputData.map,
    inputData.coverage
  );
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
