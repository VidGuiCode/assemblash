// Copies static interface files and bundled font assets into dist/.
import { copyFileSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
for (const file of ["index.html", "login.html", "studio.css"]) {
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

cpSync(join(here, "src", "catalogue-specimens"), join(here, "dist", "catalogue-specimens"), { recursive: true });
