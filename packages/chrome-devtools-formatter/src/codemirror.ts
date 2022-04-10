import type * as CodeMirrorModule from "codemirror/index"; // eslint-disable-line @typescript-eslint/no-unused-vars

const CodeMirror = (
  typeof navigator === "undefined"
    ? require("codemirror/addon/runmode/runmode.node.js")
    : (require("codemirror/addon/runmode/runmode-standalone.js"),
      window.CodeMirror)
) as typeof CodeMirrorModule;

export default CodeMirror;
