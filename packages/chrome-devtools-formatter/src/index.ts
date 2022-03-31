import * as FormatterActions from "./vendor/entrypoints/formatter_worker/FormatterActions.js";
import {
  formatScriptContent,
  positionToLocation,
} from "./vendor/models/formatter/ScriptFormatter.js";

export async function formatWithMap(source: string, indent: string) {
  const formatted = await formatScriptContent(
    "text/javascript",
    source,
    indent
  );

  const fsm = formatted.formattedMapping;

  const mapping = new Mapper(
    fsm.originalLineEndings,
    fsm.formattedLineEndings,
    fsm.mapping
  );

  return { mapping, content: formatted.formattedContent };
}

export class Mapper {
  constructor(
    private originalLineEndings: number[],
    private formattedLineEndings: number[],
    public mapping: FormatterActions.FormatMapping
  ) {}

  positionToLocationOriginal(originalPosition: number) {
    return positionToLocation(this.originalLineEndings, originalPosition);
  }

  positionToLocationFormatted(formattedPosition: number) {
    return positionToLocation(this.formattedLineEndings, formattedPosition);
  }

  *iterateMappings() {
    for (let i = 0; i < this.mapping.formatted.length; i++) {
      const generated = this.positionToLocationFormatted(
        this.mapping.formatted[i]
      );
      const original = this.positionToLocationOriginal(
        this.mapping.original[i]
      );
      yield {
        generated: { line: generated[0], column: generated[1] },
        original: { line: original[0], column: original[1] },
      };
    }
  }
}
