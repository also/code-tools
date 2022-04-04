export function binarySearchRightmost(
  mappings: Int32Array,
  row: number,
  column: number
) {
  const n = mappings.length / 6;
  let l = 0;
  let r = n;

  while (l < r) {
    const m = (l + r) >> 1;
    const mappingIndex = m * 6;
    const mappingRow = mappings[mappingIndex];
    if (
      mappingRow > row ||
      (mappingRow === row && mappings[mappingIndex + 1] > column)
    ) {
      r = m;
    } else {
      l = m + 1;
    }
  }

  return l * 6;
}

export function findNearestMapping(
  mappings: Int32Array,
  row: number,
  column: number
): number {
  let index = binarySearchRightmost(mappings, row, column);

  if (
    // we went past the row + column
    index >= mappings.length ||
    mappings[index] > row ||
    mappings[index + 1] > column
  ) {
    index -= 6;
  }

  return index;
}

export interface MappingRange {
  mapping: number;
  startColumn: number;
  endColumn: number;
}

export function findMappingRange(
  mappings: Int32Array,
  row: number,
  column: number,
  lineLength: number
): MappingRange | undefined {
  const nearest = findNearestMapping(mappings, row, column);
  if (nearest < 0 || mappings[nearest] !== row) {
    return undefined;
  }
  const next = nearest + 6;
  return {
    mapping: nearest,
    startColumn: mappings[nearest + 1],
    endColumn:
      next < mappings.length && mappings[next] === row
        ? mappings[next + 1]
        : lineLength,
  };
}
