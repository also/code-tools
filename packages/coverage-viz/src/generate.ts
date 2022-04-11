import {
  formatCoverage,
  FormattedCoverage,
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

export type CodeWithCoverage = {
  code: string;
  language: string;
  map: {
    mappings: Int32Array;
    sourceMappings: (Int32Array | undefined)[];
  };
  sourcesContent: string[];
  sourceNames: string[];
  coverage: MappedCoverage | FormattedCoverage | undefined;
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
    language: "javascript",
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
    language: "javascript",
    map: {
      mappings: originalMappings.mappings,
      sourceMappings,
    },
    sourcesContent: mapJson.sourcesContent || [],
    sourceNames: mapJson.sources || [],
    coverage: mappedCoverage,
  };
}

export async function coverageOnly(
  mimeType: string,
  code: string,
  c?: ChromeBasicCoverage
): Promise<CodeWithCoverage> {
  let start;

  start = Date.now();
  const formatted = await formatWithMap(mimeType, code, "  ");
  console.log(`formatWithMap: ${Date.now() - start}ms`);

  start = Date.now();
  const formattedMappings = await toMappings(formatted.mapping, 0);
  console.log(`toMappings: ${Date.now() - start}ms`);

  start = Date.now();
  /** maps from formatted to minified */
  const mappedCoverage = c ? formatCoverage(formatted.mapping, c) : undefined;
  console.log(`formatCoverage: ${Date.now() - start}ms`);

  start = Date.now();
  const sourceMappings = makeOriginalMappingsUnanlyzed(formattedMappings);
  console.log(`makeOriginalMappings: ${Date.now() - start}ms`);

  return {
    code: formatted.content,
    // FIXME
    language: "html",
    map: { mappings: formattedMappings, sourceMappings },
    sourcesContent: [code],
    sourceNames: [c?.url ?? "FIXME"],
    coverage: mappedCoverage,
  };
}

const types: Record<string, { extension: string; language: string }> = {
  "text/html": { extension: "html", language: "html" },
  "text/css": { extension: "css", language: "css" },
  "text/javascript": { extension: "js", language: "javascript" },
};

export function getMimeType(filename: string) {
  for (const [mimeType, { extension }] of Object.entries(types)) {
    if (filename.endsWith(`.${extension}`)) {
      return mimeType;
    }
  }
}

export async function formatOnly(
  mimeType: string,
  code: string
): Promise<CodeWithCoverage> {
  const type = types[mimeType] ?? { extension: "txt", language: "text" };
  const filename = `unformatted.${type.extension}`;
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
    language: type.language,
    map: { mappings: formattedMappings, sourceMappings },
    sourcesContent: [code],
    sourceNames: [filename],
    coverage: undefined,
  };
}
