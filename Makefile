.PHONY: install dev-api dev-ui build test test-cov

install:
	pip install --upgrade pip setuptools wheel
	pip install -e ".[dev]"
	cd frontend && npm install

dev-api:
	uvicorn webuddhsit_tools.main:app --reload --app-dir src

dev-ui:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

test:
	PYTHONPATH=src pytest -v

test-cov:
	PYTHONPATH=src pytest --cov webuddhsit_tools --cov annotation_transfer_tool --cov pydurma_web
