import { describe, expect, test } from "@jest/globals";

import { readObject, writeObject } from "./builder";

describe("writeObject", () => {
  test("writes complete mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, {
      generatedLine: 1,
      generatedColumn: 2,
      sourceIndex: 3,
      originalLine: 4,
      originalColumn: 5,
      nameIndex: 6,
    });
    expect(Array.from(mappings)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("writes mapping without name", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, {
      generatedLine: 1,
      generatedColumn: 2,
      sourceIndex: 3,
      originalLine: 4,
      originalColumn: 5,
    });
    expect(Array.from(mappings)).toEqual([1, 2, 3, 4, 5, -1]);
  });

  test("writes mapping without name", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, {
      generatedLine: 1,
      generatedColumn: 2,
    });
    expect(Array.from(mappings)).toEqual([1, 2, -1, -1, -1, -1]);
  });
});

describe("readObject", () => {
  test("reads complete mapping", () => {
    const mappings = new Int32Array([1, 2, 3, 4, 5, 6]);
    expect(readObject(mappings, 0)).toEqual({
      generatedLine: 1,
      generatedColumn: 2,
      sourceIndex: 3,
      originalLine: 4,
      originalColumn: 5,
      nameIndex: 6,
    });
  });

  test("does no validation", () => {
    const mappings = new Int32Array([-1, -1, -1, -1, -1, -1]);
    expect(readObject(mappings, 0)).toEqual({
      generatedLine: -1,
      generatedColumn: -1,
      sourceIndex: -1,
      originalLine: -1,
      originalColumn: -1,
      nameIndex: -1,
    });
  });
});
