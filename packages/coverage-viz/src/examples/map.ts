import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";

import { generateFormatted } from "../generate.js";
import { showEditor } from "../mapped-editor.js";

function fetchText(url: string): Promise<string> {
  return fetch(url).then((response) => response.text());
}

export async function getData() {
  const opts = new URLSearchParams(location.search);
  const sourceUrl = opts.get("source");
  if (!sourceUrl) {
    throw new Error("Missing source");
  }
  const mapUrl = opts.get("map") || `${sourceUrl}.map`;
  const [code, map] = await Promise.all([
    fetchText(sourceUrl),
    fetchText(mapUrl),
  ]);

  return { code, map };
}

async function run() {
  const inputData = await getData();

  const start = Date.now();
  const data = await generateFormatted(inputData.code, inputData.map);
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
