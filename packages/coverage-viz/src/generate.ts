import {
  getIndices,
  mapCoverageWithMappings,
  MappedCoverage,
} from "@also/mapped-coverage/lib";
import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";
import { formatWithMap } from "@also/chrome-devtools-formatter/lib";
import { toMappings } from "@also/chrome-devtools-formatter/lib/source-maps";
import { applyMappings } from "@also/source-maps/lib/transform";
import {
  makeOriginalMappings,
  makeOriginalMappingsUnanlyzed,
  readMappings,
} from "@also/source-maps/lib/parse";

interface Position {
  line: number;
  column: number;
}

export type CodeWithCoverage = {
  code: string;
  map: {
    mappings: Int32Array;
    sourceMappings: (Int32Array | undefined)[];
  };
  sourcesContent: string[];
  sourceNames: string[];
  coverage: MappedCoverage | undefined;
};

export async function generateFormatted(
  code: string,
  map: string,
  c?: ChromeBasicCoverage
): Promise<CodeWithCoverage> {
  const mapJson = JSON.parse(map);
  let start = Date.now();
  const indices = getIndices(code);
  console.log(`getIndices: ${Date.now() - start}ms`);

  start = Date.now();
  const formatted = await formatWithMap("text/javascript", code, "  ");
  console.log(`formatWithMap: ${Date.now() - start}ms`);

  start = Date.now();
  const originalMappings = readMappings(mapJson.mappings);
  console.log(`readMappings: ${Date.now() - start}ms`);

  start = Date.now();
  const formattedMappings = await toMappings(formatted.mapping);
  console.log(`toMappings: ${Date.now() - start}ms`);

  /** maps from formatted to minified */
  const mappedCoverage = c
    ? mapCoverageWithMappings(formattedMappings, c, indices)
    : undefined;

  start = Date.now();
  const remapped = applyMappings(formattedMappings, originalMappings.mappings);
  console.log(`applyMappings: ${Date.now() - start}ms`);

  start = Date.now();
  const sourceMappings = makeOriginalMappings(remapped);
  console.log(`makeOriginalMappings: ${Date.now() - start}ms`);

  return {
    code: formatted.content,
    map: { mappings: formattedMappings, sourceMappings },
    sourcesContent: mapJson.sourcesContent || [],
    sourceNames: mapJson.sources || [],
    coverage: mappedCoverage,
  };
}

export async function generate(
  code: string,
  map: string,
  c?: ChromeBasicCoverage
): Promise<CodeWithCoverage> {
  const mapJson = JSON.parse(map);
  let start = Date.now();
  const indices = getIndices(code);
  console.log(`getIndices: ${Date.now() - start}ms`);

  start = Date.now();
  const originalMappings = readMappings(mapJson.mappings);
  console.log(`readMappings: ${Date.now() - start}ms`);

  const mappedCoverage = c
    ? mapCoverageWithMappings(originalMappings.mappings, c, indices, false)
    : undefined;

  start = Date.now();
  const sourceMappings = makeOriginalMappings(originalMappings);
  console.log(`makeOriginalMappings: ${Date.now() - start}ms`);

  return {
    code,
    map: {
      mappings: originalMappings.mappings,
      sourceMappings,
    },
    sourcesContent: mapJson.sourcesContent || [],
    sourceNames: mapJson.sources || [],
    coverage: mappedCoverage,
  };
}

const extensions: Record<string, string> = {
  "text/html": "html",
  "text/css": "css",
  "text/javascript": "js",
};

export async function formatOnly(
  mimeType: string,
  code: string
): Promise<CodeWithCoverage> {
  const filename = `unformatted.${extensions[mimeType] ?? ".txt"}`;
  let start = Date.now();
  const formatted = await formatWithMap(mimeType, code, "  ");
  console.log(`formatWithMap: ${Date.now() - start}ms`);

  start = Date.now();
  const formattedMappings = await toMappings(formatted.mapping, 0);
  console.log(`toMappings: ${Date.now() - start}ms`);

  // don't need to generate inverse mappings when formatting only, since there's only one source and they're already ordered
  const sourceMappings = [formattedMappings];

  return {
    code: formatted.content,
    map: { mappings: formattedMappings, sourceMappings },
    sourcesContent: [code],
    sourceNames: [filename],
    coverage: undefined,
  };
}
