import { formatOnly, getMimeType } from "../generate.js";
import { showEditor } from "../mapped-editor.js";

async function run() {
  const start = Date.now();
  const data = await formatOnly(
    getMimeType(".html"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("./format.html.txt")
  );
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
