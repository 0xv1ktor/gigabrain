import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { DebateRoom, LeaderboardEntry, TransactionReceipt } from "./types";

function mapToObject(value: any): Record<string, any> {
  if (value instanceof Map) {
    return Array.from(value.entries()).reduce((obj: Record<string, any>, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
  }

  return value || {};
}

function normalizeRoom(id: string, value: any): DebateRoom {
  const room = mapToObject(value);

  return {
    id: room.id || id,
    topic: room.topic || "",
    criteria: room.criteria || "",
    season: room.season || "",
    duration_minutes: Number(room.duration_minutes) || 0,
    status: room.status || "open",
    player_one: room.player_one || "",
    player_two: room.player_two || "",
    player_one_argument: room.player_one_argument || "",
    player_two_argument: room.player_two_argument || "",
    winner_slot: room.winner_slot || "",
    winning_player: room.winning_player || "",
    player_one_score: Number(room.player_one_score) || 0,
    player_two_score: Number(room.player_two_score) || 0,
    verdict: room.verdict || "",
  };
}

class GigaBrain {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;
  private studioUrl?: string;

  constructor(contractAddress: string, address?: string | null, studioUrl?: string) {
    this.contractAddress = contractAddress as `0x${string}`;
    this.studioUrl = studioUrl;
    this.client = this.createClient(address);
  }

  private createClient(address?: string | null) {
    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (this.studioUrl) {
      config.endpoint = this.studioUrl;
    }

    return createClient(config);
  }

  updateAccount(address: string): void {
    this.client = this.createClient(address);
  }

  async getRooms(): Promise<DebateRoom[]> {
    const rooms: any = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_rooms",
      args: [],
    });

    if (rooms instanceof Map) {
      return Array.from(rooms.entries())
        .map(([id, room]) => normalizeRoom(String(id), room))
        .sort((a, b) => Number(b.id.replace("giga-", "")) - Number(a.id.replace("giga-", "")));
    }

    return Object.entries(rooms || {}).map(([id, room]) => normalizeRoom(id, room));
  }

  async getPlayerXP(address: string | null): Promise<number> {
    if (!address) {
      return 0;
    }

    const points = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_player_points",
      args: [address],
    });

    return Number(points) || 0;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const points: any = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_points",
      args: [],
    });

    if (points instanceof Map) {
      return Array.from(points.entries())
        .map(([address, xp]: any) => ({ address, points: Number(xp) }))
        .sort((a, b) => b.points - a.points);
    }

    return Object.entries(points || {})
      .map(([address, xp]) => ({ address, points: Number(xp) }))
      .sort((a, b) => b.points - a.points);
  }

  async createRoom(
    topic: string,
    criteria: string,
    season: string,
    durationMinutes: number
  ): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "create_room",
      args: [topic, criteria, season, durationMinutes],
      value: BigInt(0),
    });

    return this.waitForReceipt(txHash);
  }

  async joinRoom(roomId: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "join_room",
      args: [roomId],
      value: BigInt(0),
    });

    return this.waitForReceipt(txHash);
  }

  async submitArgument(roomId: string, argument: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_argument",
      args: [roomId, argument],
      value: BigInt(0),
    });

    return this.waitForReceipt(txHash);
  }

  async judgeRoom(roomId: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "judge_room",
      args: [roomId],
      value: BigInt(0),
    });

    return this.waitForReceipt(txHash, 36);
  }

  private async waitForReceipt(txHash: any, retries = 24): Promise<TransactionReceipt> {
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries,
      interval: 5000,
    });

    return receipt as TransactionReceipt;
  }
}

export default GigaBrain;
