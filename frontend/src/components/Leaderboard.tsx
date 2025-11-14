import React, { useState, useEffect } from 'react';
import { getLeaderboard, getTopPlayers } from '../api/client';
import type { LeaderboardEntry, GameMode, Difficulty } from '../types';

export const Leaderboard: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [gameMode, difficulty]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await getLeaderboard(gameMode, difficulty, 50);
      setEntries(response.entries);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard" style={{ padding: '20px' }}>
      <h2>Leaderboard</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <select
          value={gameMode}
          onChange={(e) => setGameMode(e.target.value as GameMode)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="classic">Classic</option>
          <option value="time_attack">Time Attack</option>
          <option value="streak">Streak</option>
          <option value="distance">Distance</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : entries.length === 0 ? (
        <div>No entries yet. Be the first!</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Rank</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Player</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Score</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Accuracy</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Streak</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                  borderBottom: '1px solid #eee',
                }}
              >
                <td style={{ padding: '10px' }}>
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && entry.rank}
                </td>
                <td style={{ padding: '10px', fontWeight: entry.rank <= 3 ? 'bold' : 'normal' }}>
                  {entry.username}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.score}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.accuracy.toFixed(1)}%</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.max_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
