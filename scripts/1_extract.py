#!/usr/bin/env python3
"""
1_extract.py

tkdata.bin에서 fbsdata/*.bin 파일만 추출합니다.
name_hash.json을 사용해 해시값을 파일명으로 변환합니다.

Usage:
  python scripts/1_extract.py
  python scripts/1_extract.py --input _extract/tkdata.bin --output extracted/ --filter fbsdata
  python scripts/1_extract.py --all  # fbsdata 필터 없이 전체 추출
"""

from __future__ import annotations
import argparse
import json
import struct
from dataclasses import dataclass
from pathlib import Path

from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import zstandard as zstd


KEYS_ARRAY = [
    0xADFB76C8, 0x7DEF1F1C, 0xA84B71E0, 0xD88448A2,
    0x964F5B9E, 0x7EE2BC2C, 0xA27D5221, 0xBB9FE67D,
    0xAD15269F, 0xEC1A9785, 0x9BAE2F45, 0xA4296896,
    0x275AA004, 0x37E22F31, 0x3803D4A7, 0x9B81329F,
]

KEY_POOL_STR = "U%ZPP0S2y4WoIofdsjM@2a%LJr@#*Ir!u8?FTSD2T%YcYsYl3I0W8=tSiI9.EOTQJ4?09hmYC3L5FL0uzRHN2?JF9IX9WI7t?UAQ4FujsC3XH+RkqIGJ%k19$OJS&.AKh$@LFT1C83nXrjJ0MMcZVWF0Ln!SfhwzSKoWDjQj7c!PXVEYOKD@+BUZGhY5@#RgW+Gw0sKw63QBjAp$$QOEFB%$V5?jcS@Q+hfg!=DrtmmALG0G@UXXEaVr17bnLrDnovHG.%PfIyB!8W9n&#xAywcKo6te3DAYi$KSCCz8bXQiN331x77uw5IJVq.BUfckF4sEBp%XV+e6rFg*V.ZS40#supW8T3ZB4e892MpxUMPMxr8d4LCltyVlJHBWKjK2W4SlynsF1CK5CxAkwLd6?ta.W6cW4IrQ1f@x5tUvpfPxOOyao6kEjfaPKGsBYB=Y6qQwQW3l3oGtV5zEH=&EgBL8h7Zz5sm3L&HsrFLS8CKoh3lR.XBAWXnB%S*O5&q?H9zjOqqr#JqwX3TU%2hYHTJ&2dY*fWIrPdc!P$hPlzFZUQPkgy6+Pg5C8f#bYYXua9gDn484!XO=5BuHI2FX$RR8%&rX%c@6u8EFBYXLhi0BNW!w7d+Z=iOabHqZZXSQ6Db*sncGALQFLgm%lvHfKhMP5.78Gm0Dd?nFE9zsTBIF=f6VBtD=*1PWxmnthUSjGQ&tf@9l$CAJR87UM4I$2oa@8ncr48dDMyMuM7KZX4@B.Ny6dObQeSdJ2=8jkV61GvIBOHAbbUiWfDCu52&MRs=@Bz#HHUMoQ9WFm5TxKWdoHlDEOW$!4$z==VG9PkfxPIT4.y*737zPZ9V4?JG.rl7kHK$k44$hdf.L*QX.=wp&JbpULUm#GI2vJv*lPJ$2B7M9Gg.+.O6tgUZvU4HMV2&7gvcBHDA.FG9jzC@s5*6XW8mUHB6j$*tz$OVPYDjW@07apt&poihk.I69&*d%y=m%@XP1ERk+bTP0v5iHd?xQ9C%1O2t=Tj7.xpgABlCyee1i1hPVzegGXSQD1Fp1lQd*IxwpA%HtBmuG6c$#43S?HK*Q*!Tj0kAU&RTbDoRfW=!MwGiHM2KMMNNBK=31f#83gt%NXAzix3D!6EQ5O3NSZKvQYvSKuvUSu1gGAATF1MqWG7USVjG9NAjz1&?KW0dTMaCJfD!Luym?WWLN3nf9#UcDUvL02m7L2$zJA=dbNQ2N5kVybBg7JE3ByS3AaZO=u@ty2g*dPrYW7UN&pqA1g*rQ+7%PM3XTsLcH=B+BFRIDPTsLj!+=68T+%vIMaRzFoiC4rJA#uevTsalLrpO.WfY2SG%%qbKihqRXg2=IJwXKZ+xoYUydgLLh9eRt+Df0&5&C3T7i9sj.Z2TEUCxaNl2T8d@=Muw$S955+iHs=KCt?LZNFy*#%UU8gOHl*I9lQUXH4#cVYy9JY@gilIQ?v.TdkUBN9gHob*OVicLITzNqQpGL6wvupDkVqTlAORJTgL5RMKqQYpSD8LiYUp#aWKgFCBs1hCYTzFwa$*cllNQW.M2GSSI+x#qa#JcK7Cwh.v78hI1&T3c#DR&VDazL.XL2KGUSSBKmcc31R%JCa9736gp=QV5#I7%BGEdJkOs7QhKxt0n3sS4#sAl1BGNNXPx&9PoPx8.Gdv=eDotAfJmKuSUAirWB0XUe4FG9PYTgR??$t2IKh4+LjNCZ8TkXGqh=7rN4B86TZ3gjJ6QY#sT?FIc?Z*IstFG43YZqw%BwC&Ml2p7LB@JH!YW!zvNJYKjgaNm1!%sf$ZQbms4AkcOjs2Bh"

ZSTD_MAGIC = b"\x28\xb5\x2f\xfd"
FOOTER_SIZE = 128
HEADER_MAGIC = b"__TEKKEN8FILES__"

PROJECT_ROOT = Path(__file__).parent.parent


def get_key(seed: int) -> bytes:
    s = KEY_POOL_STR
    off = (44983 * seed) % (len(s) - 32)
    return s[off:off+32].encode("ascii")


def aes_decrypt(data: bytes, key: bytes) -> bytes:
    dec = AES.new(key, AES.MODE_ECB).decrypt(data)
    try:
        return unpad(dec, 16)
    except Exception:
        return dec


def zstd_decompress(buf: bytes) -> bytes:
    return zstd.ZstdDecompressor().decompress(buf)


def looks_like_zstd(buf: bytes) -> bool:
    return len(buf) >= 4 and buf[:4] == ZSTD_MAGIC


def decrypt_footer(buf: bytes) -> bytes:
    b = bytearray(buf)
    for i, k in enumerate(KEYS_ARRAY):
        p = i * 4
        b[p+0] ^= (k >> 0) & 0xFF
        b[p+1] ^= (k >> 8) & 0xFF
        b[p+2] ^= (k >> 16) & 0xFF
        b[p+3] ^= (k >> 24) & 0xFF
    return bytes(b)


def reverse_sig(buf: bytes, off: int = 0, size: int = 8) -> str:
    return bytes(buf[off:off+size][::-1]).decode("ascii")


def load_name_hash(json_path: Path) -> dict[int, str]:
    if not json_path.exists():
        return {}
    data = json.loads(json_path.read_text(encoding="utf-8"))
    return {int(k): v for k, v in data.items()}


@dataclass
class Entry:
    flag: int
    key: int
    hash: int
    off: int
    size: int
    size2: int


def read_entry(toc: bytes, off: int) -> Entry:
    c = toc[off:off+64]
    return Entry(
        flag  = c[8],
        key   = c[9],
        hash  = struct.unpack_from("<Q", c, 16)[0],
        off   = struct.unpack_from("<Q", c, 24)[0],
        size  = struct.unpack_from("<Q", c, 32)[0],
        size2 = struct.unpack_from("<Q", c, 40)[0],
    )


def parse_toc(data: bytes) -> tuple[list[Entry], bytes]:
    footer = decrypt_footer(data[-FOOTER_SIZE:])

    if reverse_sig(footer, 0, 8) != "BNBinPak":
        raise RuntimeError("Bad footer signature")

    aes_i   = footer[0x11]
    toc_off = struct.unpack_from("<q", footer, 0x18)[0]
    toc_sz  = struct.unpack_from("<q", footer, 0x20)[0]
    toc_us  = struct.unpack_from("<q", footer, 0x28)[0]

    toc = data[toc_off:toc_off+toc_sz]
    if aes_i:
        toc = aes_decrypt(toc, get_key(aes_i))

    if not looks_like_zstd(toc):
        raise RuntimeError("TOC is not zstd compressed")

    toc = zstd_decompress(toc)

    if len(toc) != toc_us:
        raise RuntimeError(f"TOC size mismatch: got {len(toc)}, expected {toc_us}")
    if reverse_sig(toc, 0, 8) != "BNBinLst":
        raise RuntimeError("Bad TOC list signature")

    count = struct.unpack_from("<q", toc, 8)[0]
    start = struct.unpack_from("<q", toc, 16)[0]

    entries = [read_entry(toc, start + i * 64) for i in range(count)]
    return entries, data


def extract(bin_path: Path, out_path: Path, name_hash_path: Path, prefix_filter: str | None = "fbsdata") -> None:
    print(f"Reading {bin_path} ...")
    data = bin_path.read_bytes()

    if data[:16] != HEADER_MAGIC:
        raise RuntimeError("Bad header magic — not a tkdata.bin file")

    names = load_name_hash(name_hash_path)
    print(f"Loaded {len(names):,} name mappings")

    entries, data = parse_toc(data)
    print(f"TOC has {len(entries):,} entries")

    if prefix_filter:
        targets = [e for e in entries if names.get(e.hash, "").startswith(prefix_filter)]
        print(f"Filtering to '{prefix_filter}/*': {len(targets)} files")
    else:
        targets = entries

    out_path.mkdir(parents=True, exist_ok=True)
    extracted = 0

    for e in targets:
        raw = data[0x10 + e.off : 0x10 + e.off + e.size]
        raw = aes_decrypt(raw, get_key(e.key))

        if looks_like_zstd(raw):
            decomp_src = raw if e.flag else raw[:e.size2]
            raw = zstd_decompress(decomp_src)

        name = names.get(e.hash, f"unknown/{e.hash:016x}")
        dest = out_path / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(raw)
        print(f"  {name}  ({len(raw):,} bytes)")
        extracted += 1

    print(f"\nDone. Extracted {extracted} files → {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="tkdata.bin 파일 추출기")
    parser.add_argument("--input",  default=str(PROJECT_ROOT / "_extract" / "tkdata.bin"))
    parser.add_argument("--output", default=str(PROJECT_ROOT / "extracted"))
    parser.add_argument("--names",  default=str(PROJECT_ROOT / "_extract" / "name_hash.json"))
    parser.add_argument("--filter", default="fbsdata", dest="prefix",
                        help="이 prefix로 시작하는 파일만 추출 (기본: fbsdata). 전체 추출은 --filter ''")
    parser.add_argument("--all", action="store_true",
                        help="전체 파일 추출 (--filter '' 와 동일)")
    args = parser.parse_args()

    prefix = None if args.all else (args.prefix or None)
    extract(Path(args.input), Path(args.output), Path(args.names), prefix_filter=prefix)


if __name__ == "__main__":
    main()
