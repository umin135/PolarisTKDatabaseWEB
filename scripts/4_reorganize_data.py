#!/usr/bin/env python3
"""
Reorganize web/public/data/ into versioned directory structure.

Usage:
    python scripts/4_reorganize_data.py [--version 3.01.01]

Actions:
    1. Move FBS JSON files  → web/public/data/{version}/fbsdata/
    2. Move loc_*.json      → web/public/data/{version}/localize/
    3. Generate remaining language loc files via 3_extract_localization.py
"""
import sys
import subprocess
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ALL_LANGS = ['ar', 'de', 'en', 'es', 'es-US', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru', 'th', 'zh-CN', 'zh-TW']


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--version', default='3.01.01',
        help='Game version string (default: 3.01.01)')
    args = parser.parse_args()
    ver = args.version

    data_dir = ROOT / 'web' / 'public' / 'data'
    fbs_dir  = data_dir / ver / 'fbsdata'
    loc_dir  = data_dir / ver / 'localize'

    fbs_dir.mkdir(parents=True, exist_ok=True)
    loc_dir.mkdir(parents=True, exist_ok=True)
    print(f'[*] Version: {ver}', file=sys.stderr)

    # Move FBS JSON files (not loc_* and not GameVersions*)
    moved_fbs = 0
    for f in sorted(data_dir.glob('*.json')):
        if f.name.startswith('loc_') or f.name.startswith('GameVersions'):
            continue
        dest = fbs_dir / f.name
        shutil.move(str(f), str(dest))
        print(f'[+] FBS: {f.name} → fbsdata/', file=sys.stderr)
        moved_fbs += 1
    print(f'[*] Moved {moved_fbs} FBS files', file=sys.stderr)

    # Move existing loc_*.json files
    moved_loc = 0
    for f in sorted(data_dir.glob('loc_*.json')):
        dest = loc_dir / f.name
        shutil.move(str(f), str(dest))
        print(f'[+] LOC: {f.name} → localize/', file=sys.stderr)
        moved_loc += 1
    print(f'[*] Moved {moved_loc} existing loc files', file=sys.stderr)

    # Determine which langs still need to be generated
    extract_script = ROOT / 'scripts' / '3_extract_localization.py'
    generated = 0
    for lang in ALL_LANGS:
        out_file = loc_dir / f'loc_{lang}.json'
        if out_file.exists():
            print(f'[=] Already exists: loc_{lang}.json', file=sys.stderr)
            continue
        print(f'[*] Generating: loc_{lang}.json ...', file=sys.stderr)
        result = subprocess.run(
            [sys.executable, str(extract_script), '--lang', lang, '--version', ver],
            capture_output=True, text=True
        )
        sys.stderr.write(result.stderr)
        if result.returncode != 0:
            print(f'[!] Failed: loc_{lang}.json', file=sys.stderr)
            sys.exit(1)
        generated += 1
    print(f'[*] Generated {generated} new loc files', file=sys.stderr)

    # Summary
    fbs_count = len(list(fbs_dir.glob('*.json')))
    loc_count = len(list(loc_dir.glob('*.json')))
    print(f'\n[OK] {fbs_dir.relative_to(ROOT)}: {fbs_count} files', file=sys.stderr)
    print(f'[OK] {loc_dir.relative_to(ROOT)}: {loc_count} files', file=sys.stderr)


if __name__ == '__main__':
    main()
