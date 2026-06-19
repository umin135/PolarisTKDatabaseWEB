// Refer to the struct "Motbin" at the end of the file

typedef unsigned long long uint64_t;
typedef unsigned int uint32_t;
typedef int int32_t;
typedef unsigned short uint16_t;
typedef short int16_t;
typedef unsigned char uint8_t;

struct tk_input // size: 8
{
  union
  {
    uint64_t command;
    struct
    {
      uint32_t direction;
      uint32_t button;
    };
  };
};

union tk_param // size: 4
{
  uint32_t param_unsigned;
  int32_t param_signed;
  float param_float;
};

struct tk_requirement // size: 0x14 (20)
{
  uint32_t req;
  tk_param params[4];
};

struct tk_pushback_extradata // size: 2
{
  int16_t displacement;
};

struct tk_pushback // size: 0x10 (16)
{
  uint16_t linear_duration;
  uint16_t linear_displacement;
  uint32_t num_of_extra_pushbacks;
  tk_pushback_extradata *pushback_extradata;
};

struct tk_reaction // size: 0x70 (112)
{
  // Pushback Pointers
  tk_pushback *front_pushback;
  tk_pushback *backturned_pushback;
  tk_pushback *left_side_pushback;
  tk_pushback *right_side_pushback;
  tk_pushback *front_counterhit_pushback;
  tk_pushback *downed_pushback;
  tk_pushback *block_pushback;

  // Directions
  uint16_t front_direction;            // Offset: 0x38
  uint16_t back_direction;             // Offset: 0x3a
  uint16_t left_side_direction;        // Offset: 0x3c
  uint16_t right_side_direction;       // Offset: 0x3e
  uint16_t front_counterhit_direction; // Offset: 0x40
  uint16_t downed_direction;           // Offset: 0x42

  // Rotations
  uint16_t front_rotation;      // Offset: 0x44
  uint16_t back_rotation;       // Offset: 0x46
  uint16_t left_side_rotation;  // Offset: 0x48
  uint16_t right_side_rotation; // Offset: 0x4a
  uint16_t vertical_pushback;   // Offset: 0x4c (a.k.a front_counterhit_rotation)
  uint16_t downed_rotation;     // Offset: 0x4e

  // Move IDs
  uint16_t standing;          // Offset: 0x50
  uint16_t crouch;            // Offset: 0x52
  uint16_t ch;                // Offset: 0x54
  uint16_t crouch_ch;         // Offset: 0x56
  uint16_t left_side;         // Offset: 0x58
  uint16_t left_side_crouch;  // Offset: 0x5a
  uint16_t right_side;        // Offset: 0x5c
  uint16_t right_side_crouch; // Offset: 0x5e
  uint16_t back;              // Offset: 0x60
  uint16_t back_crouch;       // Offset: 0x62
  uint16_t block;             // Offset: 0x64
  uint16_t crouch_block;      // Offset: 0x66
  uint16_t wallslump;         // Offset: 0x68
  uint16_t downed;            // Offset: 0x6a
};

struct tk_cancel_extradata // size: 4
{
  uint32_t value;
};

struct tk_cancel // size: 0x28 (40)
{
  tk_input command;
  tk_requirement *requirements;
  tk_cancel_extradata *extradata;
  uint32_t input_window_start;
  uint32_t input_window_end;
  uint32_t starting_frame;
  uint16_t move_id;
  uint16_t option;
};

struct tk_hit_condition // size: 0x18 (24)
{
  tk_requirement *requirements;
  uint32_t damage;
  tk_reaction *reaction;
};

struct tk_extraprops // size: 0x28 (40)
{
  uint32_t frame;
  tk_requirement *requirements;
  uint32_t property;
  tk_param params[4];
};

// Frameless Extraprops. Don't have the "Frame" attribute.
struct tk_fl_extraprops // size: 0x20 (32)
{
  tk_requirement *requirements;
  uint32_t property; // 1100 is the end of list
  tk_param params[4];
};

struct tk_voiceclip // size: 0xC (12)
{
  int folder; // folder of voice
  int val2;
  int clip; // ID of the clip
};

struct tk_encrypted // size: 0x10 (16)
{
  uint64_t value;
  uint64_t key;
};

struct tk_move_hitbox // size: 0x30 (48)
{
  uint32_t startup;
  uint32_t recovery;
  uint32_t location;
  float related_floats[9];
};

struct tk_move_unknown // size: 0x2C (44)
{
  int _0x0[3];    // offset 0x0
  float _0xC[3];  // offset 0xC
  uint32_t _0x14; // offset 0x14
  float _0x18[3]; // offset 0x18
  uint32_t _0x24; // offset 0x24
}; // offset 0x2E4

struct tk_move // size: 0x448 (1096)
{
  // XOR-Encoded. "idx % 8" is used to get the correct value.
  uint32_t name_key_related[8]; // offset 0x0

  // XOR-Encoded. "idx % 8" is used to get the correct value.
  uint32_t anim_name_key_related[8]; // offset 0x20

  char *name_addr;      // offset 0x40 - no longer used, points to "?"
  char *anim_name_addr; // offset 0x48 - no longer used, points to "?"
  // For unpopulated files, this stores an index to the entry in "anmbin" list.
  uint32_t anim_key;    // offset 0x50
  uint32_t skeleton_id; // offset 0x54

  // XOR-Encoded. "idx % 8" is used to get the correct value.
  uint32_t vuln_related[8]; // offset 0x58

  // XOR-Encoded. "idx % 8" is used to get the correct value.
  uint32_t hit_level_related[8]; // offset 0x68

  tk_cancel *cancel_addr;   // offset 0x78
  tk_cancel *cancel1_addr;  // offset 0x80
  int32_t cancel1_related;  // offset 0x88
  tk_cancel *cancel2_addr;  // offset 0xB0
  int32_t cancel2_related;  // offset 0xB8
  tk_cancel *cancel_addr3;  // offset 0xC0
  uint32_t cancel3_related; // offset 0xC8
  uint16_t transition;      // offset 0xCC
  uint16_t end_rotation;    // offset 0xCE

  // XOR-Encoded. "idx % 8" is used to get the correct value.
  uint32_t ordinal_id1_related[8]; // offset 0xD0

  // XOR-Encoded. "idx % 8" is used to get the correct value.
  uint32_t ordinal_id2_related[8]; // offset 0xF0

  tk_hit_condition *hit_condition_ptr;         // offset 0x110
  uint32_t damage_override;                    // offset 0x118
  uint32_t anim_max_len_adjuster;              // offset 0x11C
  uint32_t anim_max_length;                    // offset 0x120
  uint32_t airborne_start;                     // offset 0x124
  uint32_t airborne_end;                       // offset 0x128
  uint32_t ground_fall;                        // offset 0x12C
  tk_voiceclip *voiceclip_ptr;                 // offset 0x130
  tk_extraprops *extra_properties_ptr;         // offset 0x138
  tk_fl_extraprops *move_start_properties_ptr; // offset 0x140
  tk_fl_extraprops *move_end_properties_ptr;   // offset 0x148
  uint32_t u15;                                // offset 0x150
  uint32_t _0x154;                             // offset 0x154
  uint32_t startup;                            // offset 0x158
  uint32_t recovery;                           // offset 0x15C

  tk_move_hitbox hitboxes[8]; // offset 0x160 - 0x2E0
  uint32_t _0x2E0;            // offset 0x2E0
  tk_move_unknown _0x2E4[8];  // offset 0x2E4 - 0x440
};

struct tk_projectile // size: 0xE0 (224)
{
  uint32_t u1[35];                     // Offset: 0x0
  tk_hit_condition *hit_condition_idx; // Offset: 0x90
  tk_cancel *cancel_idx;               // Offset: 0x98
  uint32_t u2[16];                     // Offset: 0xa0
};

struct tk_input_sequence // size: 0x10 (16)
{
  uint16_t input_window_frames;
  uint16_t input_amount;
  tk_input *inputs;
};

struct tk_parryable_move // size: 4
{
  uint32_t value;
};

struct tk_throw_extra // size: 0xC (12)
{
  uint32_t pick_probability;
  uint16_t camera_type;
  uint16_t left_side_camera_data;
  uint16_t right_side_camera_data;
  uint16_t additional_rotation;
};

struct tk_throw // size: 0x10 (16)
{
  uint64_t side; // Side at which throw recovers
  tk_throw_extra *throwextra;
};

struct tk_dialogue // size: 0x18 (24)
{
  uint16_t type;
  uint16_t id;
  tk_requirement *requirements;
  uint32_t voiceclip_key;
  uint32_t facial_anim_idx;
};

struct tk_moveset // size: 0x318 (792)
{
  uint16_t skip_anim_lookup;
  bool is_written;
  // bool _0x3; --- padding
  uint32_t compile_date; // E.g, "20240719"
  char signature[4];     // 0x8 - "TEK\0"
  // uint32_t _0xC; --- padding
  char *character_name_addr;    // no longer used. Points to "?"
  char *character_creator_addr; // no longer used. Points to "?"
  char *date_addr;              // no longer used. Points to "?"
  char *fulldate_addr;          // no longer used. Points to "?"
  uint16_t original_aliases[60];
  uint16_t current_aliases[60];
  uint16_t unknown_aliases[32];
  uint32_t tranformed_char_id;                   // Use Expression "(X - 1) / 0xFFFF" to get the
                                                 // character ID.
  uint32_t tranformed_char_id2;                  // Use Expression "((X - 1) & 0xFFFF) + 1" to
                                                 // get the character ID.
  tk_reaction *reactions_ptr;                    // Offset: 0x168
  uint64_t string_block_end_offset;              // Offset: 0x170
  int reactions_count;                           // Offset: 0x178
  tk_requirement *requirements_ptr;              // Offset: 0x180
  int requirements_count;                        // Offset: 0x188
  tk_hit_condition *hit_conditions_ptr;          // Offset: 0x190
  int hit_conditions_count;                      // Offset: 0x198
  tk_projectile *projectiles_ptr;                // Offset: 0x1a0
  int projectiles_count;                         // Offset: 0x1a8
  tk_pushback *pushbacks_ptr;                    // Offset: 0x1b0
  int pushbacks_count;                           // Offset: 0x1b8
  tk_pushback_extradata *pushback_extradata_ptr; // Offset: 0x1c0
  int pushback_extradata_count;                  // Offset: 0x1c8
  tk_cancel *cancels_ptr;                        // Offset: 0x1d0
  int cancels_count;                             // Offset: 0x1d8
  tk_cancel *group_cancels_ptr;                  // Offset: 0x1e0
  int group_cancels_count;                       // Offset: 0x1e8
  tk_cancel_extradata *cancel_extradata_ptr;     // Offset: 0x1f0
  int cancel_extradata_count;                    // Offset: 0x1f8
  tk_extraprops *extra_move_properties_ptr;      // Offset: 0x200
  int extra_move_properties_count;               // Offset: 0x208
  tk_fl_extraprops *pre_move_props_ptr;          // Offset: 0x210
  int pre_move_props_count;                      // Offset: 0x218
  tk_fl_extraprops *post_move_props_ptr;         // Offset: 0x220
  int post_move_props_count;                     // Offset: 0x228
  tk_move *moves_ptr;                            // Offset: 0x230
  int moves_count;                               // Offset: 0x238
  tk_voiceclip *voiceclips_ptr;                  // Offset: 0x240
  int voiceclips_count;                          // Offset: 0x248
  tk_input_sequence *input_sequences_ptr;        // Offset: 0x250
  int input_sequences_count;                     // Offset: 0x258
  tk_input *inputs_ptr;                          // Offset: 0x260
  int inputs_count;                              // Offset: 0x268
  tk_parryable_move *parryable_list_ptr;         // Offset: 0x270
  int parryable_list_count;                      // Offset: 0x278
  tk_throw_extra *throw_extras_ptr;              // Offset: 0x280
  int throw_extras_count;                        // Offset: 0x288
  tk_throw *throws_ptr;                          // Offset: 0x290
  int throws_count;                              // Offset: 0x298
  tk_dialogue *dialogues_ptr;                    // Offset: 0x2a0
  int dialogues_count;                           // Offset: 0x2a8
  void *mota0;                                   // Offset: 0x2b0 - Body Mota. No longer used, always 0
  void *mota1;                                   // Offset: 0x2b8 - Body Mota. No longer used, always 0
  void *mota2;                                   // Offset: 0x2c0 - Hand Mota. No longer used, always 0
  void *mota3;                                   // Offset: 0x2c8 - Hand Mota. No longer used, always 0
  void *mota4;                                   // Offset: 0x2d0 - Face Mota. No longer used, always 0
  void *mota5;                                   // Offset: 0x2d8 - Face Mota. No longer used, always 0
  void *mota6;                                   // Offset: 0x2e0 - Swing Mota. No longer used, always 0
  void *mota7;                                   // Offset: 0x2e8 - Swing Mota. No longer used, always 0
  void *mota8;                                   // Offset: 0x2f0 - Camera Mota. No longer used, always 0
  void *mota9;                                   // Offset: 0x2f8 - Camera Mota. No longer used, always 0
  void *mota10;                                  // Offset: 0x300 - ExtraBody Mota. No longer used, always 0
  void *mota11;                                  // Offset: 0x308 - ExtraBody Mota. No longer used, always 0
  void *arc_mota_ptr;                            // Offset: 0x310 - Pointer to "xxxrotsm.arc" file. No longer
                                                 // used, always 0
};

/*
Composition of a ".motbin" file
struct Motbin {
    tk_moveset header;

    Array<tk_reaction> reactions;
    Array<tk_requirement> requirements;
    Array<tk_hit_condition> hit_conditions;
    Array<tk_projectile> projectiles;
    Array<tk_pushback> pushbacks;
    Array<tk_pushback_extradata> pushback_extradata;
    Array<tk_cancel> cancels;
    Array<tk_cancel> group_cancels;
    Array<tk_cancel_extradata> cancel_extradata;
    Array<tk_extraprops> extra_move_properties;
    Array<tk_fl_extraprops> move_start_props;
    Array<tk_fl_extraprops> move_end_props;
    Array<tk_move> moves;
    Array<tk_voiceclip> voiceclips;
    Array<tk_input_sequence> input_sequences;
    Array<tk_input> inputs;
    Array<tk_parryable_move> parryable_list;
    Array<tk_throw_extra> throw_extras;
    Array<tk_throw> throws;
    Array<tk_dialogue> dialogues;
};
*/