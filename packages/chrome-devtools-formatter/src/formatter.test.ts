/**
 * @jest-environment jsdom
 */

import { describe, expect, test, jest } from "@jest/globals";

jest.mock("codemirror/lib/codemirror", () => {
  return window.CodeMirror;
});

const { format } =
  require("../lib/formatter") as typeof import("./formatter.js");

describe("format", () => {
  test("formats javascript", () => {
    expect(format("text/javascript", "x=1;")).toMatchInlineSnapshot(`
Object {
  "content": "x = 1;
",
  "mapping": Object {
    "formatted": Array [
      0,
      2,
      4,
    ],
    "original": Array [
      0,
      1,
      2,
    ],
  },
}
`);
  });

  test("formats css", () => {
    expect(format("text/css", "a{color:red};")).toMatchInlineSnapshot(`
Object {
  "content": "a {
    color: red
}

;",
  "mapping": Object {
    "formatted": Array [
      0,
      2,
      8,
      15,
      19,
      22,
    ],
    "original": Array [
      0,
      1,
      2,
      8,
      11,
      12,
    ],
  },
}
`);
  });

  test("formats html", () => {
    expect(format("text/html", "<div><h1>test</h1></div>")).
toMatchInlineSnapshot(`
Object {
  "content": "<div>
    <h1>test</h1>
</div>
",
  "mapping": Object {
    "formatted": Array [
      0,
      10,
      24,
    ],
    "original": Array [
      0,
      5,
      18,
    ],
  },
}
`);
  });

  test("doesn't format unsuported mime types", () => {
    expect(format("text/plain", "x=1;")).toMatchInlineSnapshot(`
Object {
  "content": "x=1;",
  "mapping": Object {
    "formatted": Array [
      0,
    ],
    "original": Array [
      0,
    ],
  },
}
`);
  });
});
