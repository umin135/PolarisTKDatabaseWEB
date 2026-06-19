// Refer to the struct "AnmBin" at the end of the file

typedef unsigned long long uint64_t;
typedef unsigned int uint32_t;
typedef int int32_t;
typedef unsigned short uint16_t;
typedef short int16_t;
typedef unsigned char uint8_t;

struct TK_AnimHeader {
  uint64_t animKey; // 0x00 (Key's always 32-bit though)
  // Pointer to raw animation data (NULL in some cases)
  void *animDataPtr;  // 0x08. FBS Pointer. If 0, then the animation is in "com.anmbin" file
  uint32_t reserved1; // 0x10 - Always 0
  uint32_t reserved2; // 0x14 - Always 0
  // Each bit represents a character ID - Tells what character is using this
  // animation
  uint32_t characterFlags1; // 0x18
  uint32_t characterFlags2; // 0x1C
  uint32_t characterFlags3; // 0x20
  uint32_t characterFlags4; // 0x24
  uint32_t reserved3;       // 0x28 - Always 0
  uint32_t reserved4;       // 0x2C - Always 0
  uint32_t reserved5;       // 0x30 - Always 0
  uint32_t reserved6;       // 0x34 - Always 0
};

struct TK_AnimKey {
  uint32_t key;
};

struct TK_AnmBinHeader {
  // Offset to animation block (list of TK__AnimHeader)
  uint32_t animBlockOffset; // 0x00

  // TOTAL NUMBER OF ANIMATIONS IN THE FILE (per category)
  uint32_t totalBodyCount;      // 0x04
  uint32_t totalHandCount;      // 0x08
  uint32_t totalFaceCount;      // 0x0C
  uint32_t totalSwingCount;     // 0x10
  uint32_t totalCameraCount;    // 0x14
  uint32_t totalExtraBodyCount; // 0x18

  // MOVESET-LINKED KEY LISTS (number of keys referenced by the character’s
  // moveset)
  uint32_t bodyKeysCount;      // 0x1C - Should match number of moves
  uint32_t handKeysCount;      // 0x20
  uint32_t faceKeysCount;      // 0x24
  uint32_t swingKeysCount;     // 0x28
  uint32_t cameraKeysCount;    // 0x2C
  uint32_t extraBodyKeysCount; // 0x30

  // POINTERS TO ANIMATION HEADER LISTS
  TK_AnimHeader *bodyHeaders;      // 0x38
  TK_AnimHeader *handHeaders;      // 0x40
  TK_AnimHeader *faceHeaders;      // 0x48
  TK_AnimHeader *swingHeaders;     // 0x50
  TK_AnimHeader *cameraHeaders;    // 0x58
  TK_AnimHeader *extraBodyHeaders; // 0x60

  // POINTERS TO MOVESET-LINKED KEYS
  TK_AnimKey *bodyKeys;      // 0x68
  TK_AnimKey *handKeys;      // 0x70
  TK_AnimKey *faceKeys;      // 0x78
  TK_AnimKey *swingKeys;     // 0x80
  TK_AnimKey *cameraKeys;    // 0x88
  TK_AnimKey *extraBodyKeys; // 0x90
};


/*
Composition of an ".anmbin" file

struct AnmBin {
  TK_AnmBinHeader header;

  Array<TK_AnimHeader> headers_body;
  Array<TK_AnimHeader> headers_hand;
  Array<TK_AnimHeader> headers_face;
  Array<TK_AnimHeader> headers_swing;
  Array<TK_AnimHeader> headers_camera;
  Array<TK_AnimHeader> headers_extra_body;

  Array<TK_AnimKey> keys_body;
  Array<TK_AnimKey> keys_hand;
  Array<TK_AnimKey> keys_face;
  Array<TK_AnimKey> keys_swing;
  Array<TK_AnimKey> keys_camera;
  Array<TK_AnimKey> keys_extra_body;

  Array<TK_PolarisAnimation> animations;
};
*/
