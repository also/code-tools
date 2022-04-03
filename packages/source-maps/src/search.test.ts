import { describe, expect, test } from "@jest/globals";
import { readObject, writeObject } from "./builder";
import { findMapping } from "./search";

describe("findMapping", () => {
  test("returns 0 for empty mappings", () => {
    expect(findMapping(new Int32Array(), 1, 1)).toEqual(0);
    expect(findMapping(new Int32Array(), -10, -10)).toEqual(0);
  });

  test("returns 0 if before line of first mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 1, generatedColumn: 0 });
    expect(findMapping(mappings, 0, 0)).toEqual(0);
  });

  test("returns 0 if before column of first mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 10 });
    expect(findMapping(mappings, 0, 0)).toEqual(0);
  });

  test("returns length if after line of last mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    expect(findMapping(mappings, 1, 0)).toEqual(6);
  });

  test("returns closest index to left if after column of last mapping", () => {
    const mappings = new Int32Array(12);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    writeObject(mappings, 6, { generatedLine: 1, generatedColumn: 0 });
    expect(findMapping(mappings, 1, 10)).toEqual(6);
  });

  test("returns closest index to left", () => {
    const mappings = new Int32Array(12);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    writeObject(mappings, 6, { generatedLine: 1, generatedColumn: 0 });
    expect(findMapping(mappings, 0, 10)).toEqual(0);
    expect(findMapping(mappings, 1, 10)).toEqual(6);
  });

  // FIXME bug?
  test("returns closest index to right when no coverage on line", () => {
    const mappings = new Int32Array(12);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    writeObject(mappings, 6, { generatedLine: 2, generatedColumn: 0 });
    expect(findMapping(mappings, 1, 10)).toEqual(6);
  });
});
