"""Test comparator refusals with synthetic reports. These are not native proof."""

import copy
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import styled_runs_spike_compare as comparator


class ComparatorTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.revision = subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'], text=True).strip()
        fixture = self.root / 'fixture'
        fixture.mkdir()
        (fixture / 'layout').mkdir()
        report = {
            'probeVersion': 7,
            'italicFaceAvailable': True,
            'missingItalicDetected': True,
            'sameStyleComparisons': {
                name: {'positionedGlyphsEqual': True, 'pixelsEqual': True}
                for name in ('latin', 'arabic', 'marks', 'bidi')
            },
            'arabicColourBoundaryGeometryEqual': True,
            'storage': {key: True for key in (
                'arbitraryRunsPreserved', 'loadValidationPassed',
                'readOnlySessionPassed', 'saveBytesEqual')},
            'renders': {},
            'styledLayout': {
                'cases': {},
                'missingFontRefusals': ['family', 'weight', 'italic'],
                'readyForProductIntegration': True,
                'mixedFontBodyAndDotVerified': True,
                'trustedReferences': {},
                'boundaryPolicy': 'effective styles must agree within one shaping cluster',
                'spacingRefusals': {
                    name: dict(zip(('runIndex', 'characterIndex', 'byteIndex'), indices),
                               reason='applied letter spacing makes cluster advance nonpositive')
                    for name, indices in comparator.SPACING_REFUSALS.items()
                },
                'boundaryRefusals': {
                    name: {'runIndex': 1, 'characterIndex': 2, 'byteIndex': 2,
                           'reason': 'effective styles differ inside one shaping cluster'}
                    for name in comparator.BOUNDARY_REFUSALS
                },
            },
        }
        for name in comparator.SHAPING_CASES:
            svg = fixture / f'{name}.svg'
            svg.write_bytes(b'synthetic SVG')
            case = {'svgSha256': comparator.file_hash(svg), 'scales': {}}
            for scale in ('1', '2'):
                png = fixture / f'{name}-{scale}.png'
                png.write_bytes(b'synthetic PNG')
                case['scales'][scale] = {'pngSha256': comparator.file_hash(png)}
            report['renders'][name] = case
        for suffix in comparator.LAYOUT_CASES:
            name = 'layout_' + suffix
            svg = fixture / 'layout' / f'{name}.svg'
            svg.write_bytes(b'synthetic layout SVG')
            accepted = name not in comparator.DIAGNOSTIC_CASES
            glyph = {'id': 66, 'text': 'a', 'family': 'Noto Sans',
                     'sourceCharacterIndex': 0, 'sourceByteIndex': 0,
                     'fontSha256': 'sha256:' + '1' * 64, 'fontFaceIndex': 0,
                     'variationCoordinates': [], 'outlinePathSha256': 'sha256:' + '2' * 64}
            glyphs = [] if name in comparator.EMPTY_LAYOUTS else [glyph]
            if name == 'layout_natural_zero_mark':
                glyphs = [dict(glyph, sourceXAdvance=0)]
            if name == 'layout_bidi':
                glyphs = [dict(glyph, id=glyph_id, family='Noto Sans Arabic',
                               sourceCharacterIndex=7, sourceByteIndex=10)
                          for glyph_id in (8, 44)]
            case = {'svg': comparator.file_hash(svg), 'hashes': {},
                    'accepted': accepted, 'diagnosticOnly': not accepted,
                    'textPreserved': True, 'stylesVerified': accepted,
                    'sourceIndexedStylesVerified': accepted, 'glyphs': glyphs}
            for scale in ('1', '2'):
                png = fixture / 'layout' / f'{name}-{scale}.png'
                png.write_bytes(b'synthetic layout PNG')
                case['hashes'][scale] = {'png': comparator.file_hash(png)}
            report['styledLayout']['cases'][name] = case
        for name in comparator.TRUSTED_REFERENCES:
            svg = fixture / 'layout' / f'{name}-reference.svg'
            svg.write_bytes(b'synthetic reference SVG')
            reference = {'svg': comparator.file_hash(svg), 'glyphs': [{'id': 1}],
                         'placementTolerancePx': 0.0001, 'scales': {}}
            for scale in ('1', '2'):
                png = fixture / 'layout' / f'{name}-reference-{scale}.png'
                png.write_bytes(b'synthetic reference PNG')
                reference['scales'][scale] = {
                    'png': comparator.file_hash(png), 'maximumChannelDifference': 0,
                    'totalChannelDifference': 0, 'changedPixels': 0, 'pixelCount': 1000}
            reference['strokeComparisons'] = {}
            for mode in ('stroke', 'stroke-first'):
                stroke = {'scales': {}}
                for suffix, key in (('', 'svg'), ('-reference', 'referenceSvg')):
                    svg = fixture / 'layout' / f'{name}-{mode}{suffix}.svg'
                    svg.write_bytes(b'synthetic stroke SVG')
                    stroke[key] = comparator.file_hash(svg)
                for scale in ('1', '2'):
                    result = {'maximumChannelDifference': 0, 'totalChannelDifference': 0, 'changedPixels': 0}
                    for suffix, key in (('', 'png'), ('-reference', 'referencePng')):
                        png = fixture / 'layout' / f'{name}-{mode}{suffix}-{scale}.png'
                        png.write_bytes(b'synthetic stroke PNG')
                        result[key] = comparator.file_hash(png)
                    stroke['scales'][scale] = result
                reference['strokeComparisons'][mode] = stroke
            report['styledLayout']['trustedReferences'][name] = reference
        self.report = report
        (fixture / 'report.json').write_text(json.dumps(report), encoding='utf-8')
        (fixture / 'source.txt').write_text(self.revision + '\n', encoding='utf-8')
        self.baseline = {'hashes': json.loads(comparator.GOLDENS.read_text(encoding='utf-8'))}
        (fixture / 'baseline-hashes.json').write_text(json.dumps(self.baseline), encoding='utf-8')
        self.directories = []
        for target in sorted(comparator.TARGETS):
            destination = self.root / ('styled-runs-spike-' + target)
            shutil.copytree(fixture, destination)
            (destination / 'toolchain.txt').write_text(
                f'host: {comparator.HOSTS[target]}\nrelease: 1.92.0\n', encoding='utf-8')
            self.directories.append(destination)
        shutil.rmtree(fixture)

    def write_report(self, directory, report):
        (directory / 'report.json').write_text(json.dumps(report), encoding='utf-8')

    def test_complete_matching_reports_pass(self):
        self.assertEqual(comparator.compare(self.root, self.revision), 6)

    def test_missing_target_refuses(self):
        shutil.rmtree(self.directories[0])
        with self.assertRaisesRegex(ValueError, 'six exact target names'):
            comparator.compare(self.root, self.revision)

    def test_wrong_source_refuses(self):
        (self.directories[0] / 'source.txt').write_text('another revision', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'wrong source revision'):
            comparator.compare(self.root, self.revision)

    def test_wrong_native_host_refuses(self):
        (self.directories[0] / 'toolchain.txt').write_text(
            'host: x86_64-pc-windows-msvc\nrelease: 1.92.0\n', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'wrong native Rust host'):
            comparator.compare(self.root, self.revision)

    def test_equal_changed_goldens_refuse(self):
        baseline = copy.deepcopy(self.baseline)
        key = next(iter(baseline['hashes']))
        baseline['hashes'][key] = 'sha256:' + '0' * 64
        for directory in self.directories:
            (directory / 'baseline-hashes.json').write_text(json.dumps(baseline), encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'committed 1.11.0 goldens'):
            comparator.compare(self.root, self.revision)

    def test_committed_legacy_tamper_refuses(self):
        current = copy.deepcopy(self.baseline['hashes'])
        current[next(iter(current))] = 'sha256:' + '0' * 64
        path = self.root / 'goldens.json'
        path.write_text(json.dumps(current), encoding='utf-8')
        with patch.object(comparator, 'GOLDENS', path):
            with self.assertRaisesRegex(ValueError, 'released 1.11.0 entry'):
                comparator.compare(self.root, self.revision)

    def test_appended_goldens_pass_without_changing_legacy(self):
        baseline = copy.deepcopy(self.baseline)
        baseline['hashes']['future-feature.svg'] = 'sha256:' + 'a' * 64
        path = self.root / 'goldens.json'
        path.write_text(json.dumps(baseline['hashes']), encoding='utf-8')
        for directory in self.directories:
            (directory / 'baseline-hashes.json').write_text(json.dumps(baseline), encoding='utf-8')
        with patch.object(comparator, 'GOLDENS', path):
            self.assertEqual(comparator.compare(self.root, self.revision), 6)

    def test_missing_boundary_refusal_refuses(self):
        report = copy.deepcopy(self.report)
        del report['styledLayout']['boundaryRefusals']['marks_size']
        self.write_report(self.directories[0], report)
        with self.assertRaisesRegex(ValueError, 'refusal coverage missing'):
            comparator.compare(self.root, self.revision)

    def test_spacing_refusal_coverage_and_indices_are_required(self):
        for alteration in ('missing', 'wrong_index', 'wrong_reason'):
            with self.subTest(alteration=alteration):
                report = copy.deepcopy(self.report)
                refusals = report['styledLayout']['spacingRefusals']
                if alteration == 'missing':
                    del refusals['exact_zero']
                elif alteration == 'wrong_index':
                    refusals['indexed_extreme']['byteIndex'] = 1
                else:
                    refusals['negative']['reason'] = 'ignored glyph'
                self.write_report(self.directories[0], report)
                with self.assertRaisesRegex(ValueError, 'spacing'):
                    comparator.compare(self.root, self.revision)

    def test_natural_zero_mark_outline_is_required(self):
        report = copy.deepcopy(self.report)
        report['styledLayout']['cases']['layout_natural_zero_mark']['glyphs'][0]['sourceXAdvance'] = 1
        self.write_report(self.directories[0], report)
        with self.assertRaisesRegex(ValueError, 'zero-advance mark outline missing'):
            comparator.compare(self.root, self.revision)

    def test_diagnostic_image_cannot_count_as_acceptance(self):
        report = copy.deepcopy(self.report)
        report['styledLayout']['cases']['layout_paint_split']['accepted'] = True
        self.write_report(self.directories[0], report)
        with self.assertRaisesRegex(ValueError, 'incorrect acceptance status'):
            comparator.compare(self.root, self.revision)

    def test_source_indexed_glyph_proof_is_required(self):
        report = copy.deepcopy(self.report)
        report['styledLayout']['cases']['layout_regular']['glyphs'] = [{'sourceCharacterIndex': 0}]
        self.write_report(self.directories[0], report)
        with self.assertRaisesRegex(ValueError, 'source-indexed glyph correspondence missing'):
            comparator.compare(self.root, self.revision)

    def test_empty_visible_glyph_evidence_refuses(self):
        report = copy.deepcopy(self.report)
        report['styledLayout']['cases']['layout_regular']['glyphs'] = []
        self.write_report(self.directories[0], report)
        with self.assertRaisesRegex(ValueError, 'visible accepted control has no glyph evidence'):
            comparator.compare(self.root, self.revision)

    def test_trusted_raster_budgets_refuse_perturbations(self):
        for key, value in (('maximumChannelDifference', 17), ('changedPixels', 3), ('totalChannelDifference', 97)):
            with self.subTest(key=key):
                report = copy.deepcopy(self.report)
                report['styledLayout']['trustedReferences']['layout_regular']['scales']['1'][key] = value
                self.write_report(self.directories[0], report)
                with self.assertRaisesRegex(ValueError, 'trusted raster differs'):
                    comparator.compare(self.root, self.revision)

    def test_stroke_reference_coverage_and_budgets_are_required(self):
        for alteration in ('missing', 'budget'):
            with self.subTest(alteration=alteration):
                report = copy.deepcopy(self.report)
                strokes = report['styledLayout']['trustedReferences']['layout_gradient_resume_long']['strokeComparisons']
                if alteration == 'missing':
                    del strokes['stroke-first']
                else:
                    strokes['stroke']['scales']['2']['changedPixels'] = 3
                self.write_report(self.directories[0], report)
                with self.assertRaisesRegex(ValueError, 'stroke'):
                    comparator.compare(self.root, self.revision)

    def test_blocked_correctness_gate_refuses(self):
        report = copy.deepcopy(self.report)
        report['styledLayout']['readyForProductIntegration'] = False
        self.write_report(self.directories[0], report)
        with self.assertRaisesRegex(ValueError, 'correctness gate remains blocked'):
            comparator.compare(self.root, self.revision)

    def test_matching_failed_shaping_control_refuses(self):
        report = copy.deepcopy(self.report)
        report['sameStyleComparisons']['marks']['pixelsEqual'] = False
        for directory in self.directories:
            self.write_report(directory, report)
        with self.assertRaisesRegex(ValueError, 'shaping control failed'):
            comparator.compare(self.root, self.revision)

    def test_changed_image_refuses(self):
        (self.directories[0] / 'latin_unsplit-1.png').write_bytes(b'changed image')
        with self.assertRaisesRegex(ValueError, 'PNG hash mismatch'):
            comparator.compare(self.root, self.revision)

    def test_missing_case_and_scale_refuse(self):
        for mutation in ('case', 'scale'):
            with self.subTest(mutation=mutation):
                report = copy.deepcopy(self.report)
                if mutation == 'case':
                    del report['renders']['latin_split']
                else:
                    del report['renders']['latin_split']['scales']['2']
                self.write_report(self.directories[0], report)
                with self.assertRaises(ValueError):
                    comparator.compare(self.root, self.revision)

    def test_report_differences_refuse(self):
        report = copy.deepcopy(self.report)
        report['differentGlyphPositions'] = True
        self.write_report(self.directories[-1], report)
        with self.assertRaisesRegex(ValueError, 'layout, glyphs, pixels, or PNG bytes differ'):
            comparator.compare(self.root, self.revision)

    def test_optimized_python_keeps_refusal_checks(self):
        (self.directories[0] / 'source.txt').write_text('another revision', encoding='utf-8')
        result = subprocess.run(
            [sys.executable, '-O', str(Path(comparator.__file__).resolve()), str(self.root)],
            capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn('wrong source revision', result.stdout)


if __name__ == '__main__':
    unittest.main()
