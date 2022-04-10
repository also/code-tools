import { format } from "./vendor/entrypoints/formatter_worker/FormatterWorker.js";

export function formatterWorkerPool() {
  const format = poolFormat;
  return {
    format,
  };
}

function poolFormat(mimeType: string, text: string, indent: string) {
  return format(mimeType, text, indent);
}
