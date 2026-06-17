.PHONY: install dev-api dev-ui build test test-cov

install:
	pip install -e ".[dev]"
	cd frontend && npm install

dev-api:
	uvicorn annotation_transfer_tool.main:app --reload --app-dir src

dev-ui:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

test:
	PYTHONPATH=src pytest -v

test-cov:
	PYTHONPATH=src pytest --cov annotation_transfer_tool
