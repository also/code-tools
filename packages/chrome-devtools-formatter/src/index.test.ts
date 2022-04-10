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

  test("treats different kinds of whitespace the same", async () => {
    expect(
      (
        await formatWithMap(
          "const x\t=\n1; const\ny =\t2;\nconst z = 3;\n",
          "  "
        )
      ).mapping.mapping
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

  test("generates a single mapping for empty string", async () => {
    expect(await formatWithMap("", "  ")).toMatchInlineSnapshot(`
Object {
  "content": "",
  "mapping": Mapper {
    "formatted": "",
    "formattedLineEndings": Array [
      0,
    ],
    "mapping": Object {
      "formatted": Array [
        0,
      ],
      "original": Array [
        0,
      ],
    },
    "original": "",
    "originalLineEndings": Array [
      0,
    ],
  },
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

    expect(
      (await formatWithMap("// a\n// b\n// c", "  ")).mapping
        .originalLineEndings
    ).toMatchInlineSnapshot(`
Array [
  4,
  9,
  14,
]
`);
  });

  test("computes ranges", async () => {
    const { mapping, content } = await formatWithMap(
      "const a = 1; const b = 2; const c = 3;",
      "  "
    );

    expect([...mapping.iterateRanges()]).toMatchInlineSnapshot(`
Array [
  Object {
    "generated": Object {
      "end": Object {
        "column": 1,
        "line": 3,
        "offset": 39,
      },
      "start": Object {
        "column": 0,
        "line": 0,
        "offset": 0,
      },
    },
    "original": Object {
      "end": Object {
        "column": 38,
        "line": 0,
        "offset": 38,
      },
      "start": Object {
        "column": 0,
        "line": 0,
        "offset": 0,
      },
    },
  },
]
`);
  });
});
