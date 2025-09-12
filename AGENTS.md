# Repository Guidelines

## Project Structure & Module Organization
- `backend/` FastAPI service (`server.py`), env via `backend/.env`, deps in `requirements.txt`, runtime scripts (`start.sh`, `Dockerfile`). Exposes `/api` routes, default port `10000`.
- `frontend/` React (CRA + CRACO + Tailwind). Key folders: `src/pages`, `src/components` (UI primitives in `components/ui`), `src/utils`, `public/`. Runtime config in `src/config.js` (`REACT_APP_BACKEND_URL`).
- `tests/` Python test package (pytest). `backend_test.py` provides an API smoke tester.

## Build, Test, and Development Commands
- Backend
  - Install: `cd backend && pip install -r requirements.txt`
  - Run API (dev): `uvicorn server:app --reload --port 10000`
  - Tests: `pytest -q`
- Frontend
  - Install: `cd frontend && yarn install`
  - Run app: `yarn start` (set `REACT_APP_BACKEND_URL=http://localhost:10000` for local API)
  - Build: `yarn build`
  - Tests: `yarn test`

## Coding Style & Naming Conventions
- Python: use type hints; format with Black and isort; lint with Flake8; type‑check with mypy.
  - Example: `black . && isort . && flake8 && mypy`
- JS/React: 2‑space indent; ESLint rules; components in `PascalCase` (e.g., `ScanPage.js`, `ProductCard.js`). UI primitives under `components/ui` follow kebab‑case filenames.
- Naming: variables `camelCase`, constants `UPPER_SNAKE_CASE`, env vars `UPPER_SNAKE_CASE`.

## Testing Guidelines
- Backend (pytest): place tests under `tests/` named `test_*.py`; prefer fixtures and fast unit tests for models/routers. Aim to cover core CRUD and error paths.
- Frontend (Jest): colocate tests as `*.test.jsx` near components or under `src/__tests__/`.
- Smoke test: `python backend_test.py` (optionally update the base URL in the file to target your environment).

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise; optionally prefix scope (e.g., `frontend:`/`backend:`). Example: `backend: add product update validation`.
- PRs: include summary, linked issues, reproduction steps, and screenshots/GIFs for UI. Note any config/env changes. Ensure linters and tests pass locally (`black && isort && flake8 && mypy`, `cd frontend && npx eslint src && yarn test`).

## Security & Configuration Tips
- Backend requires `MONGO_URL` and `DB_NAME` (or `MONGO_USERNAME`/`MONGO_PASSWORD` with `MONGO_HOST`). Keep secrets in `backend/.env` and out of VCS.
- Frontend targets the API via `REACT_APP_BACKEND_URL` (e.g., `http://localhost:10000`).

