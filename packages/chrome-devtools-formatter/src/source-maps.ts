import { Mapper } from ".";

// TODO when a range spans a newline, only the part on the first line is mapped
export async function toMappings(mapper: Mapper, sourceIndex = -1) {
  let data = new Int32Array(1024);
  let len = 0;
  for (const m of mapper.iterateMappings()) {
    if (data.length < len + 6) {
      const expanded = new Int32Array(data.length * 2);
      expanded.set(data);
      data = expanded;
    }

    data[len + 0] = m.generated.line;
    data[len + 1] = m.generated.column;
    data[len + 2] = sourceIndex;
    data[len + 3] = m.original.line;
    data[len + 4] = m.original.column;
    data[len + 5] = -1;
    len += 6;
  }

  return data.subarray(0, len);
}
