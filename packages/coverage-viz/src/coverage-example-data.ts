import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types.js";

function fetchText(url: string): Promise<string> {
  return fetch(url).then((response) => response.text());
}

export async function getData() {
  const [code, map, coverageString] = await Promise.all([
    fetchText("example/dist/index.js"),
    fetchText("example/dist/index.js.map"),
    fetchText("example/coverage.json"),
  ]);

  const coverage: ChromeBasicCoverage[] = JSON.parse(coverageString);

  const exampleCoverage = coverage.find(
    (c) => c.url === "http://localhost:8000/dist/index.js"
  )!;

  return { code, map, coverage: exampleCoverage };
}
