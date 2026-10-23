# Legacy text-run history fixtures

These projects come from the released Windows x86_64 Assemblash 1.11.0 executable.
The executable reports `assemblash 1.11.0`.
Its SHA256 matches the release checksum:

```text
43c2e8b46718caf4fb307b5254e4c95983a3be8f4707bfbc54ae924ac65891de
```

The base procedure uses neutral project paths and text:

```text
assemblash new PROJECT --width 600 --height 400
assemblash add-text PROJECT --text original --font Inter --size 32
```

Set the text layer's raw `runs` in `document.json`. Keep its version unchanged:

```json
[17, null, {"legacy": {"keep": [1, 2, 3]}}]
```

Use the returned layer ID for two writes:

```text
assemblash set PROJECT --layer LAYER_ID --text second
assemblash set PROJECT --layer LAYER_ID --text third
```

Both 1.11.0 writes preserve raw runs. The expected documents record positions 2 and 3.
The `redo-tail` project also executes `assemblash undo PROJECT` with the released executable.
The `slots` project uses released MCP `fill_template` calls for Text and Color slots.
The `batch` project uses released HTTP operation batches with text and color updates.
The `snapshot-covered` project records a hand edit and one more size update with the released executable.

Tests copy these fixtures before use. They check replay, recovery, and read-only file preservation.
Tests inject unsupported semantics markers only into temporary copies.
The original journal entries have no operation-semantics marker.
