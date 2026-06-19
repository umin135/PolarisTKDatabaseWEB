# Polaris TK Database

Tekken 8 game data extracted from `tkdata.bin` (BNBinPak format) and browsable as a web database.

## Data Pipeline

```
tkdata.bin  →  [1_extract.py]  →  extracted/fbsdata/*.bin  →  [2_parse_fbs.py]  →  web/public/data/*.json
```

### Step 1: Extract

```bash
pip install pycryptodome zstandard flatbuffers
python scripts/1_extract.py
# custom paths:
python scripts/1_extract.py --input _extract/tkdata.bin --output extracted/ --filter fbsdata
```

### Step 2: Parse FlatBuffers → JSON

```bash
python scripts/2_parse_fbs.py
# specific files only:
python scripts/2_parse_fbs.py --only character_list stage_list jukebox_list
```

### Step 3: Build & Deploy

```bash
cd web
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
```

GitHub Pages auto-deploys on push to `main` via `.github/workflows/deploy.yml`.

## Folder Structure

```
PolarisTKDatabaseWEB/
├── _extract/                # tkdata.bin + scripts (gitignored)
├── _tkdata_structure/       # Binary format schemas
│   ├── tkdata.h             # BNBinPak container format
│   ├── fbsdata/*.fbs        # 45 FlatBuffers schemas
│   └── mothead/*.h          # motbin/anmbin structs
├── scripts/                 # Data pipeline (Python)
│   ├── 1_extract.py
│   ├── 2_parse_fbs.py
│   └── requirements.txt
├── web/                     # React + Vite frontend
│   ├── public/data/*.json   # Parsed game data (committed)
│   └── src/
└── .github/workflows/deploy.yml
```

## Web Pages

| Path | Content |
|------|---------|
| `/` | Overview & stats |
| `/characters` | Character list + fighter stats |
| `/stages` | Stage list with flags |
| `/items` | Customize items (22,000+ entries) |
| `/jukebox` | BGM tracks |
| `/ranks` | Rank tiers |
| `/gallery` | Gallery illustrations |
| `/movies` | Gallery movies |
| `/episodes` | Story episode battles |
| `/raw` | Raw JSON viewer |
