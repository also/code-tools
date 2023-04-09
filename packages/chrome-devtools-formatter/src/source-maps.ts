import { Mapper, Mapping } from ".";

// TODO when a range spans a newline, only the part on the first line is mapped
export async function toMappings(mapper: Mapper, sourceIndex = -1) {
  let data = new Int32Array(1024);
  let len = 0;
  let prev: Mapping | undefined;
  for (const m of mapper.iterateMappings()) {
    if (data.length < len + 6) {
      const expanded = new Int32Array(data.length * 2);
      expanded.set(data);
      data = expanded;
    }

    /*
    AAA
    AAA
    AAA
    BBB

    AAA
    AAA
    ABB
    
    */

    if (prev) {
      const extraLines =
        m.generated.line -
        (prev.generated.line + 1 < m.generated.line
          ? prev.generated.line + 1
          : prev.generated.line !== m.generated.line && m.generated.column !== 0
          ? prev.generated.line
          : m.generated.line);

      // TODO is this only handling when the original was already formatted?
      // no? at least not internally - maybe only at the end
      for (let i = 0; i < extraLines; i++) {
        data[len + 0] = i + prev.generated.line + 1;
        data[len + 1] = 0;
        data[len + 2] = sourceIndex;
        data[len + 3] = i + prev.original.line + 1;
        data[len + 4] = 0;
        data[len + 5] = -1;
        len += 6;
      }
    }

    data[len + 0] = m.generated.line;
    data[len + 1] = m.generated.column;
    data[len + 2] = sourceIndex;
    data[len + 3] = m.original.line;
    data[len + 4] = m.original.column;
    data[len + 5] = -1;
    len += 6;

    prev = m;
  }

  return data.subarray(0, len);
}
