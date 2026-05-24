"use client";

import { useEffect, useState } from "react";
import { Brain, Clock, Loader2, Plus } from "lucide-react";
import { useCreateRoom } from "@/lib/hooks/useGigaBrain";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function defaultSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week = Math.ceil(((Number(now) - Number(start)) / 86400000 + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function CreateRoomModal() {
  const { isConnected, address, isLoading } = useWallet();
  const { createRoom, isPending, isSuccess } = useCreateRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [criteria, setCriteria] = useState("logic, creativity, persuasion, and clarity");
  const [season, setSeason] = useState(defaultSeason());
  const [durationMinutes, setDurationMinutes] = useState(10);

  useEffect(() => {
    if (isSuccess) {
      setTopic("");
      setCriteria("logic, creativity, persuasion, and clarity");
      setDurationMinutes(10);
      setIsOpen(false);
    }
  }, [isSuccess]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isConnected || !address) {
      error("Please connect your wallet first");
      return;
    }

    if (topic.trim().length < 8) {
      error("Topic is too short");
      return;
    }

    createRoom({
      topic,
      criteria,
      season,
      durationMinutes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected || !address || isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Room
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card border-2 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Debate Room</DialogTitle>
          <DialogDescription>
            Start a weekly two-player argument that GenLayer AI consensus can judge.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Topic
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Should an AI be allowed to roast its own validators?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criteria">Judging Criteria</Label>
            <Input
              id="criteria"
              value={criteria}
              onChange={(event) => setCriteria(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="season">Weekly Season</Label>
              <Input
                id="season"
                value={season}
                onChange={(event) => setSeason(event.target.value)}
                placeholder="2026-W22"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Minutes
              </Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
