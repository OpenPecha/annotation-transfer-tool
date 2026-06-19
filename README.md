# Webuddhist Tools

Unified web platform for OpenPecha / Webuddhist text tools:

- **Annotation Transfer Tool** — transfer annotations from a labeled source onto a plain target ([fast-antx](https://github.com/OpenPecha/fast-antx))
- **Pydurma Collation** — upload witnesses, align variants, export collated text ([Pydurma](https://github.com/OpenPecha/Pydurma))

Open **/** to choose a tool, then work in `/annotation-transfer` or `/pydurma`.

## Requirements

- Python 3.8–3.12 (recommended: **3.11** — avoid 3.14; Pydurma dependencies may not build)
- Node.js 18+
- [pandoc](https://pandoc.org/) (optional; required for DOCX export only)

## Install

```bash
python3.11 -m venv .venv   # or: python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install --upgrade pip setuptools wheel
pip install -e ".[dev]"
cd frontend && npm install && cd ..
```

For DOCX export:

```bash
brew install pandoc   # macOS
```

Or:

```bash
make install
```

## Run (production — one server)

```bash
cd frontend && npm run build && cd ..
source .venv/bin/activate
uvicorn webuddhsit_tools.main:app --reload --app-dir src
```

Open **http://localhost:8000/**

| URL | Purpose |
|-----|---------|
| http://localhost:8000/ | Tool selector |
| http://localhost:8000/annotation-transfer | Annotation transfer UI |
| http://localhost:8000/pydurma | Pydurma collation UI |
| http://localhost:8000/docs | Swagger API docs |
| http://localhost:8000/api/health | Health check |

## Run (development)

```bash
# Terminal 1 — API
make dev-api

# Terminal 2 — UI (proxies /api to port 8000)
make dev-ui
```

Open **http://localhost:5173/**

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Combined health check |
| GET | `/api/options` | Collation languages and export formats |
| POST | `/api/transfer` | Transfer annotations (JSON) |
| POST | `/api/collation` | Run collation (multipart) |
| PUT | `/api/collation/{job_id}/selections` | Save variant selections for a session |
| POST | `/api/export/{job_id}` | Export collation result |

## Tests

```bash
make build
make test
```

## Deploy (Render)

**Build command:**

```bash
pip install -U pip setuptools wheel && pip install --no-build-isolation pyewts==0.2.0 && pip install . && cd frontend && npm ci && npm run build
```

**Start command:**

```bash
uvicorn webuddhsit_tools.main:app --host 0.0.0.0 --port $PORT --app-dir src
```

## Project layout

```
webuddhsit-tools/
├── frontend/                    # Unified React UI
│   ├── src/app/
│   │   ├── ToolSelector.tsx     # Landing page
│   │   ├── annotation-transfer/ # Transfer tool
│   │   ├── pydurma/             # Collation tool
│   │   └── shared/              # Shared header, theme, i18n
│   └── dist/
├── src/
│   ├── webuddhsit_tools/        # Unified FastAPI entry
│   ├── annotation_transfer_tool/
│   └── pydurma_web/
└── tests/
```

## License

MIT — see [LICENSE](LICENSE).
