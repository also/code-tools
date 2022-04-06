import { describe, expect, test } from "@jest/globals";
const { formatWithMap } =
  require("../lib/index") as typeof import("./index.js");

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

  test("doesn't generate mappings for unchanged input", async () => {
    expect(
      (await formatWithMap("const x = 1;\nconst y = 2;\nconst z = 3;\n", "  "))
        .mapping.mapping
    ).toMatchInlineSnapshot(`
Object {
  "formatted": Array [
    0,
  ],
  "original": Array [
    0,
  ],
}
`);
  });

  test("computes line endings", async () => {
    expect(
      (await formatWithMap("// a\n// b\n// c\n", "  ")).mapping
        .originalLineEndings
    ).toMatchInlineSnapshot(`
Array [
  4,
  9,
  14,
  15,
]
`);
  });
});
