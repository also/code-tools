import { FormattedContentBuilder } from "./vendor/entrypoints/formatter_worker/FormattedContentBuilder.js";
import { JavaScriptFormatter } from "./vendor/entrypoints/formatter_worker/JavaScriptFormatter.js";
import * as Platform from "./vendor/core/platform/platform.js";

export function formatterWorkerPool() {
  const format = poolFormat;
  return {
    format,
  };
}

function poolFormat(mimeType: string, text: string, indent: string) {
  const builder = new FormattedContentBuilder(indent);
  const lineEndings = Platform.StringUtilities.findLineEndingIndexes(text);
  const formatter = new JavaScriptFormatter(builder);
  formatter.format(text, lineEndings, 0, text.length);

  const result = { mapping: builder.mapping, content: builder.content() };

  return result;
}
