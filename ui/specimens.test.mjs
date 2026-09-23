import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const UI = dirname(fileURLToPath(import.meta.url));
const sourceSpecimens = resolve(UI, "src/catalogue-specimens");
const distSpecimens = resolve(UI, "dist/catalogue-specimens");
const fontManifestPath = resolve(UI, "../crates/assemblash-renderer/fonts/manifest.json");

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function specimenPath(root, relativePath) {
  return resolve(root, relativePath.replace(/^\.\//, ""));
}

test("catalogue specimens match pinned font sources and ship outlined SVGs", () => {
  const specimenManifest = JSON.parse(readFileSync(resolve(sourceSpecimens, "manifest.json"), "utf8"));
  const fontManifest = JSON.parse(readFileSync(fontManifestPath, "utf8"));
  const specimenFamilies = Object.entries(specimenManifest.families);
  const expectedFamilies = [
    "Inter", "Roboto", "Open Sans", "Montserrat", "Lora", "Playfair Display", "JetBrains Mono",
  ];

  assert.deepEqual(specimenFamilies.map(([name]) => name).sort(), expectedFamilies.sort());

  for (const [name, specimen] of specimenFamilies) {
    const pinnedFont = fontManifest.families.find((entry) => entry.name === name);
    assert.ok(pinnedFont, `${name}: pinned font is missing`);
    assert.equal(specimen.sourceSha256, pinnedFont.sha256.replace(/^sha256:/, ""),
      `${name}: source hash differs from the pinned font manifest`);

    const sourceSvgPath = specimenPath(sourceSpecimens, specimen.src);
    const distSvgPath = specimenPath(distSpecimens, specimen.src);
    const sourceSvg = readFileSync(sourceSvgPath);
    const distSvg = readFileSync(distSvgPath);
    assert.equal(sha256(sourceSvg), specimen.assetSha256, `${name}: source SVG hash mismatch`);
    assert.equal(sha256(distSvg), specimen.assetSha256, `${name}: dist SVG hash mismatch`);

    for (const [label, svgBytes] of [["source", sourceSvg], ["dist", distSvg]]) {
      const svg = svgBytes.toString("utf8");
      assert.match(svg, /<path\b[^>]*\bd=/, `${name}: ${label} SVG has no outlined glyph paths`);
      assert.doesNotMatch(svg, /<text\b|font-family\s*=/i,
        `${name}: ${label} SVG uses font-family text instead of outlines`);
    }

    const sourceLicense = specimenPath(sourceSpecimens, specimen.licenseFile);
    const distLicense = specimenPath(distSpecimens, specimen.licenseFile);
    assert.ok(existsSync(sourceLicense), `${name}: source license file is missing`);
    assert.ok(existsSync(distLicense), `${name}: dist license file is missing`);
  }
});
