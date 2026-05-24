"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import GigaBrain from "../contracts/GigaBrain";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { configError, error, success } from "../utils/toast";
import type { DebateRoom, LeaderboardEntry } from "../contracts/types";

export function useGigaBrainContract(): GigaBrain | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  return useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
      );
      return null;
    }

    return new GigaBrain(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);
}

export function useRooms() {
  const contract = useGigaBrainContract();

  return useQuery<DebateRoom[], Error>({
    queryKey: ["rooms"],
    queryFn: () => (contract ? contract.getRooms() : Promise.resolve([])),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function usePlayerXP(address: string | null) {
  const contract = useGigaBrainContract();

  return useQuery<number, Error>({
    queryKey: ["playerXP", address],
    queryFn: () => (contract ? contract.getPlayerXP(address) : Promise.resolve(0)),
    enabled: !!address && !!contract,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });
}

export function useLeaderboard() {
  const contract = useGigaBrainContract();

  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: () => (contract ? contract.getLeaderboard() : Promise.resolve([])),
    enabled: !!contract,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });
}

function useMutationState() {
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  return { pendingRoomId, setPendingRoomId };
}

export function useCreateRoom() {
  const contract = useGigaBrainContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      topic,
      criteria,
      season,
      durationMinutes,
    }: {
      topic: string;
      criteria: string;
      season: string;
      durationMinutes: number;
    }) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }

      return contract.createRoom(topic, criteria, season, durationMinutes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      success("Room created", {
        description: "Your debate room is live and waiting for a challenger.",
      });
    },
    onError: (err: any) => {
      error("Failed to create room", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    createRoom: mutation.mutate,
    createRoomAsync: mutation.mutateAsync,
  };
}

export function useJoinRoom() {
  const contract = useGigaBrainContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const { pendingRoomId, setPendingRoomId } = useMutationState();

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!contract || !address) {
        throw new Error("Connect your wallet first.");
      }

      setPendingRoomId(roomId);
      return contract.joinRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      success("Joined room", {
        description: "The debate is open for arguments.",
      });
    },
    onError: (err: any) => {
      error("Failed to join room", {
        description: err?.message || "Please try again.",
      });
    },
    onSettled: () => setPendingRoomId(null),
  });

  return { ...mutation, pendingRoomId, joinRoom: mutation.mutate };
}

export function useSubmitArgument() {
  const contract = useGigaBrainContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const { pendingRoomId, setPendingRoomId } = useMutationState();

  const mutation = useMutation({
    mutationFn: async ({ roomId, argument }: { roomId: string; argument: string }) => {
      if (!contract || !address) {
        throw new Error("Connect your wallet first.");
      }

      setPendingRoomId(roomId);
      return contract.submitArgument(roomId, argument);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      success("Argument submitted", {
        description: "When both players submit, the room can be judged.",
      });
    },
    onError: (err: any) => {
      error("Failed to submit argument", {
        description: err?.message || "Please try again.",
      });
    },
    onSettled: () => setPendingRoomId(null),
  });

  return { ...mutation, pendingRoomId, submitArgument: mutation.mutate };
}

export function useJudgeRoom() {
  const contract = useGigaBrainContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const { pendingRoomId, setPendingRoomId } = useMutationState();

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!contract || !address) {
        throw new Error("Connect your wallet first.");
      }

      setPendingRoomId(roomId);
      return contract.judgeRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["playerXP"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      success("Judgment finalized", {
        description: "XP has been distributed on the leaderboard.",
      });
    },
    onError: (err: any) => {
      error("Failed to judge room", {
        description: err?.message || "Please try again.",
      });
    },
    onSettled: () => setPendingRoomId(null),
  });

  return { ...mutation, pendingRoomId, judgeRoom: mutation.mutate };
}
