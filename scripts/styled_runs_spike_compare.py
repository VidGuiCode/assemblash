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
    'gradient_resume_long', 'gradient_resume_metrics', 'gradient_resume', 'gradient_multiline', 'gradient_reference', 'arabic_spacing_positive', 'arabic_spacing_negative',
    'latin_spacing_negative', 'final_spacing_unused', 'cursive_spacing_unused', 'natural_zero_mark',
    'regular', 'bold', 'italic', 'split_word', 'paint_unsplit', 'paint_split', 'same_split',
    'arabic_unsplit', 'arabic_split', 'arabic_colour', 'bidi', 'combining',
    'long_word', 'mixed_metrics', 'paragraphs', 'justify', 'single_word',
    'middle', 'bottom', 'center', 'right', 'spacing', 'gradient', 'empty',
    'empty_paragraphs', 'overflow',
    'plain_gap', 'styled_gap', 'preserved_spaces', 'styled_gap_wrap',
    'whitespace_paragraphs', 'ligature_weight', 'ligature_size',
    'ligature_italic', 'ligature_spacing', 'marks_same_style', 'arabic_ligature_size',
    'space_mark_same_style', 'space_mark_wrap', 'nospace_mixed_script', 'nospace_arabic_paints',
}
DIAGNOSTIC_CASES = {'layout_' + name for name in
                    ('paint_split', 'combining', 'ligature_weight', 'ligature_size',
                     'ligature_italic', 'ligature_spacing')}
BOUNDARY_REFUSALS = DIAGNOSTIC_CASES | {
    'marks_size', 'marks_weight', 'marks_family', 'marks_spacing',
    'marks_paint', 'marks_italic', 'ligature_family', 'ligature_paint',
    'ligature_gradient', 'ligature_no_fill', 'bidi_ligature_weight',
    'space_mark_paint', 'space_mark_size', 'space_mark_balanced_paint',
}
EMPTY_LAYOUTS = {'layout_empty', 'layout_empty_paragraphs', 'layout_whitespace_paragraphs'}
SPACING_REFUSALS = {'exact_zero': (0, 0, 0), 'negative': (0, 0, 0), 'indexed_extreme': (1, 1, 2)}
TRUSTED_REFERENCES = {'layout_gradient_resume_long', 'layout_gradient_resume_metrics', 'layout_gradient_resume', 'layout_gradient_multiline', 'layout_gradient_reference', 'layout_arabic_spacing_positive',
                      'layout_arabic_spacing_negative', 'layout_latin_spacing_negative',
                      'layout_final_spacing_unused', 'layout_cursive_spacing_unused', 'layout_regular', 'layout_bold', 'layout_arabic_unsplit', 'layout_marks_same_style'}
BASELINE_REVISION = '61cda0c6f06fbfa1ce0fba124aa54ea3b6f91782'
BASELINE_PATH = 'crates/assemblash-renderer/tests/gate/goldens.json'
GOLDENS = (Path(__file__).resolve().parents[1] / 'crates' /
           'assemblash-renderer' / 'tests' / 'gate' / 'goldens.json')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def file_hash(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def expected_goldens():
    current = json.loads(GOLDENS.read_text(encoding='utf-8'))
    repository = Path(__file__).resolve().parents[1]
    released = json.loads(subprocess.check_output(
        ['git', 'show', f'{BASELINE_REVISION}:{BASELINE_PATH}'], cwd=repository))
    require(len(released) == 145, 'the released baseline must contain 145 entries')
    require(all(current.get(key) == value for key, value in released.items()),
            'committed goldens changed a released 1.11.0 entry')
    return current


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
        accepted = name not in DIAGNOSTIC_CASES
        require(case['accepted'] is accepted and case['stylesVerified'] is accepted and
                case['sourceIndexedStylesVerified'] is accepted and
                case['diagnosticOnly'] is (not accepted), f'{name}: incorrect acceptance status')
        require(case['textPreserved'] is True, f'{name}: source text or whitespace changed')
        if accepted:
            require(bool(case['glyphs']) or name in EMPTY_LAYOUTS,
                    f'{name}: visible accepted control has no glyph evidence')
            for glyph in case['glyphs']:
                require(type(glyph.get('sourceCharacterIndex')) is int and glyph['sourceCharacterIndex'] >= 0 and
                        type(glyph.get('sourceByteIndex')) is int and glyph['sourceByteIndex'] >= glyph['sourceCharacterIndex'],
                        f'{name}: source-indexed glyph correspondence missing')
                require(isinstance(glyph.get('fontSha256'), str) and glyph['fontSha256'].startswith('sha256:') and
                        type(glyph.get('fontFaceIndex')) is int and glyph['fontFaceIndex'] >= 0 and
                        glyph.get('variationCoordinates') == [], f'{name}: pinned outline font provenance missing')
        require(file_hash(directory / 'layout' / f'{name}.svg') == case['svg'], f'{name}: SVG hash mismatch')
        require(set(case['hashes']) == {'1', '2'}, f'{name}: scale missing')
        for scale, result in case['hashes'].items():
            require(file_hash(directory / 'layout' / f'{name}-{scale}.png') == result['png'], f'{name}: PNG hash mismatch')
    references = report['styledLayout']['trustedReferences']
    require(set(references) == TRUSTED_REFERENCES, 'trusted single-face reference coverage missing')
    for name, reference in references.items():
        require(reference['glyphs'] and reference['placementTolerancePx'] == 0.0001,
                f'{name}: trusted glyph placement proof missing')
        require(file_hash(directory / 'layout' / f'{name}-reference.svg') == reference['svg'], f'{name}: reference SVG hash mismatch')
        require(set(reference['scales']) == {'1', '2'}, f'{name}: reference scale missing')
        for scale, result in reference['scales'].items():
            require(file_hash(directory / 'layout' / f'{name}-reference-{scale}.png') == result['png'], f'{name}: reference PNG hash mismatch')
            require(0 <= result['maximumChannelDifference'] <= 16 and
                    0 <= result['totalChannelDifference'] <= 96 and
                    0 <= result['changedPixels'] <= 2,
                    f'{name}: trusted raster differs')
        strokes = reference['strokeComparisons']
        require(set(strokes) == {'stroke', 'stroke-first'}, f'{name}: stroke reference coverage missing')
        for mode, stroke in strokes.items():
            require(file_hash(directory / 'layout' / f'{name}-{mode}.svg') == stroke['svg'] and
                    file_hash(directory / 'layout' / f'{name}-{mode}-reference.svg') == stroke['referenceSvg'],
                    f'{name}: stroke SVG hash mismatch')
            require(set(stroke['scales']) == {'1', '2'}, f'{name}: stroke scale missing')
            for scale, result in stroke['scales'].items():
                require(file_hash(directory / 'layout' / f'{name}-{mode}-{scale}.png') == result['png'] and
                        file_hash(directory / 'layout' / f'{name}-{mode}-reference-{scale}.png') == result['referencePng'],
                        f'{name}: stroke PNG hash mismatch')
                require(0 <= result['maximumChannelDifference'] <= 16 and
                        0 <= result['totalChannelDifference'] <= 96 and
                        0 <= result['changedPixels'] <= 2, f'{name}: trusted stroke raster differs')
    require(report['styledLayout']['mixedFontBodyAndDotVerified'] is True, 'mixed-font body regression unproved')
    require(any(glyph.get('sourceXAdvance') == 0 and isinstance(glyph.get('outlinePathSha256'), str)
                for glyph in cases['layout_natural_zero_mark']['glyphs']),
            'naturally zero-advance mark outline missing')
    for glyph_id in (8, 44):
        require(any(glyph['id'] == glyph_id and glyph['family'] == 'Noto Sans Arabic' and
                    glyph['sourceCharacterIndex'] == 7 and glyph['sourceByteIndex'] == 10 and
                    isinstance(glyph.get('outlinePathSha256'), str)
                    for glyph in cases['layout_bidi']['glyphs']), 'mixed-font Arabic body or dot outline missing')


def compare(root, revision):
    expected = {'styled-runs-spike-' + target for target in TARGETS}
    directories = sorted(path for path in root.iterdir() if path.is_dir())
    require({path.name for path in directories} == expected, 'all six exact target names are required')
    expected_baseline = expected_goldens()
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
        require(report['probeVersion'] == 7, 'wrong probe version')
        require(report['italicFaceAvailable'] is True and report['missingItalicDetected'] is True, 'italic coverage missing')
        require(set(report['sameStyleComparisons']) == {'latin', 'arabic', 'marks', 'bidi'}, 'shaping comparisons missing')
        require(all(value['positionedGlyphsEqual'] is True and value['pixelsEqual'] is True
                    for value in report['sameStyleComparisons'].values()), 'shaping control failed')
        require(report['arabicColourBoundaryGeometryEqual'] is True, 'Arabic paint boundary changes geometry')
        require(all(report['storage'][key] is True for key in
                    ('arbitraryRunsPreserved', 'loadValidationPassed', 'readOnlySessionPassed', 'saveBytesEqual')),
                'stored raw runs changed')
        require(len(report['styledLayout']['missingFontRefusals']) == 3, 'font refusals missing')
        require(report['styledLayout']['readyForProductIntegration'] is True,
                'the renderer correctness gate remains blocked')
        require(report['styledLayout']['boundaryPolicy'] == 'effective styles must agree within one shaping cluster',
                'wrong shaping-cluster policy')
        refusals = report['styledLayout']['boundaryRefusals']
        require(set(refusals) == BOUNDARY_REFUSALS, 'cluster-boundary refusal coverage missing')
        for name, result in refusals.items():
            require(type(result['runIndex']) is int and result['runIndex'] > 0 and
                    type(result['characterIndex']) is int and result['characterIndex'] > 0 and
                    type(result['byteIndex']) is int and result['byteIndex'] >= result['characterIndex'] and
                    result['reason'] == 'effective styles differ inside one shaping cluster',
                    f'{name}: typed boundary index or reason missing')
        spacing = report['styledLayout']['spacingRefusals']
        require(set(spacing) == set(SPACING_REFUSALS), 'spacing refusal coverage missing')
        for name, indices in SPACING_REFUSALS.items():
            result = spacing[name]
            require(tuple(result[key] for key in ('runIndex', 'characterIndex', 'byteIndex')) == indices and
                    result['reason'] == 'applied letter spacing makes cluster advance nonpositive',
                    f'{name}: typed spacing index or reason missing')
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
    print(f'PASS: {count} native reports are identical; released 145 goldens remain unchanged; supported styles and typed cluster refusals pass.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
