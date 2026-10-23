# Styled runs renderer experiment

Run this isolated experiment with pinned repository fonts:

```text
cargo run --locked -p assemblash-renderer --example styled_runs_spike -- OUTPUT_DIR
```

Use a new output directory for each run.
The experiment does not change the public document model.

The approved policy requires compatible effective styles within one shaping cluster.
The experiment rejects incompatible cluster styles before it accepts a render.
Each typed refusal identifies the run, Unicode scalar index, and reason.
It also identifies the UTF-8 byte index in the original text.
The indices start at zero.
The policy applies to family, size, weight, italic style, letter spacing, and paint.
Equal effective styles can cross a cluster boundary without changing shaping.

Layout preserves original space characters and their styles.
It keeps spaces at paragraph edges and line breaks.
Whitespace-only fragments use the selected face's advance values.
Rendering uses the original text with normal font features.
Boundary checks shape complete paragraphs with the renderer's bidirectional run segmentation.
The checks include whitespace and use each loaded face's shaping clusters.
Wrapping keeps each shaping cluster intact.
An ordered glyph check verifies requested styles against the original text indices.
Repeated characters cannot hide swapped styles through aggregate counts.

The accepted candidate uses HarfRust clusters and pinned skrifa outlines.
It retains empty-text glyphs and zero-advance marks.
It emits outlines in pixel coordinates with shared paint-span gradient coordinates.
Gradients use one advance and font-metric bounding box for the complete text.
The box includes all lines, spaces, and paints. A solid override does not restart the gradient.
Trusted controls use one text element with positioned line spans, as the product renderer does.
They compare glyphs, placement, and pixels with single-face usvg rendering.
Stroke controls compare both paint orders at each scale.
Long gradient overrides and different line metrics have separate regression controls.
The candidate accumulates relative cluster positions and font-unit glyph advances.
It transforms unscaled contours with the renderer's transform order.
The placement tolerance is 0.0001 pixels for cross-backend float rounding.
The maximum channel difference is 16 for antialiasing coverage quantization.
At most two pixels can change. Total absolute channel error must not exceed 96.
Native candidate reports still require exact byte equality.
The pinned fixtures use static fonts. Variable fonts need separate optical-size verification during product integration.

Letter spacing follows the renderer's connected-script exclusions.
The last cluster does not use letter spacing.
Applied spacing must leave a positive cluster advance.
A typed geometry refusal identifies the original run, scalar index, and UTF-8 byte index.
Natural zero-advance marks remain present when no invalid spacing applies.
Controls include Arabic spacing, safe negative Latin spacing, exact-zero refusal, and negative-advance refusal.

The report keeps historical unsafe controls for comparison.
These controls have `diagnosticOnly: true` and `accepted: false`.
Their images do not prove supported rendering.
The report also includes accepted controls and typed refusal checks.

`readyForProductIntegration` records the experiment's local correctness result under this policy.
It does not prove public model integration or native output identity.
The native workflow must pass on all six targets before product integration starts.
Its comparator verifies the released 1.11.0 goldens and all current golden entries.
