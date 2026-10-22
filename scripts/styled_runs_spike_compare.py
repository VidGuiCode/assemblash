"""Require identical styled-run reports and unchanged goldens on all six targets."""

import hashlib
import json
from pathlib import Path
import subprocess
import sys

TARGETS = {'linux-x86_64', 'linux-aarch64', 'windows-x86_64',
           'windows-aarch64', 'macos-x86_64', 'macos-aarch64'}
HOSTS = {
    'linux-x86_64': 'x86_64-unknown-linux-gnu',
    'linux-aarch64': 'aarch64-unknown-linux-gnu',
    'windows-x86_64': 'x86_64-pc-windows-msvc',
    'windows-aarch64': 'aarch64-pc-windows-msvc',
    'macos-x86_64': 'x86_64-apple-darwin',
    'macos-aarch64': 'aarch64-apple-darwin',
}
SHAPING_CASES = {
    'latin_unsplit', 'latin_split', 'arabic_unsplit', 'arabic_split',
    'marks_unsplit', 'marks_split', 'bidi_unsplit', 'bidi_split',
    'colour_boundary', 'mixed_weight', 'mixed_italic', 'mixed_size_family',
    'letter_spacing', 'gradient_runs', 'explicit_no_fill', 'empty_run',
    'empty_text', 'manual_paragraphs',
}
LAYOUT_CASES = {
    'regular', 'bold', 'italic', 'split_word', 'paint_unsplit', 'paint_split', 'same_split',
    'arabic_unsplit', 'arabic_split', 'arabic_colour', 'bidi', 'combining',
    'long_word', 'mixed_metrics', 'paragraphs', 'justify', 'single_word',
    'middle', 'bottom', 'center', 'right', 'spacing', 'gradient', 'empty',
    'empty_paragraphs', 'overflow',
}
GOLDENS = (Path(__file__).resolve().parents[1] / 'crates' /
           'assemblash-renderer' / 'tests' / 'gate' / 'goldens.json')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def file_hash(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def verify_images(directory, report):
    require(set(report['renders']) == SHAPING_CASES, 'incomplete shaping controls')
    for name, case in report['renders'].items():
        require(file_hash(directory / f'{name}.svg') == case['svgSha256'], f'{name}: SVG hash mismatch')
        require(set(case['scales']) == {'1', '2'}, f'{name}: scale missing')
        for scale, result in case['scales'].items():
            require(file_hash(directory / f'{name}-{scale}.png') == result['pngSha256'], f'{name}: PNG hash mismatch')
    cases = report['styledLayout']['cases']
    require(set(cases) == {'layout_' + name for name in LAYOUT_CASES}, 'incomplete layout cases')
    for name, case in cases.items():
        require(file_hash(directory / 'layout' / f'{name}.svg') == case['svg'], f'{name}: SVG hash mismatch')
        require(set(case['hashes']) == {'1', '2'}, f'{name}: scale missing')
        for scale, result in case['hashes'].items():
            require(file_hash(directory / 'layout' / f'{name}-{scale}.png') == result['png'], f'{name}: PNG hash mismatch')


def compare(root, revision):
    expected = {'styled-runs-spike-' + target for target in TARGETS}
    directories = sorted(path for path in root.iterdir() if path.is_dir())
    require({path.name for path in directories} == expected, 'all six exact target names are required')
    expected_baseline = json.loads(GOLDENS.read_text(encoding='utf-8'))
    require(len(expected_baseline) == 145, 'the committed baseline must contain 145 entries')
    reference = None
    reference_baseline = None
    for directory in directories:
        target = directory.name.removeprefix('styled-runs-spike-')
        toolchain = dict(line.split(': ', 1) for line in
                         (directory / 'toolchain.txt').read_text(encoding='utf-8').splitlines()
                         if ': ' in line)
        require(toolchain.get('host') == HOSTS[target], f'{directory.name}: wrong native Rust host')
        require(toolchain.get('release') == '1.92.0', f'{directory.name}: wrong Rust toolchain')
        require((directory / 'source.txt').read_text(encoding='utf-8').strip() == revision, 'wrong source revision')
        encoded = (directory / 'report.json').read_bytes()
        report = json.loads(encoded)
        require(report['probeVersion'] == 2, 'wrong probe version')
        require(report['italicFaceAvailable'] is True and report['missingItalicDetected'] is True, 'italic coverage missing')
        require(set(report['sameStyleComparisons']) == {'latin', 'arabic', 'marks', 'bidi'}, 'shaping comparisons missing')
        require(all(value['positionedGlyphsEqual'] is True and value['pixelsEqual'] is True
                    for value in report['sameStyleComparisons'].values()), 'shaping control failed')
        require(report['arabicColourBoundaryGeometryEqual'] is True, 'Arabic paint boundary changes geometry')
        require(all(report['storage'][key] is True for key in
                    ('arbitraryRunsPreserved', 'loadValidationPassed', 'readOnlySessionPassed', 'saveBytesEqual')),
                'stored raw runs changed')
        require(len(report['styledLayout']['missingFontRefusals']) == 3, 'font refusals missing')
        verify_images(directory, report)
        baseline = json.loads((directory / 'baseline-hashes.json').read_text(encoding='utf-8'))
        require(baseline['hashes'] == expected_baseline,
                f'{directory.name}: baseline differs from the committed 1.11.0 goldens')
        if reference is None:
            reference, reference_baseline = encoded, baseline
        else:
            require(encoded == reference, f'{directory.name}: layout, glyphs, pixels, or PNG bytes differ')
            require(baseline == reference_baseline, f'{directory.name}: baseline differs')
    return len(directories)


def main():
    try:
        if len(sys.argv) != 2:
            raise ValueError('usage: styled_runs_spike_compare.py REPORT_DIRECTORY')
        root = Path(sys.argv[1])
        revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
        count = compare(root, revision)
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as error:
        print(f'FAIL: {error}')
        return 1
    print(f'PASS: {count} native reports are identical; 145 baseline entries agree.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
