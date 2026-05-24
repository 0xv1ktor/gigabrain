"use client";

import { useState, useEffect } from "react";
import { AccountPanel } from "./AccountPanel";
import { CreateRoomModal } from "./CreateRoomModal";
import { useRooms } from "@/lib/hooks/useGigaBrain";
import { Brain } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: rooms } = useRooms();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalRooms = rooms?.length || 0;
  const judgedRooms = rooms?.filter((room) => room.status === "judged").length || 0;

  return (
    <header
      className="game-hud fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
      data-scrolled={isScrolled}
    >
      <div className="game-hud-inner">
        <a href="#" className="hud-brand" aria-label="Giga Brain home">
          <span className="hud-brand-icon">
            <Brain className="w-5 h-5" />
          </span>
          <span>Giga Brain</span>
        </a>

        <div className="hud-stats">
          <div>
            <span>Rooms</span>
            <strong>{totalRooms}</strong>
          </div>
          <div>
            <span>Judged</span>
            <strong>{judgedRooms}</strong>
          </div>
        </div>

        <div className="hud-actions">
          <CreateRoomModal />
          <AccountPanel />
        </div>
      </div>
    </header>
  );
}
