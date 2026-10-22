"""Test comparator refusals with synthetic reports. These are not native proof."""

import copy
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

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
            'probeVersion': 2,
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
            case = {'svg': comparator.file_hash(svg), 'hashes': {}}
            for scale in ('1', '2'):
                png = fixture / 'layout' / f'{name}-{scale}.png'
                png.write_bytes(b'synthetic layout PNG')
                case['hashes'][scale] = {'png': comparator.file_hash(png)}
            report['styledLayout']['cases'][name] = case
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
