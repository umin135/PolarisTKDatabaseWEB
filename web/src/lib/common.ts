import { CHAR_HASH, ITEM_POS_HASH } from "./constants";

export function hexStr(
  n: number | undefined | null,
  length: number = 8,
): string {
  if (n === undefined || n === null) return "0";
  return `0x${(n >>> 0).toString(16).toUpperCase().padStart(length, "0")}`;
}

export function getPosCode(hash1: number | undefined): string {
  if (hash1 === undefined || hash1 === null) return "";
  return ITEM_POS_HASH[hash1] ?? "";
}

export function getCharLabel(h: number | undefined): string {
  if (h === undefined || h === null) return "0";
  return CHAR_HASH[h] ?? hexStr(h);
}
