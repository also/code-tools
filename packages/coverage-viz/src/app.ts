import { ChromeBasicCoverage } from "@also/mapped-coverage/lib/types";
import { coverageOnly, getMimeType } from "./generate.js";
import { showEditor } from "./mapped-editor.js";
import "./simple-app.css";

const div = document.getElementById("initial-ui")!;
const fileInput = document.getElementById("file") as HTMLInputElement;
fileInput.addEventListener("change", function () {
  const files = this.files;

  if (files && files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result as string;
      const coverage = JSON.parse(contents) as ChromeBasicCoverage[];
      const select = document.createElement("select");
      select.addEventListener("change", async function () {
        const selected = this.value;
        if (selected !== "") {
          div.remove();
          const index = parseInt(selected);
          const coverageFile = coverage[index];
          const data = await coverageOnly(
            getMimeType(coverageFile.url),
            coverageFile.text!,
            coverageFile
          );
          await showEditor(data);
        }
      });

      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Select a file";
      select.appendChild(option);
      coverage.forEach((c, i) => {
        const option = document.createElement("option");
        option.value = i.toString();
        option.textContent = c.url;
        select.appendChild(option);
      });
      div.appendChild(select);
    };
    reader.readAsText(file);
  }
});
