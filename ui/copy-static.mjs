// Copies the non-TypeScript parts of the interface into dist/.
//
// `tsc` only emits JavaScript, and the interface is three files plus markup.
// A bundler would be a dependency and a build graph for no gain at this size.
import { copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
for (const file of ["index.html", "login.html", "style.css", "studio.css"]) {
  copyFileSync(join(here, "src", file), join(here, "dist", file));
}
copyFileSync(
  join(here, "node_modules", "@phosphor-icons", "web", "src", "regular", "style.css"),
  join(here, "dist", "phosphor.css"),
);
copyFileSync(
  join(here, "node_modules", "@phosphor-icons", "web", "src", "regular", "Phosphor.woff2"),
  join(here, "dist", "Phosphor.woff2"),
);
console.log("copied interface styles and the pinned Phosphor regular icon font");
