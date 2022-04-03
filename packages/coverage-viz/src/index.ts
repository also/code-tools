import "./monaco-environment.js";
import { getData } from "./coverage-example-data.js";
import { CodeWithCoverage, generate } from "./generate.js";
import { findMapping, rangeOfMapping } from "@also/source-maps/lib/search";
import monacoTypes from "monaco-editor";
import { RangeRect, render, sizeCanvas } from "./overlay.js";
import { CoverageEntry, makeOriginalCoverage } from "@also/mapped-coverage/lib";
const monaco: typeof monacoTypes = require("monaco-editor/esm/vs/editor/editor.main.js");

interface PaneData {
  mappings: Int32Array;
  offsetMappings: Int32Array;
  value: string;
}

interface Pane {
  isGenerated: boolean;
  editor: monacoTypes.editor.IStandaloneCodeEditor;
  model: monacoTypes.editor.ITextModel;
  domNode: HTMLElement;
  statusDomNode: HTMLElement;
  hoverDecorations: string[];
  coverageDecorations: string[];
  data: PaneData | undefined;
}

function getRect(
  editor: monacoTypes.editor.IStandaloneCodeEditor,
  line: number,
  startColumn: number,
  endColumn: number
): RangeRect | undefined {
  const start = editor.getScrolledVisiblePosition({
    lineNumber: line + 1,
    column: startColumn + 1,
  });
  const end = editor.getScrolledVisiblePosition({
    lineNumber: line + 1,
    column: endColumn + 1,
  });

  if (!start || !end) {
    return undefined;
  }

  return {
    top: start.top,
    left: start.left,
    right: end.left,
    bottom: end.top + end.height,
    width: end.left - start.left,
    height: start.height,
  };
}

type Hovered =
  | { line: number; column: number; mapping?: undefined; range?: undefined }
  | {
      line: number;
      column: number;
      mapping: number;
      range: { startColumn: number; endColumn: number };
    };

function getHovered(
  mappings: Int32Array,
  model: monacoTypes.editor.ITextModel,
  position: monacoTypes.IPosition
): Hovered {
  const row = position.lineNumber - 1;
  const index = position.column - 1;
  const mapping = findMapping(mappings, row, index);
  const range = rangeOfMapping(
    mappings,
    mapping,
    row,
    model.getLineLength(position.lineNumber)
  );

  if (!(range && index >= range.startColumn && index < range.endColumn)) {
    return {
      line: row,
      column: index,
    };
  }

  return {
    line: row,
    column: index,
    mapping,
    range,
  };
}

const options: monacoTypes.editor.IStandaloneEditorConstructionOptions = {
  language: "javascript",
  readOnly: true,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  // TODO: the docs says the default is off and that means it should never wrap
  // but text will wrap if the initial value in the editor has really long lines
  wordWrap: "on",
  // https://github.com/microsoft/monaco-editor/issues/2940
  // files with lots of interesting characters will cause a warning to be displayed
  // asking to disable highlighting, but clicking does nothing
  unicodeHighlight: {
    ambiguousCharacters: false,
  },
};

function getOriginal(
  data: CodeWithCoverage,
  index: number
): PaneData | undefined {
  if (index === -1) {
    return undefined;
  }
  const mappings = data.map.sourceMappings[index]!;
  return {
    mappings,
    offsetMappings: mappings.subarray(3),
    value: data.sourcesContent[index],
  };
}

function updateCoverageDecorations(pane: Pane, coverage: CoverageEntry[]) {
  pane.coverageDecorations = pane.editor.deltaDecorations(
    pane.coverageDecorations,
    coverage.map((c) => ({
      range: new monaco.Range(
        c.start.line + 1,
        c.start.column + 1,
        c.end.line + 1,
        c.end.column + 1
      ),
      options: {
        hoverMessage: [{ value: "```" + JSON.stringify(c, null, 2) + "```" }],
        zIndex: 0,
        className: "covered",
        minimap: {
          color: "#00ff00",
          // 1 = inline
          // https://github.com/microsoft/monaco-editor/blob/ca2692a/website/typedoc/monaco.d.ts#L1414
          position: 2,
        },
        overviewRuler: {
          color: "#daead1",
          position: 1,
        },
      },
    }))
  );
}

async function run() {
  const inputData = await getData();
  const start = Date.now();
  const data = await generate(
    inputData.code,
    inputData.map,
    inputData.coverage
  );
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  const c = canvas.getContext("2d")!;

  sizeCanvas(canvas, c);

  const generatedEditor = monaco.editor.create(
    document.getElementById("generated")!,
    {
      value: data.code,
      ...options,
    }
  );

  const originalEditor = monaco.editor.create(
    document.getElementById("original")!,
    {
      // TODO create with no model at all by passing null?
      value: "",
      ...options,
    }
  );

  generatedEditor.onDidLayoutChange((e) => {
    sizeCanvas(canvas, c);
  });

  const fileLines = new Map<number, number[]>();
  let previousSource = -1;
  for (let i = 0; i < data.map.mappings.length; i += 6) {
    const source = data.map.mappings[i + 2];
    if (source !== previousSource) {
      const line = data.map.mappings[i];
      let files = fileLines.get(line);
      if (!files) {
        files = [];
        fileLines.set(line, files);
      }
      if (source !== -1) {
        files.push(source);
      }
    }
    previousSource = source;
  }

  generatedEditor.changeViewZones(function (changeAccessor) {
    for (const [line, sources] of fileLines) {
      const domNode = document.createElement("div");
      const mappedSources = sources.filter((source) => source !== -1);
      domNode.textContent =
        mappedSources.length > 0
          ? mappedSources.map((n) => data.sourceNames[n]).join(", ")
          : "(unmapped)";
      domNode.className = "filename-line";
      changeAccessor.addZone({
        afterLineNumber: line,
        heightInLines: 1,
        domNode: domNode,
      });
    }
  });

  const original: Pane = {
    isGenerated: false,
    editor: originalEditor,
    model: originalEditor.getModel()!,
    domNode: originalEditor.getDomNode()!,
    statusDomNode: document.getElementById("original-status")!,
    hoverDecorations: [],
    coverageDecorations: [],
    data: undefined,
  };
  const generated: Pane = {
    isGenerated: true,
    editor: generatedEditor,
    model: generatedEditor.getModel()!,
    domNode: generatedEditor.getDomNode()!,
    statusDomNode: document.getElementById("generated-status")!,
    hoverDecorations: [],
    coverageDecorations: [],
    data: {
      mappings: data.map.mappings,
      offsetMappings: data.map.mappings,
      value: data.code,
    },
  };

  if (data.coverage) {
    updateCoverageDecorations(generated, data.coverage.coverage);
  }

  let prevSourceIndex: number | undefined;
  function updateOriginal(index: number) {
    if (index !== prevSourceIndex) {
      original.data = getOriginal(data, index);
      original.model.setValue(original?.data?.value ?? "");
      if (data.coverage) {
        const coverage = makeOriginalCoverage(
          data.coverage,
          original.data!.mappings
        );
        updateCoverageDecorations(original, coverage);
      }
      prevSourceIndex = index;
    }
  }

  function hover(e: MouseEvent, pane: Pane) {
    c.clearRect(0, 0, canvas.width, canvas.height);

    generated.statusDomNode.innerHTML = "&nbsp;";
    original.statusDomNode.innerHTML = "&nbsp;";
    original.editor.deltaDecorations(original.hoverDecorations, []);
    generated.editor.deltaDecorations(generated.hoverDecorations, []);

    const target = pane.editor.getTargetAtClientPoint(e.clientX, e.clientY);
    // over text
    // https://github.com/microsoft/monaco-editor/blob/ca2692a/website/typedoc/monaco.d.ts#L4731
    if (target?.type !== 6) {
      return;
    }

    const paneData = pane.data;

    if (!paneData) {
      return;
    }

    const hovered = getHovered(
      paneData.offsetMappings,
      pane.model,
      target.position
    );

    pane.statusDomNode.innerText = `Ln ${hovered.line + 1} Col ${
      hovered.column + 1
    }`;

    const { range, mapping: hoveredMapping } = hovered;

    if (!range) {
      return;
    }

    const generatedLine = paneData.mappings[hoveredMapping];
    const generatedColumn = paneData.mappings[hoveredMapping + 1];
    const originalSource = paneData.mappings[hoveredMapping + 2];
    const originalLine = paneData.mappings[hoveredMapping + 3];
    const originalColumn = paneData.mappings[hoveredMapping + 4];

    updateOriginal(originalSource);

    const otherPane = pane.isGenerated ? original : generated;
    const otherLine = pane.isGenerated ? originalLine : generatedLine;
    const otherColumn = pane.isGenerated ? originalColumn : generatedColumn;
    const hoveredColumn = pane.isGenerated ? generatedColumn : originalColumn;

    const otherPaneData = otherPane.data;

    if (!otherPaneData) {
      return;
    }

    original.statusDomNode.innerText = `Ln ${originalLine + 1} Col ${
      originalColumn + 1
    } (${data.sourceNames[originalSource]})`;

    const otherMapping = findMapping(
      otherPaneData.offsetMappings,
      otherLine,
      otherColumn
    );
    const otherRange = rangeOfMapping(
      otherPaneData.offsetMappings,
      otherMapping,
      otherLine,
      otherPane.model.getLineLength(otherLine + 1)
    );
    if (!otherRange) {
      return;
    }

    otherPane.hoverDecorations = otherPane.editor.deltaDecorations(
      otherPane.hoverDecorations,
      [
        {
          range: new monaco.Range(
            otherLine + 1,
            otherColumn + 1,
            otherLine + 1,
            otherRange.endColumn + 1
          ),
          options: { className: "hovered", zIndex: 1 },
        },
      ]
    );
    pane.hoverDecorations = pane.editor.deltaDecorations(
      pane.hoverDecorations,
      [
        {
          range: new monaco.Range(
            hovered.line + 1,
            hoveredColumn + 1,
            hovered.line + 1,
            hovered.range.endColumn + 1
          ),
          options: {
            className: "hovered",
            zIndex: 100,
          },
        },
      ]
    );

    const hoveredRect = getRect(
      pane.editor,
      hovered.line,
      hoveredColumn,
      range.endColumn
    );
    const otherRect = getRect(
      otherPane.editor,
      otherLine,
      otherColumn,
      otherRange.endColumn
    );

    if (!(hoveredRect && otherRect)) {
      return;
    }

    const canvasPosition = canvas.getBoundingClientRect();

    const hoveredDomNodePostion = pane.domNode.getBoundingClientRect();
    const otherDomNodePostion = otherPane.domNode.getBoundingClientRect();

    if (pane.isGenerated) {
      render(
        c,
        canvasPosition,
        hoveredDomNodePostion,
        hoveredRect,
        otherDomNodePostion,
        otherRect
      );
    } else {
      render(
        c,
        canvasPosition,
        otherDomNodePostion,
        otherRect,
        hoveredDomNodePostion,
        hoveredRect
      );
    }

    otherPane.editor.revealPosition(
      { column: otherRange.startColumn, lineNumber: otherLine + 1 },
      1
    );
  }
  // we're using our own event listener because we want to avoid the Monaco
  // delayed event listener
  generated.domNode.addEventListener("mousemove", (e) => {
    hover(e, generated);
  });

  original.domNode.addEventListener("mousemove", (e) => {
    hover(e, original);
  });
}

run().catch(console.error);
