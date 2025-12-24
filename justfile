frontend:
    cd frontend && pnpm run dev

backend:
    cd backend && uv run uvicorn main:app --reload
