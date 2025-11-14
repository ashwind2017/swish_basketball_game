import axios from 'axios';
import type { User, Game, Shot, LeaderboardResponse, ShotChartData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const createUser = async (username: string, email?: string): Promise<User> => {
  const response = await api.post('/users/', { username, email });
  return response.data;
};

export const getUser = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const response = await api.get(`/users/username/${username}`);
  return response.data;
};

// Game API
export const createGame = async (
  userId: number,
  gameMode: string,
  difficulty: string
): Promise<Game> => {
  const response = await api.post(`/games/?user_id=${userId}`, {
    game_mode: gameMode,
    difficulty,
  });
  return response.data;
};

export const getGame = async (gameId: number): Promise<Game> => {
  const response = await api.get(`/games/${gameId}`);
  return response.data;
};

export const updateGame = async (gameId: number, updates: Partial<Game>): Promise<Game> => {
  const response = await api.patch(`/games/${gameId}`, updates);
  return response.data;
};

export const getUserGames = async (
  userId: number,
  gameMode?: string,
  limit: number = 20
): Promise<Game[]> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (gameMode) params.append('game_mode', gameMode);
  const response = await api.get(`/games/user/${userId}?${params}`);
  return response.data;
};

// Shot API
export const createShot = async (shotData: Omit<Shot, 'id' | 'user_id' | 'timestamp'>): Promise<Shot> => {
  const response = await api.post('/shots/', shotData);
  return response.data;
};

export const getGameShots = async (gameId: number): Promise<Shot[]> => {
  const response = await api.get(`/shots/game/${gameId}`);
  return response.data;
};

export const getShotChart = async (userId: number, gameMode?: string): Promise<ShotChartData> => {
  const params = gameMode ? `?game_mode=${gameMode}` : '';
  const response = await api.get(`/shots/user/${userId}/chart${params}`);
  return response.data;
};

// Leaderboard API
export const getLeaderboard = async (
  gameMode: string,
  difficulty: string = 'medium',
  limit: number = 100
): Promise<LeaderboardResponse> => {
  const response = await api.get(`/leaderboard/${gameMode}?difficulty=${difficulty}&limit=${limit}`);
  return response.data;
};

export const getTopPlayers = async (limit: number = 50) => {
  const response = await api.get(`/leaderboard/global/top-players?limit=${limit}`);
  return response.data;
};
