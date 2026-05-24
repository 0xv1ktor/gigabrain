/**
 * TypeScript types for the Giga Brain debate contract.
 */

export interface DebateRoom {
  id: string;
  topic: string;
  criteria: string;
  season: string;
  duration_minutes: number;
  status: "open" | "arguing" | "ready" | "judged";
  player_one: string;
  player_two: string;
  player_one_argument: string;
  player_two_argument: string;
  winner_slot: "player_one" | "player_two" | "";
  winning_player: string;
  player_one_score: number;
  player_two_score: number;
  verdict: string;
}

export interface LeaderboardEntry {
  address: string;
  points: number;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}
