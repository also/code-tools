import { Environment } from "monaco-editor";

declare global {
  interface Window {
    MonacoEnvironment: Environment;
  }
}

// https://github.com/microsoft/monaco-editor/blob/ca2692a0dc1ef3ca0e0f8a76fce5ae60b10a1ebe/samples/browser-esm-esbuild/index.js
/*
The MIT License (MIT)

Copyright (c) 2016 - present Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === "json") {
      return "./dist/vs/language/json/json.worker.js";
    }
    if (label === "css" || label === "scss" || label === "less") {
      return "./dist/vs/language/css/css.worker.js";
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return "./dist/vs/language/html/html.worker.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./dist/vs/language/typescript/ts.worker.js";
    }
    return "./dist/vs/editor/editor.worker.js";
  },
};
