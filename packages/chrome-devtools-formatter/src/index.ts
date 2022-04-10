import * as FormatterActions from "./vendor/entrypoints/formatter_worker/FormatterActions.js";
import {
  formatScriptContent,
  positionToLocation,
} from "./vendor/models/formatter/ScriptFormatter.js";

// TODO is there any point in keeping the separate module around?
import "./formatter.js";

export async function formatWithMap(
  mimeType: string,
  source: string,
  indent: string
) {
  const formatted = await formatScriptContent(mimeType, source, indent);

  const fsm = formatted.formattedMapping;

  const mapping = new Mapper(
    source,
    formatted.formattedContent,
    fsm.originalLineEndings,
    fsm.formattedLineEndings,
    fsm.mapping
  );

  return { mapping, content: formatted.formattedContent };
}

export class Mapper {
  constructor(
    public original: string,
    public formatted: string,
    public originalLineEndings: number[],
    public formattedLineEndings: number[],
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
        generated: {
          line: generated[0],
          column: generated[1],
          offset: this.mapping.formatted[i],
        },
        original: {
          line: original[0],
          column: original[1],
          offset: this.mapping.original[i],
        },
      };
    }
  }

  *iterateRanges() {
    const iterator = this.iterateMappings();
    const previous = iterator.next();
    if (previous.done) {
      return;
    }
    for (const next of iterator) {
      yield {
        generated: {
          start: previous.value.generated,
          end: next.generated,
        },
        original: {
          start: previous.value.original,
          end: next.original,
        },
      };
      previous.value = next;
    }

    const formattedLine = this.formattedLineEndings.length - 1;
    const originalLine = this.originalLineEndings.length - 1;

    yield {
      generated: {
        start: previous.value.generated,
        end: {
          line: formattedLine,
          column:
            this.formattedLineEndings[formattedLine] -
            (this.formattedLineEndings[formattedLine - 1] ?? 0),
          offset: this.formatted.length,
        },
      },
      original: {
        start: previous.value.original,
        end: {
          line: originalLine,
          column:
            this.originalLineEndings[originalLine] -
            (this.originalLineEndings[originalLine - 1] ?? 0),
          offset: this.original.length,
        },
      },
    };
  }
}
