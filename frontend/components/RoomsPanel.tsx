"use client";

import { useState } from "react";
import { Brain, CheckCircle2, Loader2, MessageSquareText, Scale, Swords, Trophy } from "lucide-react";
import {
  useGigaBrainContract,
  useJudgeRoom,
  useJoinRoom,
  useRooms,
  useSubmitArgument,
} from "@/lib/hooks/useGigaBrain";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { DebateRoom } from "@/lib/contracts/types";

const statusTone: Record<DebateRoom["status"], string> = {
  open: "text-sky-300 border-sky-400/30",
  arguing: "text-amber-300 border-amber-400/30",
  ready: "text-fuchsia-300 border-fuchsia-400/30",
  judged: "text-emerald-300 border-emerald-400/30",
};

function isSameAddress(a?: string | null, b?: string | null) {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function userSlot(room: DebateRoom, address: string | null) {
  if (isSameAddress(address, room.player_one)) return "player_one";
  if (isSameAddress(address, room.player_two)) return "player_two";
  return "";
}

export function RoomsPanel() {
  const contract = useGigaBrainContract();
  const { data: rooms, isLoading, isError } = useRooms();

  if (isLoading) {
    return (
      <div className="brand-card p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading debate rooms...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-10 text-center space-y-3">
        <Brain className="w-14 h-14 mx-auto text-yellow-300 opacity-70" />
        <h3 className="text-xl font-bold">Deploy Giga Brain first</h3>
        <p className="text-sm text-muted-foreground">
          Set NEXT_PUBLIC_CONTRACT_ADDRESS after deploying contracts/giga_brain.py.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="brand-card p-8 text-center">
        <p className="text-destructive">Failed to load rooms. Please try again.</p>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="brand-card p-12 text-center space-y-3">
        <Swords className="w-16 h-16 mx-auto text-muted-foreground opacity-40" />
        <h3 className="text-xl font-bold">No debate rooms yet</h3>
        <p className="text-muted-foreground">
          Create the first room and let a challenger test your argument.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

function RoomCard({ room }: { room: DebateRoom }) {
  const { address, isConnected } = useWallet();
  const { joinRoom, pendingRoomId: joiningRoomId, isPending: isJoining } = useJoinRoom();
  const { submitArgument, pendingRoomId: submittingRoomId, isPending: isSubmitting } = useSubmitArgument();
  const { judgeRoom, pendingRoomId: judgingRoomId, isPending: isJudging } = useJudgeRoom();
  const [argument, setArgument] = useState("");
  const slot = userSlot(room, address);
  const alreadySubmitted =
    (slot === "player_one" && !!room.player_one_argument) ||
    (slot === "player_two" && !!room.player_two_argument);
  const canJoin = isConnected && room.status === "open" && !slot;
  const canSubmit = isConnected && (room.status === "arguing" || room.status === "ready") && !!slot && !alreadySubmitted;
  const canJudge = isConnected && room.status === "ready";
  const pending =
    (isJoining && joiningRoomId === room.id) ||
    (isSubmitting && submittingRoomId === room.id) ||
    (isJudging && judgingRoomId === room.id);

  const handleJoin = () => {
    if (!address) {
      error("Connect your wallet first");
      return;
    }
    joinRoom(room.id);
  };

  const handleSubmit = () => {
    if (argument.trim().length < 30) {
      error("Argument needs a little more brainpower");
      return;
    }
    submitArgument({ roomId: room.id, argument });
    setArgument("");
  };

  return (
    <article className="brand-card brand-card-hover p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusTone[room.status]}>
              {room.status}
            </Badge>
            <Badge variant="secondary">{room.season}</Badge>
            <span className="text-xs text-muted-foreground">{room.duration_minutes} min</span>
          </div>
          <h2 className="text-xl font-bold leading-tight">{room.topic}</h2>
          <p className="text-sm text-muted-foreground">{room.criteria}</p>
        </div>
        {room.status === "judged" && <Trophy className="w-6 h-6 text-yellow-300" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PlayerPanel
          label="Player One"
          address={room.player_one}
          submitted={!!room.player_one_argument}
          score={room.player_one_score}
          winner={room.winner_slot === "player_one"}
        />
        <PlayerPanel
          label="Player Two"
          address={room.player_two}
          submitted={!!room.player_two_argument}
          score={room.player_two_score}
          winner={room.winner_slot === "player_two"}
        />
      </div>

      {room.verdict && (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Scale className="w-4 h-4" />
            AI consensus verdict
          </div>
          <p className="text-sm text-muted-foreground">{room.verdict}</p>
        </div>
      )}

      {canSubmit && (
        <div className="space-y-3">
          <textarea
            value={argument}
            onChange={(event) => setArgument(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm outline-none transition focus:border-accent"
            placeholder="Submit your sharpest argument..."
          />
          <Button onClick={handleSubmit} variant="gradient" disabled={pending} className="w-full sm:w-auto">
            {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquareText className="w-4 h-4 mr-2" />}
            Submit Argument
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canJoin && (
          <Button onClick={handleJoin} variant="gradient" disabled={pending}>
            {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Join Room
          </Button>
        )}
        {canJudge && (
          <Button onClick={() => judgeRoom(room.id)} variant="gradient" disabled={pending}>
            {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Scale className="w-4 h-4 mr-2" />}
            Judge Debate
          </Button>
        )}
      </div>
    </article>
  );
}

function PlayerPanel({
  label,
  address,
  submitted,
  score,
  winner,
}: {
  label: string;
  address: string;
  submitted: boolean;
  score: number;
  winner: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase text-muted-foreground">{label}</span>
        {winner && <Badge className="bg-yellow-400/20 text-yellow-200 border-yellow-400/30">Winner</Badge>}
      </div>
      {address ? (
        <AddressDisplay address={address} maxLength={12} showCopy />
      ) : (
        <span className="text-sm text-muted-foreground">Waiting for challenger</span>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className={`w-4 h-4 ${submitted ? "text-emerald-300" : "text-muted-foreground"}`} />
          {submitted ? "Submitted" : "No argument yet"}
        </span>
        {score > 0 && <span className="font-bold text-accent">{score}/10</span>}
      </div>
    </div>
  );
}
