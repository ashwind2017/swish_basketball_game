# Swish Backend API

FastAPI backend for the Swish free throw basketball game.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

SQLite database will be automatically created at `swish.db` on first run.

## Environment Variables

See `.env.example` for configuration options.
