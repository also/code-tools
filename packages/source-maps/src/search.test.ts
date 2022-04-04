import { describe, expect, test } from "@jest/globals";
import { readObject, writeObject } from "./builder";
import { findNearestMapping } from "./search";

describe("findNearestMapping", () => {
  test("returns -6 for empty mappings", () => {
    expect(findNearestMapping(new Int32Array(), 1, 1)).toBe(-6);
    expect(findNearestMapping(new Int32Array(), -10, -10)).toBe(-6);
  });

  test("returns -6 if before line of first mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 1, generatedColumn: 0 });
    expect(findNearestMapping(mappings, 0, 0)).toBe(-6);
  });

  test("returns -6 if before column of first mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 10 });
    expect(findNearestMapping(mappings, 0, 0)).toBe(-6);
  });

  test("returns last mapping index if after line of last mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    expect(findNearestMapping(mappings, 1, 0)).toBe(0);
  });

  test("returns last mapping index if after column of last mapping", () => {
    const mappings = new Int32Array(6);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    expect(findNearestMapping(mappings, 0, 1)).toBe(0);
  });

  test("returns rightmost matching index when equal", () => {
    const mappings = new Int32Array(6 * 3);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    writeObject(mappings, 6, { generatedLine: 1, generatedColumn: 0 });
    writeObject(mappings, 12, { generatedLine: 1, generatedColumn: 0 });
    expect(findNearestMapping(mappings, 0, 0)).toBe(0);
    expect(findNearestMapping(mappings, 1, 0)).toBe(12);
  });

  test("returns closest index to left", () => {
    const mappings = new Int32Array(12);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    writeObject(mappings, 6, { generatedLine: 1, generatedColumn: 0 });
    expect(findNearestMapping(mappings, 0, 10)).toBe(0);
    expect(findNearestMapping(mappings, 1, 10)).toBe(6);
  });

  test("returns closest index to left when no coverage on line", () => {
    const mappings = new Int32Array(12);
    writeObject(mappings, 0, { generatedLine: 0, generatedColumn: 0 });
    writeObject(mappings, 6, { generatedLine: 2, generatedColumn: 0 });
    expect(findNearestMapping(mappings, 1, 10)).toBe(0);
  });
});
