import { formatOnly } from "./generate.js";
import { showEditor } from "./mapped-editor.js";

async function run() {
  const start = Date.now();
  const data = await formatOnly(
    "text/html",
    `<!DOCTYPE html><html> <head> <link rel="stylesheet" href="../dist/format-example.css"/> </head> <body> <header>Format Example</header> <script src="../dist/format-example.js" type="module"></script> </body></html>`
  );
  const end = Date.now();
  console.log(`Generated in ${end - start}ms`);

  await showEditor(data);
}

run().catch(console.error);
