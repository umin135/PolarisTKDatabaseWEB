#!/usr/bin/env python3
"""
Extract localization key→text from GTB UAsset files into a flat JSON dict.

Usage:
    python scripts/3_extract_localization.py           # English (default)
    python scripts/3_extract_localization.py --lang ko # Korean

Output:
    web/public/data/loc_{lang}.json  →  {"TEXT_UI_000_cmn_hed_hachimaki": "Hachimaki", ...}

Processing order (later files override earlier keys):
    1. Non-update GTB files (GTB_Custom_Item, GTB_System, etc.)
    2. GTB_Upd_* files in ascending version order (001 → 013 → 200 → 301 → RS01)
"""
import sys
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / '_extract'))
import gtb_extract


def sort_key(path: Path) -> tuple:
    """Non-Upd files first (0), then Upd files by numeric version, RS* last."""
    m = re.match(r'GTB_Upd_([A-Z0-9]+)_', path.stem)
    if not m:
        return (0, 0, path.stem)
    ver_str = m.group(1)
    try:
        ver = int(ver_str)
    except ValueError:
        ver = 99999  # RS01 etc. → after all numeric versions
    return (1, ver, path.stem)


def extract_lang(lang: str) -> dict[str, str]:
    loc_dir = ROOT / '_extract' / 'Localize' / lang
    if not loc_dir.exists():
        sys.exit(f'[!] Not found: {loc_dir}')

    uassets = sorted(loc_dir.glob('*.uasset'), key=sort_key)
    merged: dict[str, str] = {}

    for path in uassets:
        entries = gtb_extract.extract(path)
        if not entries:
            print(f'[-] No GTB data: {path.name}', file=sys.stderr)
            continue
        print(f'[+] {path.name}: {len(entries)} entries', file=sys.stderr)
        for key, val in entries:
            merged[key] = val

    return merged


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--lang', default='en',
        help='Language code matching _extract/Localize/{lang}/ (default: en)')
    args = parser.parse_args()

    print(f'[*] Extracting: {args.lang}', file=sys.stderr)
    loc = extract_lang(args.lang)
    print(f'[*] Total keys: {len(loc)}', file=sys.stderr)

    out = ROOT / 'web' / 'public' / 'data' / f'loc_{args.lang}.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(loc, f, ensure_ascii=False, separators=(',', ':'))
    print(f'[+] Written: {out}', file=sys.stderr)


if __name__ == '__main__':
    main()
