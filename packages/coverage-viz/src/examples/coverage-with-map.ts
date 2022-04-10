import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";

import { generateFormatted } from "../generate.js";
import { showEditor } from "../mapped-editor.js";

function fetchText(url: string): Promise<string> {
  return fetch(url).then((response) => response.text());
}

export async function getData() {
  const [code, map, coverageString] = await Promise.all([
    fetchText("/example/dist/index.js"),
    fetchText("/example/dist/index.js.map"),
    fetchText("/example/coverage.json"),
  ]);

  const coverage: ChromeBasicCoverage[] = JSON.parse(coverageString);

  const exampleCoverage = coverage.find(
    (c) => c.url === "http://localhost:8000/dist/index.js"
  )!;

  return { code, map, coverage: exampleCoverage };
}

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
