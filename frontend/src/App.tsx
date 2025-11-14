import React, { useState, useEffect } from 'react';
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import { ShotChart } from './components/ShotChart';
import { createUser, getUserByUsername, getShotChart, getUser } from './api/client';
import type { User, Game as GameType, ShotChartData } from './types';
import './App.css';

type View = 'menu' | 'game' | 'leaderboard' | 'stats';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState<View>('menu');
  const [shotChartData, setShotChartData] = useState<ShotChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      loadUser(parseInt(savedUserId));
    }
  }, []);

  const loadUser = async (userId: number) => {
    try {
      const user = await getUser(userId);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('userId');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to get existing user
      let user: User;
      try {
        user = await getUserByUsername(username);
      } catch {
        // User doesn't exist, create new one
        user = await createUser(username);
      }

      setCurrentUser(user);
      localStorage.setItem('userId', user.id.toString());
      setView('menu');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userId');
    setView('menu');
  };

  const handleGameComplete = async (game: GameType) => {
    // Refresh user stats
    if (currentUser) {
      await loadUser(currentUser.id);
    }
    setView('menu');
  };

  const loadShotChart = async () => {
    if (!currentUser) return;

    try {
      const data = await getShotChart(currentUser.id);
      setShotChartData(data);
    } catch (error) {
      console.error('Failed to load shot chart:', error);
    }
  };

  useEffect(() => {
    if (view === 'stats' && currentUser) {
      loadShotChart();
    }
  }, [view, currentUser]);

  // Login screen
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>🏀 Swish</h1>
          <p>Free Throw Challenge</p>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />

            {error && (
              <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Loading...' : 'Play'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            New players are automatically registered
          </div>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="app">
      <header className="app-header">
        <h1>🏀 Swish</h1>
        <div className="user-info">
          <span>Welcome, <strong>{currentUser.username}</strong></span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          onClick={() => setView('menu')}
          className={view === 'menu' ? 'active' : ''}
        >
          Main Menu
        </button>
        <button
          onClick={() => setView('game')}
          className={view === 'game' ? 'active' : ''}
        >
          Play Game
        </button>
        <button
          onClick={() => setView('leaderboard')}
          className={view === 'leaderboard' ? 'active' : ''}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setView('stats')}
          className={view === 'stats' ? 'active' : ''}
        >
          My Stats
        </button>
      </nav>

      <main className="app-content">
        {view === 'menu' && (
          <div className="menu">
            <div className="stats-overview">
              <h2>Your Stats</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{currentUser.total_games}</div>
                  <div className="stat-label">Games Played</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{currentUser.total_score}</div>
                  <div className="stat-label">Total Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{currentUser.accuracy.toFixed(1)}%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{currentUser.best_streak}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
              </div>
            </div>

            <div className="menu-actions">
              <button
                onClick={() => setView('game')}
                className="big-button play-button"
              >
                Start New Game
              </button>
              <button
                onClick={() => setView('leaderboard')}
                className="big-button"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        )}

        {view === 'game' && (
          <Game
            userId={currentUser.id}
            username={currentUser.username}
            onGameComplete={handleGameComplete}
          />
        )}

        {view === 'leaderboard' && <Leaderboard />}

        {view === 'stats' && (
          <div className="stats-view">
            <h2>Detailed Statistics</h2>
            <div className="stats-details">
              <p><strong>Total Shots:</strong> {currentUser.total_shots}</p>
              <p><strong>Shots Made:</strong> {currentUser.total_makes}</p>
              <p><strong>Shots Missed:</strong> {currentUser.total_shots - currentUser.total_makes}</p>
              <p><strong>Accuracy:</strong> {currentUser.accuracy.toFixed(2)}%</p>
              <p><strong>Best Streak:</strong> {currentUser.best_streak}</p>
            </div>

            {shotChartData && <ShotChart data={shotChartData} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
