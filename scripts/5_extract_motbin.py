#!/usr/bin/env python3
"""
5_extract_motbin.py

Parse extracted mothead/bin/*.motbin files and write one JSON per character
containing fighter_id and the moves array (name/anim hashes, offsets, lengths,
and anim_key from the sibling .anmbin bodyKeys list).

Usage:
  python scripts/5_extract_motbin.py
  python scripts/5_extract_motbin.py --version 3.02.01
  python scripts/5_extract_motbin.py --input extracted/3.02.01/mothead/bin --output web/public/data/3.02.01/motbin

입출력 기본 경로는 --version 으로 결정됩니다:
  입력 : extracted/{version}/mothead/bin/*.motbin
  출력 : web/public/data/{version}/motbin/{stem}.json
  이름 : _extract/name_hash.json (버전 공용)
"""

from __future__ import annotations

import argparse
import json
import struct
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

HEADER_SIZE = 0x318
MOVE_SIZE = 0x448

OFF_FIGHTER_ID = 0x160
OFF_STRING_BLOCK_END = 0x170
OFF_MOVES_PTR = 0x230
OFF_MOVES_COUNT = 0x238

OFF_NAME_KEY = 0x0
OFF_ANIM_NAME_KEY = 0x20
OFF_NAME_OFFSET = 0x40
OFF_ANIM_NAME_OFFSET = 0x48

OFF_ANMBIN_BODY_KEYS_COUNT = 0x1C
OFF_ANMBIN_BODY_KEYS = 0x68

SKIP_FILES = {"ja4.motbin"}
DUMMY_STEM = "test"
DUMMY_JSON_STEM = "dek"
DUMMY_ANMBIN_STEM = "com"
DUMMY_ENCODED_ID = 128
DUMMY_FIGHTER_ID = 116

XOR_KEYS = [
    0x964F5B9E,
    0xD88448A2,
    0xA84B71E0,
    0xA27D5221,
    0x9B81329F,
    0xADFB76C8,
    0x7DEF1F1C,
    0x7EE2BC2C,
]


def load_name_hash(json_path: Path) -> dict[int, str]:
    if not json_path.exists():
        return {}
    data = json.loads(json_path.read_text(encoding="utf-8"))
    return {int(k): v for k, v in data.items()}


def u32(buf: bytes, off: int) -> int:
    return struct.unpack_from("<I", buf, off)[0]


def u64(buf: bytes, off: int) -> int:
    return struct.unpack_from("<Q", buf, off)[0]


def decode_key(blocks: bytes, move_idx: int) -> int:
    """XOR-decode an 8×uint32 field and return the live slot (idx % 8)."""
    values = [
        u32(blocks, i * 4) ^ XOR_KEYS[i]
        for i in range(8)
    ]
    return values[move_idx % 8] & 0xFFFFFFFF


def parse_anmbin_body_keys(data: bytes, expected_count: int, stem: str) -> list[int]:
    """Read TK_AnimKey *bodyKeys from an .anmbin (one uint32 per move)."""
    count = u32(data, OFF_ANMBIN_BODY_KEYS_COUNT)
    if count != expected_count:
        print(
            f"  [warn] {stem}.anmbin bodyKeysCount={count} "
            f"!= moves_count={expected_count}"
        )
    addr = u64(data, OFF_ANMBIN_BODY_KEYS)
    end = addr + count * 4
    if end > len(data):
        raise RuntimeError(
            f"{stem}.anmbin: bodyKeys at 0x{addr:x} ({count} keys) "
            f"runs past end of file ({len(data)} bytes)"
        )
    return [u32(data, addr + i * 4) for i in range(count)]


def parse_motbin(
    data: bytes,
    names: dict[int, str],
    stem: str,
    body_keys: list[int],
) -> dict:
    encoded_id = u32(data, OFF_FIGHTER_ID)
    fighter_id = (encoded_id - 1) // 0xFFFF
    if stem == DUMMY_STEM and fighter_id == DUMMY_ENCODED_ID:
        fighter_id = DUMMY_FIGHTER_ID

    moves_addr = u64(data, OFF_MOVES_PTR) + HEADER_SIZE
    moves_count = u32(data, OFF_MOVES_COUNT)
    string_block_end = u64(data, OFF_STRING_BLOCK_END)

    name_offsets: list[int] = []
    anim_offsets: list[int] = []
    raw_moves: list[bytes] = []

    for i in range(moves_count):
        pos = moves_addr + i * MOVE_SIZE
        move = data[pos:pos + MOVE_SIZE]
        if len(move) != MOVE_SIZE:
            raise RuntimeError(
                f"{stem}.motbin: truncated move {i} at 0x{pos:x} "
                f"(need {MOVE_SIZE} bytes, got {len(move)})"
            )
        raw_moves.append(move)
        name_offsets.append(u64(move, OFF_NAME_OFFSET))
        anim_offsets.append(u64(move, OFF_ANIM_NAME_OFFSET))

    moves: list[dict] = []
    for i, move in enumerate(raw_moves):
        name_key = decode_key(move[OFF_NAME_KEY:OFF_NAME_KEY + 0x20], i)
        anim_name_key = decode_key(move[OFF_ANIM_NAME_KEY:OFF_ANIM_NAME_KEY + 0x20], i)
        name_offset = name_offsets[i]
        anim_name_offset = anim_offsets[i]
        name_length = anim_name_offset - name_offset
        if i + 1 < moves_count:
            anim_name_length = name_offsets[i + 1] - anim_name_offset
        else:
            anim_name_length = string_block_end - anim_name_offset

        moves.append({
            "name_key": name_key,
            "anim_name_key": anim_name_key,
            "anim_key": body_keys[i] if i < len(body_keys) else None,
            # "name_offset": name_offset,
            # "anim_name_offset": anim_name_offset,
            "name_length": name_length - 1, # null-terminated
            "anim_name_length": anim_name_length - 1, # null-terminated
            "name": names.get(name_key),
            "anim_name": names.get(anim_name_key),
        })

    return {
        "fighter_id": fighter_id,
        "moves": moves,
    }


def extract_dir(input_dir: Path, output_dir: Path, names_path: Path) -> None:
    if not input_dir.is_dir():
        raise SystemExit(f"Input directory not found: {input_dir}")

    names = load_name_hash(names_path)
    print(f"Loaded {len(names):,} name mappings from {names_path}")

    files = sorted(p for p in input_dir.glob("*.motbin") if p.name not in SKIP_FILES)
    if not files:
        print(f"No .motbin files in {input_dir}")
        return

    output_dir.mkdir(parents=True, exist_ok=True)
    converted = 0

    for path in files:
        data = path.read_bytes()
        anmbin_stem = DUMMY_ANMBIN_STEM if path.stem == DUMMY_STEM else path.stem
        anmbin_path = path.with_name(f"{anmbin_stem}.anmbin")
        if not anmbin_path.exists():
            print(f"  [skip] {path.name}: missing {anmbin_path.name}")
            continue
        moves_count = u32(data, OFF_MOVES_COUNT)
        body_keys = parse_anmbin_body_keys(anmbin_path.read_bytes(), moves_count, anmbin_stem)
        result = parse_motbin(data, names, path.stem, body_keys)
        json_stem = DUMMY_JSON_STEM if path.stem == DUMMY_STEM else path.stem
        out_path = output_dir / f"{json_stem}.json"
        out_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=None, separators=(",", ":")),
            encoding="utf-8",
        )
   
   
        restored = sum(1 for m in result["moves"] if m["name"])
        restored_anim = sum(1 for m in result["moves"] if m["anim_name"])
        n = len(result["moves"])
        print(
            f"  [ok] {path.name}  fighter_id={result['fighter_id']}  "
            f"moves={n:,}  names={restored}/{n}  anims={restored_anim}/{n}  "
            f"→ {out_path.name}"
        )
        converted += 1

    skipped = sorted(p.name for p in input_dir.glob("*.motbin") if p.name in SKIP_FILES)
    for name in skipped:
        print(f"  [skip] {name}")

    print(f"\nDone. Converted {converted} files → {output_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description="motbin → JSON 변환")
    parser.add_argument("--version", default="3.01.01",
                        help="게임 버전. 기본 입출력 경로 산정에 사용 (기본: 3.01.01)")
    parser.add_argument("--input", default=None,
                        help="기본: extracted/{version}/mothead/bin")
    parser.add_argument("--output", default=None,
                        help="기본: web/public/data/{version}/motbin")
    parser.add_argument("--names", default=None,
                        help="기본: _extract/name_hash.json (버전 공용)")
    args = parser.parse_args()

    ver = args.version
    input_dir = Path(args.input) if args.input else PROJECT_ROOT / "extracted" / ver / "mothead" / "bin"
    output_dir = Path(args.output) if args.output else PROJECT_ROOT / "web" / "public" / "data" / ver / "motbin"
    names_path = Path(args.names) if args.names else PROJECT_ROOT / "_extract" / "name_hash.json"

    extract_dir(input_dir, output_dir, names_path)


if __name__ == "__main__":
    main()
