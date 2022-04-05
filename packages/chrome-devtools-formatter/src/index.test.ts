import { describe, expect, test } from "@jest/globals";
const { formatWithMap } = require("../lib/index");

describe("formatWithMap", () => {
  test("removes extra spaces", async () => {
    expect((await formatWithMap(" const  x  =  1 ", "  ")).content).toBe(
      `const x = 1\n`
    );
  });

  test("adds spaces", async () => {
    expect((await formatWithMap("const x=1", "  ")).content).toBe(
      `const x = 1\n`
    );
  });
});
