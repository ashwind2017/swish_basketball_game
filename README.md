# 🏀 Swish - Free Throw Challenge

A full-stack interactive basketball free throw game built with React, TypeScript, FastAPI, and SQLite. Players can compete in multiple game modes, track their statistics, and compete on global leaderboards.

## Features

### Core Gameplay
- **Physics-based shooting mechanics** - Realistic projectile motion with gravity simulation
- **Multiple shot types** - Swish, rim shots, backboard shots, and misses
- **Intuitive controls** - Drag to aim and set power, with visual trajectory preview

### Game Modes
1. **Classic Mode** - Make 10 shots, highest score wins
2. **Time Attack** - Score as many points as possible in 60 seconds
3. **Streak Mode** - See how many shots you can make in a row
4. **Distance Challenge** - Progressive difficulty with increasing distances

### Advanced Features
- **Comprehensive statistics tracking** - Shot charts, accuracy, streaks, and more
- **Global leaderboards** - Compete with other players across all game modes
- **Persistent user accounts** - Track progress across sessions
- **Difficulty levels** - Easy, Medium, and Hard modes

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Canvas API** for game rendering
- **Axios** for API communication
- **CSS3** with responsive design

### Backend
- **FastAPI** (Python) - Modern, fast web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database (easily upgradeable to PostgreSQL)
- **Pydantic** - Data validation and serialization

## Project Structure

```
swish-game/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration and database setup
│   │   ├── models/        # SQLAlchemy models (User, Game, Shot)
│   │   ├── routers/       # API endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   └── main.py        # FastAPI application
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── game/          # Game logic and physics
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main application
│   ├── package.json
│   └── .env.example
└── README.md
```

## Installation & Setup

### Prerequisites
- **Python 3.11 or 3.12** (Python 3.13 not currently supported due to uvicorn compatibility issues)
- **Node.js 22 or higher** (Required for Vite 7.x)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3.11 -m venv venv  # or python3.12
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file (optional, defaults work for local development):
```bash
cp .env.example .env
```

5. Start the backend server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Note:** The `--reload` flag is optional for development but may cause issues. Use the simple command above for reliable startup.

The API will be available at `http://localhost:8000`
API documentation (Swagger UI) at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

**Note:** If you're using nvm and need Node 22:
```bash
nvm use 22  # or: nvm install 22 && nvm use 22
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Play

1. **Create an account** - Enter a username to start (no password required for quick play)
2. **Select game mode** - Choose from Classic, Time Attack, Streak, or Distance Challenge
3. **Choose difficulty** - Easy, Medium, or Hard
4. **Shoot** - Click and drag on the canvas to aim and set power
   - Longer drag = more power
   - Angle determines trajectory
   - Release to shoot
5. **Score points** - Swish shots earn 3 points, rim shots earn 2 points
6. **Build streaks** - Consecutive makes earn bonus points
7. **View stats** - Check your shot chart, accuracy, and global ranking

## Game Mechanics

### Physics System
- Projectile motion using standard physics equations
- Gravity: 9.8 m/s²
- Launch angle: 30-70 degrees (auto-clamped)
- Power range: 5-25 m/s initial velocity

### Scoring System
- **Swish** (clean shot): 3 points
- **Rim/Backboard** (bounces in): 2 points
- **Miss**: 0 points
- **Streak Bonus**: +1 point per 3 consecutive makes

### Collision Detection
- Hoop radius: 20 pixels
- Ball radius: 12 pixels
- Backboard collision detection
- Simplified physics for rim bounces

## API Endpoints

### Users
- `POST /users/` - Create new user
- `GET /users/{user_id}` - Get user by ID
- `GET /users/{user_id}/stats` - Get user statistics
- `GET /users/username/{username}` - Get user by username

### Games
- `POST /games/` - Create new game
- `GET /games/{game_id}` - Get game by ID
- `PATCH /games/{game_id}` - Update game state
- `GET /games/user/{user_id}` - Get user's games

### Shots
- `POST /shots/` - Record a shot
- `GET /shots/{shot_id}` - Get shot by ID
- `GET /shots/game/{game_id}` - Get game's shots
- `GET /shots/user/{user_id}/chart` - Get shot chart data

### Leaderboard
- `GET /leaderboard/{game_mode}` - Get leaderboard for game mode
- `GET /leaderboard/global/top-players` - Get top players overall

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
The backend can be deployed using any WSGI server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Design Decisions

### Why SQLite?
- Quick setup for demo/development
- No external database server required
- Easy to upgrade to PostgreSQL for production

### Why Canvas API instead of game library?
- Full control over rendering
- Lighter weight
- Demonstrates low-level graphics programming
- No external dependencies for game engine

### Architecture Choices
- **Monorepo structure** - Backend and frontend in one repo for easier development
- **TypeScript** - Type safety for frontend reduces bugs
- **Pydantic schemas** - API validation and documentation
- **RESTful API** - Standard, well-understood architecture
- **JWT-free auth** - Simplified for demo (can easily add authentication)

## Future Enhancements

- Multiplayer real-time competition
- Power-ups and obstacles
- Sound effects and music
- Mobile app (React Native)
- Social features (friends, challenges)
- Tournament mode
- Customizable characters/balls
- Advanced physics (wind, spin)
- Password protected authentication using JWT

## Author

Ashwin Dandapani
- GitHub: https://github.com/ashwind2017
- LinkedIn: https://www.linkedin.com/in/ashwin-dandapani
- Email: ashwind2017@gmail.com
