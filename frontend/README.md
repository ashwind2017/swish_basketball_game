# Swish Frontend

React + TypeScript frontend for the Swish free throw basketball game.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:5173 to play the game.

## Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

## Components

- `App.tsx` - Main application with routing and user management
- `Game.tsx` - Game logic and state management
- `GameCanvas.tsx` - Canvas rendering and shooting mechanics
- `Leaderboard.tsx` - Global leaderboard display
- `ShotChart.tsx` - Shot visualization and analytics
