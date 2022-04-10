import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";
import { coverageOnly, getMimeType } from "./generate.js";
import { showEditor } from "./mapped-editor.js";

const fileInput = document.getElementById("file") as HTMLInputElement;
fileInput.addEventListener("change", function () {
  const files = this.files;

  if (files && files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const contents = reader.result as string;
      const coverage = JSON.parse(contents) as ChromeBasicCoverage[];
      const coverageFile = coverage[1];
      const data = await coverageOnly(
        getMimeType(coverageFile.url) || "unknown",
        coverageFile.text!,
        coverageFile
      );
      await showEditor(data);
    };
    reader.readAsText(file);
  }
});
