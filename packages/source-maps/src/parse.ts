export function makeOriginalMappings({
  mappings,
  sourceLengths,
  maxSourceLength,
}: {
  mappings: Int32Array;
  sourceLengths: number[];
  maxSourceLength: number;
}) {
  const len = mappings.length;
  const sourceMappings: (
    | { data: Int32Array; len: number; sorted: boolean }
    | undefined
  )[] = [];
  for (let i = 0; i < len; i += 6) {
    const sourceIndex = mappings[i + 2];
    if (sourceIndex === -1) continue;
    let sourceData = sourceMappings[sourceIndex];
    if (!sourceData) {
      sourceMappings[sourceIndex] = sourceData = {
        data: new Int32Array(sourceLengths[sourceIndex] * 6),
        len: 0,
        sorted: false,
      };
    }
    const j = sourceData.len;
    sourceData.data[j + 0] = mappings[i + 0];
    sourceData.data[j + 1] = mappings[i + 1];
    sourceData.data[j + 2] = mappings[i + 2];
    sourceData.data[j + 3] = mappings[i + 3];
    sourceData.data[j + 4] = mappings[i + 4];
    sourceData.data[j + 5] = i;
    sourceData.len += 6;
  }

  const temp = new Int32Array(maxSourceLength * 6);

  for (let i = 0; i < sourceMappings.length; i++) {
    const sourceData = sourceMappings[i];
    if (!sourceData) continue;
    if (!sourceData.sorted) {
      temp.set(sourceData.data);
      topDownMergeSort(sourceData.data, temp);
    }
  }

  return sourceMappings.map((m) => m?.data);
}

/** merge sort *for original mappings* */
function topDownMergeSort(a: Int32Array, b: Int32Array) {
  b.set(a);
  topDownSplitMerge(b, 0, a.length / 6, a);
}

function topDownSplitMerge(
  b: Int32Array,
  iBegin: number,
  iEnd: number,
  a: Int32Array
) {
  if (iEnd - iBegin <= 1) {
    return;
  }
  const iMiddle = (iEnd + iBegin) >> 1;
  topDownSplitMerge(a, iBegin, iMiddle, b);
  topDownSplitMerge(a, iMiddle, iEnd, b);

  topDownMerge(b, iBegin, iMiddle, iEnd, a);
}

function topDownMerge(
  a: Int32Array,
  iBegin: number,
  iMiddle: number,
  iEnd: number,
  b: Int32Array
) {
  let i = iBegin;
  let j = iMiddle;
  for (let k = iBegin; k < iEnd; k++) {
    const i6 = i * 6;
    const j6 = j * 6;
    const k6 = k * 6;
    const leftRow = a[i6 + 3];
    const rightRow = a[j6 + 3];
    if (
      i < iMiddle &&
      (j >= iEnd ||
        leftRow < rightRow ||
        (leftRow === rightRow && a[i6 + 4] <= a[j6 + 4]))
    ) {
      b[k6] = a[i6];
      b[k6 + 1] = a[i6 + 1];
      b[k6 + 2] = a[i6 + 2];
      b[k6 + 3] = a[i6 + 3];
      b[k6 + 4] = a[i6 + 4];
      b[k6 + 5] = a[i6 + 5];
      i++;
    } else {
      b[k6] = a[j6];
      b[k6 + 1] = a[j6 + 1];
      b[k6 + 2] = a[j6 + 2];
      b[k6 + 3] = a[j6 + 3];
      b[k6 + 4] = a[j6 + 4];
      b[k6 + 5] = a[j6 + 5];
      j++;
    }
  }
}

const base64Table = new Uint8Array(128);
base64Table.fill(255);
{
  const base64Chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (let i = 0; i < base64Chars.length; i++) {
    base64Table[base64Chars.charCodeAt(i)] = i;
  }
}

// https://github.com/mozilla/source-map/blob/c97d38b70de088d87b051f81b95c138a74032a43/lib/base64-vlq.js
export function readMappings(s: string) {
  const sLen = s.length;
  let generatedLine = 0;
  let generatedColumn = 0;
  let source = 0;
  let originalLine = 0;
  let originalColumn = 0;
  let name = 0;
  let lineFirstMapping = 0;
  let sorted = true;
  let i = 0;
  let len = 0;
  const mappings = new Int32Array(s.length * 3);

  let generatedColumnVlq;
  let hasSource;
  let sourceVlq;
  let originalLineVlq;
  let originalColumnVlq;
  let hasName;
  let nameVlq;

  function readVlq() {
    let result = 0;
    let shift = 0;
    while (true) {
      const byte = s.charCodeAt(i++);
      const digit = base64Table[byte];
      if (digit === 255 || digit === undefined) {
        throw new Error("invalid vlq");
      }
      result |= (digit & 31) << shift;
      shift += 5;

      // break if no continuation bit
      if ((digit & 32) === 0) break;
    }

    const shiftedResult = result >> 1;
    return result & 1 ? -shiftedResult : shiftedResult;
  }

  while (i < sLen) {
    let char = s.charCodeAt(i);

    if (char === 59 /* ; */) {
      if (!sorted) {
        // FIXME
        throw new Error("too lazy to sort");
      }

      generatedLine++;
      generatedColumn = 0;
      lineFirstMapping = sLen;
      sorted = true;
      i++;
    } else if (char === 44 /* , */) {
      i++;
    } else {
      generatedColumnVlq = readVlq();

      generatedColumn += generatedColumnVlq;

      hasSource = false;
      hasName = false;

      if (i < sLen) {
        char = s.charCodeAt(i);
        if (char === 44 /* , */) {
          i++;
        } else if (char !== 59 /* ; */) {
          hasSource = true;

          sourceVlq = readVlq();
          originalLineVlq = readVlq();
          originalColumnVlq = readVlq();

          source += sourceVlq;
          originalLine += originalLineVlq;
          originalColumn += originalColumnVlq;

          if (i < sLen) {
            char = s.charCodeAt(i);
            if (char === 44 /* , */) {
              i++;
            } else if (char !== 59 /* ; */) {
              hasName = true;

              nameVlq = readVlq();

              name += nameVlq;

              if (i < sLen) {
                char = s.charCodeAt(i);
                if (char === 44 /* , */) {
                  i++;
                } else if (char !== 59 /* ; */) {
                  throw new Error("invalid vlq");
                }
              }
            }
          }
        }
      }

      if (generatedColumnVlq < 0) {
        sorted = false;
      }

      // TODO any validation

      mappings[len] = generatedLine;
      mappings[len + 1] = generatedColumn;
      if (hasSource) {
        mappings[len + 2] = source;
        mappings[len + 3] = originalLine;
        mappings[len + 4] = originalColumn;
      } else {
        mappings[len + 2] = -1;
        mappings[len + 3] = -1;
        mappings[len + 4] = -1;
      }

      if (hasName) {
        mappings[len + 5] = name;
      } else {
        mappings[len + 5] = -1;
      }

      len += 6;
    }
  }

  return mappings.subarray(0, len);
}
