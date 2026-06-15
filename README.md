# Annotation Transfer Tool

Web app for transferring text annotations from a labeled source document onto a plain target document, powered by [fast-antx](https://github.com/OpenPecha/fast-antx).

## What it does

1. Paste or upload a **annotated source** `.txt` file (text with tags/labels).
2. Paste or upload a **plain target** `.txt` file (same content without labels).
3. Define **transfer rules** (type + regex) that describe how labels look, or import them from a `.txt` pattern file.
4. Click **Transfer** — the backend copies labels from source onto target.
5. Download the **after** result as a `.txt` file from the UI.

## Requirements

- Python 3.8+
- Node.js 18+ (for frontend development/build)

## Install

```bash
git clone https://github.com/OpenPecha/annotation-transfer-tool.git
cd annotation-transfer-tool

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -e ".[dev]"
cd frontend && npm install && cd ..
```

Or use the Makefile:

```bash
make install
```

## Run (production-style — one server)

Build the frontend, then start FastAPI. The same server serves the UI and API.

```bash
cd frontend && npm run build && cd ..
source .venv/bin/activate
uvicorn annotation_transfer_tool.main:app --reload --app-dir src
```

Open **http://localhost:8000/** for the app.

| URL | Purpose |
|-----|---------|
| http://localhost:8000/ | React UI |
| http://localhost:8000/docs | Swagger API docs |
| http://localhost:8000/api/health | Health check |

## Run (development — hot reload)

Use two terminals:

```bash
# Terminal 1 — API
make dev-api

# Terminal 2 — UI (proxies /api to port 8000)
make dev-ui
```

Open **http://localhost:5173/** (Vite dev server).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/transfer` | Transfer annotations (JSON body) |

File import and export (`.txt` only) are handled in the browser — no upload or download API.

### Transfer example

```bash
curl -X POST http://localhost:8000/api/transfer \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "#A# cat",
    "target": "cat",
    "patterns": [["color", "(#.+?#)"]],
    "output": "txt"
  }'
```

## Tests

```bash
# Build frontend first (needed for static/SPA tests)
make build
make test
```

With coverage:

```bash
make test-cov
```

## Project layout

```
annotation-transfer-tool/
├── frontend/              # React + Vite UI
│   ├── src/app/App.tsx
│   ├── src/lib/api.ts     # Transfer API client
│   ├── src/lib/files.ts   # Browser .txt read/download helpers
│   └── dist/              # build output (gitignored)
├── src/annotation_transfer_tool/
│   ├── main.py            # FastAPI entry + static file serving
│   ├── api/routes/        # health, transfer
│   ├── schemas/
│   └── services/
├── tests/
├── docs/                  # Docsify documentation site (separate from app UI)
└── Makefile
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | `lsof -ti :8000 \| xargs kill` then restart uvicorn |
| UI shows but Transfer fails | Ensure uvicorn is running with latest code |
| `/` returns 404 | Run `npm run build` in `frontend/` first |
| First transfer is slow | fast-antx downloads a diff binary on first run (~30s); later calls are fast |

## License

MIT — see [LICENSE](LICENSE).
