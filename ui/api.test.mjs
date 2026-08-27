import test from "node:test";
import assert from "node:assert/strict";

import { pngUrl } from "./dist/api.js";

test("drag preview URLs keep layer filtering out of the operation API", () => {
  const selected = pngUrl("my project", 7, 1, { only: ["layer_one", "layer_two"] });
  const base = pngUrl("my project", 7, 1, { exclude: ["layer_one"] });

  assert.equal(
    selected,
    "/api/projects/my%20project/preview.png?scale=1&v=7&only=layer_one%2Clayer_two",
  );
  assert.equal(
    base,
    "/api/projects/my%20project/preview.png?scale=1&v=7&exclude=layer_one",
  );
});
