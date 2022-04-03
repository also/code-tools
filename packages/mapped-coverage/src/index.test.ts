import { describe, expect, test } from "@jest/globals";
import { getIndices, toPoint } from "./index";

describe("getIndices", () => {
  test("finds indices", () => {
    expect(getIndices("")).toEqual([1]);
    expect(getIndices("hello\nworld")).toEqual([6, 12]);
  });
});

describe("toPoint", () => {
  test("returns undefined out of range", () => {
    expect(toPoint([], 0)).toBeUndefined();

    expect(toPoint([1], -1)).toBeUndefined();

    expect(toPoint([1], 2)).toBeUndefined();
  });

  const indices = getIndices("hello\nworld");

  test("finds points", () => {
    expect(toPoint(indices, 0)).toEqual({ line: 0, column: 0, offset: 0 });

    expect(toPoint(indices, 1)).toEqual({ line: 0, column: 1, offset: 1 });

    expect(toPoint(indices, 5)).toEqual({ line: 0, column: 5, offset: 5 });

    expect(toPoint(indices, 6)).toEqual({ line: 1, column: 0, offset: 6 });

    expect(toPoint(indices, 11)).toEqual({ line: 1, column: 5, offset: 11 });

    expect(toPoint(indices, 12)).toBeUndefined();
  });
});
