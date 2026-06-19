// Refer to the struct "TK__DataBin" at the end of the file

typedef unsigned long long uint64_t;
typedef long long int64_t;
typedef unsigned int uint32_t;
typedef unsigned char uint8_t;

// 64-bytes (0x40)
struct TK__BNBinEntry
{
  // Always 100
  uint32_t signature;
  // Unused
  uint32_t _0x4;
  // This flag determines whether the file should be decompressed (extracted) on run-time or not
  // Even if it's not, the game temporarily extracts it for checksum
  uint8_t extractionFlag;
  // Index of the AES256 decryption key, needs to be non-zero for the content to be decrypted
  uint8_t decryptionKeyIndex;
  // Verified after the file is decrypted
  uint8_t decryptionChecksum;
  // Verified after the file is extracted
  uint8_t decompressionChecksum;
  // Unused
  uint32_t _0xC;
  // 32-bit kamui hash that's created using the file's original name E.g, mothead/bin/ant.anmbin => 0xe5f099d4
  uint64_t hash;
  // Relative-offset of the file
  uint64_t offset;
  // Size of the packed file, 8-byte aligned?
  uint64_t size;
  // This is interesting, if the `extractionFlag` is set to 0, the size shown in the field is the packed size,
  // If the flag is 1, it shows extracted file size
  uint64_t size2;
  // Always 0
  uint64_t _0x30;
  // Always 0
  uint64_t _0x38;
};

// 256 bytes (0x100)
struct TK__BNBinList
{
  uint64_t signature;        // 0x00 "BNBinLst"
  int64_t count;             // 0x08 (number of entries)
  uint64_t offsetToEntries;  // 0x10
  uint64_t uncompressedSize; // 0x18

  // ---- padding / unused fields ----
  uint8_t reserved[256 - 0x20]; // fill entire remaining space
};

// 128-bytes (0x80)
struct TK__FOOTER
{
  uint64_t magic;                // "BNBinPak";
  uint64_t someFlag;             // usually 1
  uint8_t flag;                  // Boolean
  uint8_t aesKeyIndex;           // Used to generate an AES256 key from the keypool, usually 1
  uint8_t decryptionChecksum;    // Used to verify if Decrytion is valid
  uint8_t decompressionChecksum; // Used to verify if Decompression is valid
  uint32_t _0x14;
  uint64_t tocOffset;           // 0x18 - Offset to the Encrypted TOC Block
  uint64_t compressedTocSize;   // 0x20 - Size of the compressed TOC Block
  uint64_t uncompressedTocSize; // 0x28 - Size of the uncompressed TOC Block
  uint64_t contentOffset;       // 0x30 - Content Offset (generally 0x10 because first 0x10 bytes are "__TEKKEN8FILES__"
  uint64_t contentSize;         // 0x38 - Size of all the packed files together. Will always be tocOffset - 10 because
  uint32_t _0x40[16];           // all 0s
};

/*

Composition of the "tkdata.bin" file:
  - signature: "__TEKKEN8FILES__" (16 bytes)
  - files: each file is encrypted and compressed.
  - toc: TK__BNBinList (256 bytes)
  - entries: Array of TK__BNBinEntry (64 bytes each, count specified in toc)
  - footer: TK__FOOTER (128 bytes)

*/