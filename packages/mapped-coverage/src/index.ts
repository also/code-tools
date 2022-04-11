import { findNearestMapping } from "@also/source-maps/lib/search";
import { Mapper } from "@also/chrome-devtools-formatter/lib";
import { ChromeBasicCoverage, V8Coverage } from "./types.js";

// https://github.com/vfile/vfile-location/blob/a2322512ec2c5949bfbc9566f7aab43720cf22ce/index.js
/*
(The MIT License)

Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
export function getIndices(source: string) {
  const search = /\r?\n|\r/g;

  const indices = [];
  while (search.test(source)) {
    indices.push(search.lastIndex);
  }

  indices.push(source.length + 1);

  return indices;
}

export interface Point {
  line: number;
  column: number;
  offset: number;
}

export function toPoint(indices: number[], offset: number): Point | undefined {
  let index = -1;

  if (offset > -1 && offset < indices[indices.length - 1]) {
    while (++index < indices.length) {
      if (indices[index] > offset) {
        return {
          line: index,
          column: offset - (indices[index - 1] || 0),
          offset,
        };
      }
    }
  }

  return undefined;
}

export interface Position {
  line: number;
  column: number;
}

export interface CoverageEntry {
  start: Position;
  end: Position;
}

export interface MappedPosition extends Position {
  mapping?: number;
}

export interface MappedCoverageEntry extends CoverageEntry {
  start: MappedPosition;
  end: MappedPosition;
}

export interface MappedCoverage {
  type: "mapped";
  coverage: MappedCoverageEntry[];
  mappingRangeIndices: Int32Array;
}

export interface FormattedCoverage {
  type: "formatted";
  unformattedCoverage: CoverageEntry[];
  formattedCoverage: CoverageEntry[];
}

export function formatCoverage(
  mapper: Mapper,
  coverage: ChromeBasicCoverage
): FormattedCoverage {
  return {
    type: "formatted",

    unformattedCoverage: coverage.ranges.map((r) => {
      const [startline, startColumn] = mapper.positionToLocationOriginal(
        r.start
      );
      const [endline, endColumn] = mapper.positionToLocationOriginal(r.end);

      return {
        start: { line: startline, column: startColumn },
        end: { line: endline, column: endColumn },
      };
    }),

    formattedCoverage: coverage.ranges.map((r) => {
      const [startline, startColumn] = mapper.positionToLocationFormatted(
        mapper.convertPositionOriginal(r.start)
      );
      const [endLine, endColumn] = mapper.positionToLocationFormatted(
        mapper.convertPositionOriginal(r.end)
      );
      return {
        start: { line: startline, column: startColumn },
        end: {
          line: endLine,
          column: endColumn,
        },
      };
    }),
  };
}

export function mapCoverageWithMappings(
  mappings: Int32Array,
  coverage: ChromeBasicCoverage,
  indices: number[],
  coversOriginal = true
): MappedCoverage {
  const mappingRangeIndices = new Int32Array(mappings.length / 6).fill(-1);
  const searchMappings = coversOriginal ? mappings.subarray(3) : mappings;
  const result: MappedCoverageEntry[] = [];
  let i = 0;

  for (const r of coverage.ranges) {
    const start = toPoint(indices, r.start);
    const end = toPoint(indices, r.end);
    if (!(start && end)) {
      throw new Error(`Invalid range ${JSON.stringify(r)}`);
    }

    let startMapping = findNearestMapping(
      searchMappings,
      start.line,
      start.column
    );
    // TODO add some range functions to source-maps
    // if the coverage begins before the first mapping, that's fine
    if (startMapping < 0) {
      startMapping = 0;
    }
    const endMapping = findNearestMapping(searchMappings, end.line, end.column);
    const mapped =
      searchMappings[startMapping] === start.line &&
      // FIXME why?
      endMapping < mappings.length;

    if (coversOriginal) {
      if (!mapped) {
        throw new Error("couldn't find mapping");
      }
      result.push({
        start: {
          line: mappings[startMapping],
          column: mappings[startMapping + 1],
          mapping: startMapping,
        },
        end: {
          line: mappings[endMapping],
          column: mappings[endMapping + 1],
          mapping: endMapping,
        },
      });
    } else {
      result.push({
        start,
        end,
      });
    }
    if (mapped) {
      const max = endMapping / 6;

      for (let j = startMapping / 6; j <= max; j += 1) {
        mappingRangeIndices[j] = i;
      }
    }

    i++;
  }

  return {
    type: "mapped",
    coverage: result,
    mappingRangeIndices,
  };
}

export function makeOriginalCoverage(
  mappedCoverage: MappedCoverage,
  originalMappings: Int32Array
) {
  const result: CoverageEntry[] = [];
  for (let i = 0; i < originalMappings.length; i += 6) {
    const index = originalMappings[i + 5];
    let covered = mappedCoverage.mappingRangeIndices[index / 6] !== -1;

    if (covered) {
      const firstMapping = i;
      let lastMapping = firstMapping;
      while (true) {
        i += 6;
        if (i >= originalMappings.length) {
          break;
        }
        const endIndex = originalMappings[i + 5];
        if (mappedCoverage.mappingRangeIndices[endIndex / 6] === -1) {
          break;
        }
        lastMapping = i;
      }

      result.push({
        start: {
          line: originalMappings[firstMapping + 3],
          column: originalMappings[firstMapping + 4],
        },
        end: {
          line: originalMappings[lastMapping + 3],
          column: originalMappings[lastMapping + 4],
        },
      });
    }
  }

  return result;
}

// https://github.com/puppeteer/puppeteer/blob/8ff9d598bf4afd10cbc61ca9579b7bd38edb8026/src/common/Coverage.ts#L412
/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function convertToDisjointRanges(
  nestedRanges: Array<{ startOffset: number; endOffset: number; count: number }>
): Array<{ start: number; end: number }> {
  const points = [];
  for (const range of nestedRanges) {
    points.push({ offset: range.startOffset, type: 0, range });
    points.push({ offset: range.endOffset, type: 1, range });
  }
  // Sort points to form a valid parenthesis sequence.
  points.sort((a, b) => {
    // Sort with increasing offsets.
    if (a.offset !== b.offset) return a.offset - b.offset;
    // All "end" points should go before "start" points.
    if (a.type !== b.type) return b.type - a.type;
    const aLength = a.range.endOffset - a.range.startOffset;
    const bLength = b.range.endOffset - b.range.startOffset;
    // For two "start" points, the one with longer range goes first.
    if (a.type === 0) return bLength - aLength;
    // For two "end" points, the one with shorter range goes first.
    return aLength - bLength;
  });

  const hitCountStack = [];
  const results: { start: number; end: number }[] = [];
  let lastOffset = 0;
  // Run scanning line to intersect all ranges.
  for (const point of points) {
    if (
      hitCountStack.length &&
      lastOffset < point.offset &&
      hitCountStack[hitCountStack.length - 1] > 0
    ) {
      const lastResult = results.length ? results[results.length - 1] : null;
      if (lastResult && lastResult.end === lastOffset)
        lastResult.end = point.offset;
      else results.push({ start: lastOffset, end: point.offset });
    }
    lastOffset = point.offset;
    if (point.type === 0) hitCountStack.push(point.range.count);
    else hitCountStack.pop();
  }
  // Filter out empty ranges.
  return results.filter((range) => range.end - range.start > 1);
}

/** Simplify code coverage extracted via the devtools API by converting to disjoint ranges. */
export function simplifyCoverage(v8coverage: V8Coverage): ChromeBasicCoverage {
  const flattenRanges = [];
  for (const func of v8coverage.functions) flattenRanges.push(...func.ranges);
  const ranges = convertToDisjointRanges(flattenRanges);

  return {
    url: v8coverage.url,
    ranges: ranges,
  };
}

export function coverageToMappings(
  ranges: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  }[]
) {
  const rangeLines = [...rangesToLines(ranges)];
  const mappings = new Int32Array(rangeLines.length * 6);

  let i = 0;
  for (const r of rangeLines) {
    mappings[i * 6] = r.line;
    mappings[i * 6 + 1] = r.startColumn;
    mappings[i * 6 + 2] = r.endColumn ?? -1;
    i++;
  }

  return mappings;
}

function* rangesToLines(
  ranges: Iterable<{
    start: { line: number; column: number };
    end: { line: number; column: number };
  }>
) {
  for (const r of ranges) {
    for (let i = r.start.line; i <= r.end.line; i++) {
      const startColumn = i === r.start.line ? r.start.column : 0;
      const endColumn = i === r.end.line ? r.end.column : undefined;
      yield { line: i - 1, startColumn, endColumn };
    }
  }
}
