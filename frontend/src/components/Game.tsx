import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './GameCanvas';
import { createGame, updateGame, createShot } from '../api/client';
import type { Game as GameType, GameMode, Difficulty, TrajectoryPoint } from '../types';

interface GameProps {
  userId: number;
  username: string;
  onGameComplete: (game: GameType) => void;
}

const GAME_MODE_CONFIG = {
  classic: { shots: 10, title: 'Classic Mode', description: 'Make 10 shots, highest score wins' },
  time_attack: { time: 60, title: 'Time Attack', description: 'Score as many as possible in 60 seconds' },
  streak: { title: 'Streak Mode', description: 'How many can you make in a row?' },
  distance: { title: 'Distance Challenge', description: 'Progressive distance shots' },
};

export const Game: React.FC<GameProps> = ({ userId, username, onGameComplete }) => {
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [shotCount, setShotCount] = useState(0);
  const [madeCount, setMadeCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastShotResult, setLastShotResult] = useState<{ made: boolean; shotType: string } | null>(null);

  // Start new game
  const startGame = async () => {
    try {
      const game = await createGame(userId, gameMode, difficulty);
      setCurrentGame(game);
      setShotCount(0);
      setMadeCount(0);
      setStreak(0);
      setMaxStreak(0);
      setGameStarted(true);
      setGameOver(false);
      setLastShotResult(null);

      // Start timer for time attack
      if (gameMode === 'time_attack') {
        setTimeLeft(GAME_MODE_CONFIG.time_attack.time);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  // Handle timer for time attack mode
  useEffect(() => {
    if (gameMode === 'time_attack' && gameStarted && !gameOver && timeLeft !== null) {
      if (timeLeft <= 0) {
        endGame();
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameMode, gameStarted, gameOver, timeLeft]);

  // Handle shot
  const handleShot = useCallback(
    async (
      made: boolean,
      angle: number,
      power: number,
      trajectory: TrajectoryPoint[],
      shotType: string,
      distance: number
    ) => {
      if (!currentGame || gameOver) return;

      const newShotCount = shotCount + 1;
      const newMadeCount = made ? madeCount + 1 : madeCount;
      const newStreak = made ? streak + 1 : 0;
      const newMaxStreak = Math.max(maxStreak, newStreak);

      // Calculate score (more points for swish, streak bonuses)
      let points = 0;
      if (made) {
        points = shotType === 'swish' ? 3 : 2;
        points += Math.floor(newStreak / 3); // Bonus for streaks
      }

      const newScore = currentGame.score + points;

      // Update state
      setShotCount(newShotCount);
      setMadeCount(newMadeCount);
      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setLastShotResult({ made, shotType });

      // Save shot to backend
      try {
        await createShot({
          game_id: currentGame.id,
          angle,
          power,
          release_x: 100,
          release_y: 500,
          made,
          shot_type: shotType,
          distance,
          trajectory,
          shot_number: newShotCount,
        });

        // Update game state
        const updatedGame = {
          ...currentGame,
          shots_taken: newShotCount,
          shots_made: newMadeCount,
          streak: newStreak,
          max_streak: newMaxStreak,
          score: newScore,
        };

        setCurrentGame(updatedGame);

        // Check if game should end
        if (gameMode === 'classic' && newShotCount >= GAME_MODE_CONFIG.classic.shots) {
          await endGame();
        } else if (gameMode === 'streak' && !made) {
          await endGame();
        }
      } catch (error) {
        console.error('Failed to record shot:', error);
      }
    },
    [currentGame, shotCount, madeCount, streak, maxStreak, gameMode, gameOver]
  );

  // End game
  const endGame = async () => {
    if (!currentGame || gameOver) return;

    setGameOver(true);
    setGameStarted(false);

    try {
      const finalGame = await updateGame(currentGame.id, {
        completed: true,
        shots_taken: shotCount,
        shots_made: madeCount,
        max_streak: maxStreak,
        score: currentGame.score,
        duration: gameMode === 'time_attack' ? GAME_MODE_CONFIG.time_attack.time - (timeLeft || 0) : undefined,
      });

      onGameComplete(finalGame);
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  return (
    <div className="game-container" style={{ padding: '20px' }}>
      {!gameStarted ? (
        <div className="game-setup">
          <h2>Select Game Mode</h2>
          <div className="mode-selection" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {Object.entries(GAME_MODE_CONFIG).map(([mode, config]) => (
              <button
                key={mode}
                onClick={() => setGameMode(mode as GameMode)}
                style={{
                  padding: '15px',
                  backgroundColor: gameMode === mode ? '#4CAF50' : '#ddd',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{config.title}</div>
                <div style={{ fontSize: '12px' }}>{config.description}</div>
              </button>
            ))}
          </div>

          <h3>Select Difficulty</h3>
          <div className="difficulty-selection" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: difficulty === diff ? '#2196F3' : '#ddd',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{
              padding: '15px 30px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="game-active">
          <div className="game-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2>{GAME_MODE_CONFIG[gameMode].title}</h2>
              <p>Player: {username}</p>
            </div>
            <div className="game-stats" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Score: {currentGame?.score || 0}</div>
              <div>
                Shots: {madeCount}/{shotCount}
                {gameMode === 'classic' && ` (${GAME_MODE_CONFIG.classic.shots - shotCount} left)`}
              </div>
              <div>Streak: {streak} (Best: {maxStreak})</div>
              {gameMode === 'time_attack' && timeLeft !== null && (
                <div style={{ fontSize: '20px', color: timeLeft < 10 ? 'red' : 'black' }}>
                  Time: {timeLeft}s
                </div>
              )}
            </div>
          </div>

          {lastShotResult && (
            <div
              style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: lastShotResult.made ? '#4CAF50' : '#f44336',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              {lastShotResult.made
                ? `${lastShotResult.shotType.toUpperCase()}! Great shot!`
                : 'Miss! Try again!'}
            </div>
          )}

          <GameCanvas onShot={handleShot} isActive={!gameOver} />

          <button
            onClick={endGame}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            End Game
          </button>
        </div>
      )}

      {gameOver && currentGame && (
        <div
          className="game-over-modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
          <h2>Game Over!</h2>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Final Score: {currentGame.score}</strong>
          </div>
          <div>Shots Made: {madeCount}/{shotCount}</div>
          <div>Accuracy: {currentGame.accuracy.toFixed(1)}%</div>
          <div>Best Streak: {maxStreak}</div>
          <button
            onClick={() => {
              setGameOver(false);
              setGameStarted(false);
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
