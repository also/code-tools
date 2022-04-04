import { findNearestMapping } from "./search.js";

/** use intermediate mappings to update original line, column, source, and name in final mappings */
export function applyMappings(
  finalMappings: Int32Array,
  intermediateMappings: Int32Array
) {
  const sourceLengths: number[] = [];
  let maxSourceLength = 0;

  for (let i = 0; i < finalMappings.length; i += 6) {
    const newMapping = findNearestMapping(
      intermediateMappings,
      finalMappings[i + 3],
      finalMappings[i + 4]
    );
    if (finalMappings[i + 3] === intermediateMappings[newMapping]) {
      finalMappings[i + 2] = intermediateMappings[newMapping + 2];
      finalMappings[i + 3] = intermediateMappings[newMapping + 3];
      finalMappings[i + 4] = intermediateMappings[newMapping + 4];
      finalMappings[i + 5] = intermediateMappings[newMapping + 5];

      const source = intermediateMappings[newMapping + 2];
      if (source !== -1) {
        const sourceLength = (sourceLengths[source] ?? 0) + 1;
        sourceLengths[source] = sourceLength;
        if (sourceLength > maxSourceLength) {
          maxSourceLength = sourceLength;
        }
      }
    } else {
      finalMappings[i + 2] = -1;
    }
  }

  return { mappings: finalMappings, sourceLengths, maxSourceLength };
}
