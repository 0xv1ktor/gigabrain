"use client";

import { Navbar } from "@/components/Navbar";
import { RoomsPanel } from "@/components/RoomsPanel";
import { Leaderboard } from "@/components/Leaderboard";
import { Award, Gamepad2, Settings, Share2, Store, Trophy } from "lucide-react";

export default function HomePage() {
  return (
    <div className="game-page min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="game-menu-scene">
          <div className="painted-sky" />
          <div className="sky-ribbon sky-ribbon-one" />
          <div className="sky-ribbon sky-ribbon-two" />
          <div className="floating-rock rock-one" />
          <div className="floating-rock rock-two" />
          <div className="floating-rock rock-three" />
          <div className="cliff-stack cliff-left" />
          <div className="cliff-stack cliff-right" />

          <div className="game-menu-inner">
            <div className="stone-logo" aria-label="Giga Brain">
              <span>Giga</span>
              <span>Brain</span>
            </div>

            <div className="menu-buttons" aria-label="Main menu">
              <a className="plank-button plank-light" href="#arena">
                Play
              </a>
              <a className="plank-button plank-red" href="#leaderboard">
                Survival
              </a>
              <a className="plank-button plank-yellow" href="#arena">
                Store
              </a>
              <a
                className="plank-button plank-stone"
                href="https://genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Other Games
              </a>
            </div>

            <div className="menu-icon-row" aria-label="Quick actions">
              <a href="#arena" className="menu-icon-tile tile-cream" title="Rooms">
                <Gamepad2 />
              </a>
              <a href="#leaderboard" className="menu-icon-tile tile-gold" title="Leaderboard">
                <Trophy />
              </a>
              <a href="#leaderboard" className="menu-icon-tile tile-mint" title="Ranks">
                <Award />
              </a>
              <a href="#settings" className="menu-icon-tile tile-slate" title="Settings">
                <Settings />
              </a>
              <a
                href="https://genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="menu-icon-tile tile-moss"
                title="Share"
              >
                <Share2 />
              </a>
              <a
                href="https://studio.genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="menu-icon-tile tile-lime"
                title="Store"
              >
                <Store />
              </a>
            </div>
          </div>
        </section>

        <section id="arena" className="game-content px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="section-title-card">
              <h1>Arena Rooms</h1>
              <p>Weekly debate chambers, AI verdicts, XP spoils.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8 animate-slide-up">
                <RoomsPanel />
              </div>

              <div id="leaderboard" className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
                <Leaderboard />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="game-footer py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a
                href="https://genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5b341e] transition-colors"
              >
                Powered by GenLayer
              </a>
              <a
                href="https://studio.genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5b341e] transition-colors"
              >
                Studio
              </a>
              <a
                href="https://docs.genlayer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5b341e] transition-colors"
              >
                Docs
              </a>
              <a
                href="https://github.com/genlayerlabs/genlayer-project-boilerplate"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5b341e] transition-colors"
              >
                GitHub
              </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
