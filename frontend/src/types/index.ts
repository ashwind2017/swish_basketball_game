export interface User {
  id: number;
  username: string;
  email?: string;
  created_at: string;
  total_games: number;
  total_shots: number;
  total_makes: number;
  best_streak: number;
  total_score: number;
  accuracy: number;
}

export interface Game {
  id: number;
  user_id: number;
  game_mode: GameMode;
  score: number;
  shots_taken: number;
  shots_made: number;
  streak: number;
  max_streak: number;
  duration?: number;
  difficulty: Difficulty;
  completed: boolean;
  accuracy: number;
  created_at: string;
}

export interface Shot {
  id: number;
  user_id: number;
  game_id: number;
  angle: number;
  power: number;
  release_x: number;
  release_y: number;
  made: boolean;
  shot_type?: ShotType;
  distance?: number;
  shot_number: number;
  timestamp: string;
  trajectory?: TrajectoryPoint[];
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  t: number;
}

export type GameMode = 'classic' | 'time_attack' | 'streak' | 'distance';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ShotType = 'swish' | 'rim_in' | 'backboard' | 'miss';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  accuracy: number;
  game_mode: string;
  difficulty: string;
  shots_made: number;
  shots_taken: number;
  max_streak: number;
}

export interface LeaderboardResponse {
  game_mode: string;
  difficulty: string;
  entries: LeaderboardEntry[];
}

export interface ShotChartData {
  total_shots: number;
  made: number;
  missed: number;
  by_position: Array<{
    x: number;
    y: number;
    made: boolean;
    shot_type?: string;
  }>;
}
