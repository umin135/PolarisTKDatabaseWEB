#!/usr/bin/env python3
"""
2_parse_fbs.py

추출된 fbsdata/*.bin 파일을 .fbs 스키마로 파싱해서 JSON으로 변환합니다.
flatc 컴파일러 없이 순수 Python으로 FlatBuffers 바이너리 포맷을 읽습니다.

Usage:
  python scripts/2_parse_fbs.py
  python scripts/2_parse_fbs.py --input extracted/fbsdata --schemas _tkdata_structure/fbsdata --output web/public/data
"""

from __future__ import annotations
import argparse
import json
import re
import struct
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).parent.parent

# ---------------------------------------------------------------------------
# FlatBuffers scalar type definitions: name → (struct_fmt, byte_size)
# ---------------------------------------------------------------------------

SCALAR_TYPES: dict[str, tuple[str, int]] = {
    'bool':    ('<B', 1),
    'byte':    ('<b', 1),
    'ubyte':   ('<B', 1),
    'int8':    ('<b', 1),
    'uint8':   ('<B', 1),
    'short':   ('<h', 2),
    'ushort':  ('<H', 2),
    'int16':   ('<h', 2),
    'uint16':  ('<H', 2),
    'int':     ('<i', 4),
    'uint':    ('<I', 4),
    'int32':   ('<i', 4),
    'uint32':  ('<I', 4),
    'long':    ('<q', 8),
    'ulong':   ('<Q', 8),
    'int64':   ('<q', 8),
    'uint64':  ('<Q', 8),
    'float':   ('<f', 4),
    'float32': ('<f', 4),
    'double':  ('<d', 8),
    'float64': ('<d', 8),
}


# ---------------------------------------------------------------------------
# FBS Schema Parser
# ---------------------------------------------------------------------------

# Regex patterns for schema parsing
_TABLE_RE = re.compile(r'\btable\s+(\w+)\s*\{([^}]*)\}', re.DOTALL)
_FIELD_RE = re.compile(
    r'(\w+)\s*:\s*(\[?\w+\]?)(?:\s*=\s*([\w.+-]+))?\s*(?:\(\s*id\s*:\s*(\d+)\s*\))?',
)
_ROOT_RE = re.compile(r'\broot_type\s+(\w+)\s*;')

FieldDef = dict  # {'name': str, 'type': str, 'default': Any}
TableSchema = dict[int, FieldDef]   # field_id → FieldDef
AllSchemas = dict[str, TableSchema]  # table_name → TableSchema


def parse_fbs(text: str) -> tuple[AllSchemas, str | None]:
    """Parse a .fbs schema text. Returns (schemas, root_type_name)."""
    # Remove line comments
    text = re.sub(r'//[^\n]*', '', text)

    schemas: AllSchemas = {}

    for m in _TABLE_RE.finditer(text):
        table_name = m.group(1)
        body = m.group(2)
        fields: TableSchema = {}
        next_id = 0

        for fm in _FIELD_RE.finditer(body):
            fname = fm.group(1)
            ftype = fm.group(2).strip()
            default_str = fm.group(3)
            id_str = fm.group(4)

            # Skip FlatBuffers attribute keywords that look like fields
            if fname in ('id', 'deprecated', 'required', 'key', 'hash', 'force_align',
                         'bit_flags', 'flexbuffer', 'nested_flatbuffer'):
                continue

            if id_str is not None:
                fid = int(id_str)
                next_id = fid + 1
            else:
                fid = next_id
                next_id += 1

            # Parse default value
            default: Any = None
            if default_str is not None:
                if ftype == 'bool':
                    default = default_str.lower() in ('true', '1')
                elif ftype in SCALAR_TYPES:
                    fmt, _ = SCALAR_TYPES[ftype]
                    try:
                        default = float(default_str) if 'f' in fmt else int(default_str)
                    except ValueError:
                        default = None
                else:
                    default = default_str

            fields[fid] = {'name': fname, 'type': ftype, 'default': default}

        schemas[table_name] = fields

    root_m = _ROOT_RE.search(text)
    root_type = root_m.group(1) if root_m else None

    return schemas, root_type


def load_schemas_from_dir(schema_dir: Path) -> dict[str, tuple[AllSchemas, str | None]]:
    """Load all .fbs files from a directory. Returns {stem: (schemas, root_type)}."""
    result: dict[str, tuple[AllSchemas, str | None]] = {}
    for fbs_path in sorted(schema_dir.glob('*.fbs')):
        text = fbs_path.read_text(encoding='utf-8', errors='replace')
        schemas, root_type = parse_fbs(text)
        result[fbs_path.stem] = (schemas, root_type)
    return result


# ---------------------------------------------------------------------------
# FlatBuffers Binary Reader
# ---------------------------------------------------------------------------

class FlatBuffersReader:
    """Generic FlatBuffers binary reader driven by parsed schema definitions."""

    def __init__(self, data: bytes):
        self.buf = data

    def _field_inline_pos(self, table_pos: int, field_id: int) -> int:
        """Return absolute position of field's inline slot, or -1 if absent."""
        soffset = struct.unpack_from('<i', self.buf, table_pos)[0]
        vtable_pos = table_pos - soffset

        vtable_size = struct.unpack_from('<H', self.buf, vtable_pos)[0]
        entry_pos = vtable_pos + 4 + field_id * 2

        if entry_pos + 2 > vtable_pos + vtable_size:
            return -1

        field_rel = struct.unpack_from('<H', self.buf, entry_pos)[0]
        return -1 if field_rel == 0 else table_pos + field_rel

    def _read_ref_offset(self, ref_pos: int) -> int:
        """Follow a u32 relative-offset reference. Returns absolute target position."""
        rel = struct.unpack_from('<I', self.buf, ref_pos)[0]
        return ref_pos + rel

    def read_string(self, ref_pos: int) -> str:
        str_pos = self._read_ref_offset(ref_pos)
        length = struct.unpack_from('<I', self.buf, str_pos)[0]
        return self.buf[str_pos + 4 : str_pos + 4 + length].decode('utf-8', errors='replace')

    def read_scalar(self, pos: int, type_name: str) -> Any:
        fmt, _ = SCALAR_TYPES[type_name]
        val = struct.unpack_from(fmt, self.buf, pos)[0]
        return bool(val) if type_name == 'bool' else val

    def read_vector(self, ref_pos: int, element_type: str, all_schemas: AllSchemas) -> list:
        vec_pos = self._read_ref_offset(ref_pos)
        count = struct.unpack_from('<I', self.buf, vec_pos)[0]
        items = []

        if element_type in SCALAR_TYPES:
            fmt, size = SCALAR_TYPES[element_type]
            is_bool = element_type == 'bool'
            for i in range(count):
                val = struct.unpack_from(fmt, self.buf, vec_pos + 4 + i * size)[0]
                items.append(bool(val) if is_bool else val)
        elif element_type == 'string':
            for i in range(count):
                el_ref = vec_pos + 4 + i * 4
                items.append(self.read_string(el_ref))
        elif element_type in all_schemas:
            for i in range(count):
                el_ref = vec_pos + 4 + i * 4
                el_pos = self._read_ref_offset(el_ref)
                items.append(self.read_table(el_pos, element_type, all_schemas))
        else:
            # Unknown element type — skip gracefully
            pass

        return items

    def read_table(self, table_pos: int, table_name: str, all_schemas: AllSchemas) -> dict:
        schema = all_schemas.get(table_name, {})
        result: dict = {}

        for fid, fdef in sorted(schema.items()):
            fname = fdef['name']
            ftype = fdef['type']
            default = fdef.get('default')

            inline = self._field_inline_pos(table_pos, fid)

            if inline < 0:
                if default is not None:
                    result[fname] = default
                continue

            if ftype in SCALAR_TYPES:
                result[fname] = self.read_scalar(inline, ftype)
            elif ftype == 'string':
                result[fname] = self.read_string(inline)
            elif ftype.startswith('[') and ftype.endswith(']'):
                el_type = ftype[1:-1]
                result[fname] = self.read_vector(inline, el_type, all_schemas)
            elif ftype in all_schemas:
                nested_pos = self._read_ref_offset(inline)
                result[fname] = self.read_table(nested_pos, ftype, all_schemas)
            else:
                # Unknown type — store raw u32 as hex
                try:
                    val = struct.unpack_from('<I', self.buf, inline)[0]
                    result[fname] = val
                except struct.error:
                    pass

        return result

    def read_root(self, root_table_name: str, all_schemas: AllSchemas) -> dict:
        root_offset = struct.unpack_from('<I', self.buf, 0)[0]
        return self.read_table(root_offset, root_table_name, all_schemas)


# ---------------------------------------------------------------------------
# Main conversion logic
# ---------------------------------------------------------------------------

def convert_bin_to_json(bin_path: Path, schemas: AllSchemas, root_type: str) -> dict:
    data = bin_path.read_bytes()
    reader = FlatBuffersReader(data)
    return reader.read_root(root_type, schemas)


def main() -> None:
    parser = argparse.ArgumentParser(description='FlatBuffers .bin → JSON 변환')
    parser.add_argument('--input',   default=str(PROJECT_ROOT / 'extracted' / 'fbsdata'))
    parser.add_argument('--schemas', default=str(PROJECT_ROOT / '_tkdata_structure' / 'fbsdata'))
    parser.add_argument('--output',  default=str(PROJECT_ROOT / 'web' / 'public' / 'data'))
    parser.add_argument('--only',    nargs='*', help='특정 파일만 변환 (예: character_list stage_list)')
    args = parser.parse_args()

    input_dir  = Path(args.input)
    schema_dir = Path(args.schemas)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f'Loading schemas from {schema_dir} ...')
    schema_map = load_schemas_from_dir(schema_dir)
    print(f'  Loaded {len(schema_map)} schema files')

    targets = args.only if args.only else sorted(schema_map.keys())

    converted = 0
    skipped = 0

    for stem in targets:
        bin_path = input_dir / f'{stem}.bin'
        if not bin_path.exists():
            print(f'  [skip] {stem}.bin not found in {input_dir}')
            skipped += 1
            continue

        if stem not in schema_map:
            print(f'  [skip] no schema for {stem}')
            skipped += 1
            continue

        schemas, root_type = schema_map[stem]
        if not root_type:
            print(f'  [skip] {stem}.fbs has no root_type')
            skipped += 1
            continue

        try:
            result = convert_bin_to_json(bin_path, schemas, root_type)
            out_path = output_dir / f'{stem}.json'
            out_path.write_text(
                json.dumps(result, ensure_ascii=False, indent=2),
                encoding='utf-8'
            )
            entry_count = _count_entries(result)
            print(f'  [ok] {stem}.json  ({entry_count} entries)')
            converted += 1
        except Exception as exc:
            print(f'  [ERR] {stem}: {exc}')
            skipped += 1

    print(f'\nDone. Converted: {converted}, Skipped/Errors: {skipped}')
    print(f'Output → {output_dir}')


def _count_entries(data: Any, depth: int = 0) -> int:
    """Best-effort estimate of top-level entry count for logging."""
    if depth > 3:
        return 0
    if isinstance(data, list):
        return len(data)
    if isinstance(data, dict):
        for v in data.values():
            n = _count_entries(v, depth + 1)
            if n:
                return n
    return 0


if __name__ == '__main__':
    main()
