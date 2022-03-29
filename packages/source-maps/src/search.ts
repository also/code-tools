/*
the source-map-visualization lib
* did some stuff to handle 0-width mappings at the end of lines
* skipped mappings that were the same as those before
*/
export function rangeOfMapping(
  mappings: Int32Array,
  map: number,
  row: number,
  endColumn: number
) {
  if (mappings[map] !== row) return null;
  const startColumn = mappings[map + 1];

  // advance to the last mapping with the same start column
  while (
    map + 6 < mappings.length &&
    mappings[map + 6] === row &&
    mappings[map + 6 + 1] === startColumn
  ) {
    map += 6;
  }

  // if there's a subsequent mapping, that's the end of the range
  if (map + 6 < mappings.length && mappings[map + 6] === row) {
    endColumn = mappings[map + 6 + 1];
  }

  return {
    startColumn,
    endColumn,
  };
}

export function binarySearch(
  mappings: Int32Array,
  row: number,
  column: number
) {
  const n = mappings.length / 6;
  let l = 0;
  let r = n - 1;

  while (l <= r) {
    const m = (l + r) >> 1;
    const mappingIndex = m * 6;
    const mappingRow = mappings[mappingIndex];
    if (
      mappingRow < row ||
      (mappingRow === row && mappings[mappingIndex + 1] < column)
    ) {
      l = m + 1;
    } else {
      r = m - 1;
    }
  }

  return l * 6;
}

export function findMapping(mappings: Int32Array, row: number, column: number) {
  let firstMappingIndex = binarySearch(mappings, row, column);

  if (
    // we went past the row + column
    (firstMappingIndex >= mappings.length ||
      mappings[firstMappingIndex] > row ||
      mappings[firstMappingIndex + 1] > column) &&
    // and there's a previous mapping
    firstMappingIndex > 0 &&
    // that is on the same row
    mappings[firstMappingIndex - 6] === row
  ) {
    firstMappingIndex -= 6;
  }

  // TODO handle multiple mappings starting at the same column
  // TODO handle no mpappings at all on this row?
  return firstMappingIndex;
}
