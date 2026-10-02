"use client";

import React from "react";
import { Trophy, Crown, Award, Sparkles } from "lucide-react";

export interface BattleCompetitor {
  id?: number;
  name: string;
  seed?: number;
}

export interface BattleMatch {
  matchId: string;
  title: string;
  roundStage: "T16" | "QF" | "SF" | "FINAL";
  roundDurationText: string;
  competitorA: BattleCompetitor | null;
  competitorB: BattleCompetitor | null;
  winnerId?: number | null;
  winnerName?: string | null;
  judge1Vote?: "A" | "B" | null;
  judge2Vote?: "A" | "B" | null;
  nextMatchId?: string;
  nextMatchSlot?: "A" | "B";
}

interface TournamentBracketTreeProps {
  battles: BattleMatch[];
  category: "national" | "regional";
}

/**
 * Minimalist, Premium, High-End Tournament Bracket Tree
 * Built with mathematical geometric alignment, smooth cubic-bezier SVG branches,
 * obsidian dark glass cards, radiant winner illumination, and luxury champion podiums.
 */
export default function TournamentBracketTree({
  battles,
  category,
}: TournamentBracketTreeProps) {
  const isRegional = category === "regional";

  // Sanitize emergency replacement for Regional (Tajmander -> Pranay in battles)
  const sanitizeName = (name: string | null | undefined) => {
    if (!name) return "";
    if (isRegional && /tazman/i.test(name)) return "Pranay";
    return name;
  };

  const getMatch = (id: string): BattleMatch | undefined => {
    return battles.find((b) => b.matchId === id);
  };

  // Finals matches
  const finalMatch = getMatch(isRegional ? "RFINAL" : "FINAL");
  const thirdPlaceMatch = getMatch("THIRD_PLACE");

  const championName = sanitizeName(finalMatch?.winnerName);
  const thirdPlaceName = sanitizeName(thirdPlaceMatch?.winnerName);

  return (
    <div className="space-y-4">
      {/* Sleek Exploration Helper Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-400 bg-white/[0.02] border border-white/[0.06] px-4 py-2.5 rounded-xl backdrop-blur-md">
        <span className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="tracking-wide">Interactive Knockout Tree &bull; Follow the branches into the Championship Deciders</span>
        </span>
        <span className="hidden sm:inline-block font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          ⇄ Swipe / Scroll horizontally
        </span>
      </div>

      {/* Main Bracket Tree Container */}
      <div className="relative bg-[#08090b] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-x-auto custom-scrollbar">
        {/* Subtle Luxury Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className={`relative ${!isRegional ? "min-w-[1260px]" : "min-w-[980px]"} py-2`}>
          
          {/* ============================================================== */}
          {/* COLUMN STAGE HEADERS                                           */}
          {/* ============================================================== */}
          {!isRegional ? (
            <div className="flex items-center mb-8">
              {/* R16 Header */}
              <div className="w-[210px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-sky-400 bg-sky-950/40 border border-sky-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Round of 16
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">1 min × 2 rounds</span>
              </div>
              <div className="w-[44px]" />

              {/* QF Header */}
              <div className="w-[210px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Quarter-Finals
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">1 min × 2 rounds</span>
              </div>
              <div className="w-[44px]" />

              {/* SF Header */}
              <div className="w-[210px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-rose-400 bg-rose-950/40 border border-rose-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Semi-Finals
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">1:30 min × 2 rounds</span>
              </div>
              <div className="w-[44px]" />

              {/* Finals Header */}
              <div className="w-[220px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Finals Decider
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">Grand & 3rd Place</span>
              </div>
              <div className="w-[44px]" />

              {/* Champion Podium Header */}
              <div className="w-[230px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-yellow-300 bg-yellow-950/40 border border-yellow-500/30 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Victory Podium
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">Official Champions</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center mb-8">
              {/* Regional QF Header */}
              <div className="w-[210px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Quarter-Finals
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">1 min × 2 rounds</span>
              </div>
              <div className="w-[44px]" />

              {/* Regional SF Header */}
              <div className="w-[210px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-rose-400 bg-rose-950/40 border border-rose-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Semi-Finals
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">1:30 min × 2 rounds</span>
              </div>
              <div className="w-[44px]" />

              {/* Regional Finals Header */}
              <div className="w-[220px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Regional Final
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">Title Match</span>
              </div>
              <div className="w-[44px]" />

              {/* Regional Podium Header */}
              <div className="w-[230px] text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-rose-300 bg-rose-950/40 border border-rose-500/30 px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Champion Podium
                </span>
                <span className="block text-[9px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">HBC Regional Title</span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* NATIONAL DIVISION BRACKET TREE (16 CONTENDERS)                 */}
          {/* Total Height = 8 * 86px = 688px                                */}
          {/* ============================================================== */}
          {!isRegional ? (
            <div className="flex items-start">
              
              {/* COLUMN 1: Round of 16 (8 Matches in 86px slots) */}
              <div className="w-[210px] flex flex-col">
                <MatchSlot match={getMatch("T16-1")} sanitizeName={sanitizeName} label="T16-1" />
                <MatchSlot match={getMatch("T16-8")} sanitizeName={sanitizeName} label="T16-8" />
                <MatchSlot match={getMatch("T16-4")} sanitizeName={sanitizeName} label="T16-4" />
                <MatchSlot match={getMatch("T16-5")} sanitizeName={sanitizeName} label="T16-5" />
                <MatchSlot match={getMatch("T16-2")} sanitizeName={sanitizeName} label="T16-2" />
                <MatchSlot match={getMatch("T16-7")} sanitizeName={sanitizeName} label="T16-7" />
                <MatchSlot match={getMatch("T16-3")} sanitizeName={sanitizeName} label="T16-3" />
                <MatchSlot match={getMatch("T16-6")} sanitizeName={sanitizeName} label="T16-6" />
              </div>

              {/* CONNECTOR 1: 4 Bezier Connectors (each 172px tall) */}
              <div className="w-[44px] flex flex-col">
                <BezierConnector
                  height={172}
                  topY={43}
                  bottomY={129}
                  targetY={86}
                  topWon={Boolean(getMatch("T16-1")?.winnerId)}
                  bottomWon={Boolean(getMatch("T16-8")?.winnerId)}
                />
                <BezierConnector
                  height={172}
                  topY={43}
                  bottomY={129}
                  targetY={86}
                  topWon={Boolean(getMatch("T16-4")?.winnerId)}
                  bottomWon={Boolean(getMatch("T16-5")?.winnerId)}
                />
                <BezierConnector
                  height={172}
                  topY={43}
                  bottomY={129}
                  targetY={86}
                  topWon={Boolean(getMatch("T16-2")?.winnerId)}
                  bottomWon={Boolean(getMatch("T16-7")?.winnerId)}
                />
                <BezierConnector
                  height={172}
                  topY={43}
                  bottomY={129}
                  targetY={86}
                  topWon={Boolean(getMatch("T16-3")?.winnerId)}
                  bottomWon={Boolean(getMatch("T16-6")?.winnerId)}
                />
              </div>

              {/* COLUMN 2: Quarter-Finals (4 Matches in 172px slots) */}
              <div className="w-[210px] flex flex-col">
                <MatchSlot match={getMatch("QF1")} sanitizeName={sanitizeName} height={172} label="QF1" />
                <MatchSlot match={getMatch("QF4")} sanitizeName={sanitizeName} height={172} label="QF4" />
                <MatchSlot match={getMatch("QF2")} sanitizeName={sanitizeName} height={172} label="QF2" />
                <MatchSlot match={getMatch("QF3")} sanitizeName={sanitizeName} height={172} label="QF3" />
              </div>

              {/* CONNECTOR 2: 2 Bezier Connectors (each 344px tall) */}
              <div className="w-[44px] flex flex-col">
                <BezierConnector
                  height={344}
                  topY={86}
                  bottomY={258}
                  targetY={172}
                  topWon={Boolean(getMatch("QF1")?.winnerId)}
                  bottomWon={Boolean(getMatch("QF4")?.winnerId)}
                />
                <BezierConnector
                  height={344}
                  topY={86}
                  bottomY={258}
                  targetY={172}
                  topWon={Boolean(getMatch("QF2")?.winnerId)}
                  bottomWon={Boolean(getMatch("QF3")?.winnerId)}
                />
              </div>

              {/* COLUMN 3: Semi-Finals (2 Matches in 344px slots) */}
              <div className="w-[210px] flex flex-col">
                <MatchSlot match={getMatch("SF1")} sanitizeName={sanitizeName} height={344} label="SF1" />
                <MatchSlot match={getMatch("SF2")} sanitizeName={sanitizeName} height={344} label="SF2" />
              </div>

              {/* CONNECTOR 3: 1 Bezier Connector (688px tall) */}
              <div className="w-[44px] flex flex-col">
                <BezierConnector
                  height={688}
                  topY={172}
                  bottomY={516}
                  targetY={344}
                  topWon={Boolean(getMatch("SF1")?.winnerId)}
                  bottomWon={Boolean(getMatch("SF2")?.winnerId)}
                />
              </div>

              {/* COLUMN 4: Finals Decider (688px tall, Grand Final centered at 344px, 3rd Place below) */}
              <div className="w-[220px] h-[688px] relative flex flex-col items-center">
                {/* Grand Final Card (Vertically Centered at y = 344) */}
                <div className="absolute top-[344px] -translate-y-1/2 w-full">
                  <TreeNodeCard
                    battle={finalMatch}
                    isGrandFinal={true}
                    sanitizeName={sanitizeName}
                    label="GRAND FINAL"
                  />
                </div>

                {/* 3rd Place Small Final Decider (Lower Section around y = 516) */}
                {thirdPlaceMatch && (
                  <div className="absolute top-[516px] -translate-y-1/2 w-full">
                    <TreeNodeCard
                      battle={thirdPlaceMatch}
                      isSmallFinal={true}
                      sanitizeName={sanitizeName}
                      label="3RD PLACE DECIDER"
                    />
                  </div>
                )}
              </div>

              {/* CONNECTOR 4: Straight Line from Final to Champion Podium & 3rd Place */}
              <div className="w-[44px] h-[688px] relative">
                <StraightConnector
                  height={688}
                  y={344}
                  isActive={Boolean(finalMatch?.winnerId)}
                  secondY={thirdPlaceMatch ? 516 : undefined}
                  isSecondActive={Boolean(thirdPlaceMatch?.winnerId)}
                />
              </div>

              {/* COLUMN 5: Victory Podium (Grand Champion centered at y = 344, 3rd Place below) */}
              <div className="w-[230px] h-[688px] relative flex flex-col items-center">
                {/* Grand Champion Trophy Card (Vertically Centered at y = 344) */}
                <div className="absolute top-[344px] -translate-y-1/2 w-full">
                  <div className="w-full bg-gradient-to-b from-[#1f1908] via-[#120f06] to-[#0a0a0c] border border-amber-400/40 rounded-2xl p-5 shadow-[0_8px_32px_rgba(251,191,36,0.15)] text-center relative overflow-hidden backdrop-blur-xl group">
                    {/* Ambient Halo Glow */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                    
                    {/* Shimmering Top Accent */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                    {/* Medal Emblem */}
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-amber-400/20 to-amber-600/10 border border-amber-400/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
                      <Trophy className="w-6 h-6 text-amber-300 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    </div>

                    <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 font-semibold uppercase block mb-1">
                      ★ NATIONAL CHAMPION ★
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 uppercase drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]">
                      {championName || "TBD"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-mono mt-1 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>HBC 2026 Champion</span>
                    </p>
                  </div>
                </div>

                {/* 3rd Place Winner Podium Card (Positioned at y = 516) */}
                {thirdPlaceName && (
                  <div className="absolute top-[516px] -translate-y-1/2 w-full">
                    <div className="w-full bg-gradient-to-b from-[#18110b] via-[#100c08] to-[#0a0a0c] border border-orange-500/30 rounded-xl p-3.5 text-center shadow-lg relative overflow-hidden backdrop-blur-md">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-orange-400 font-semibold mb-1">
                        <Award className="w-3.5 h-3.5" /> 3rd Place Winner
                      </div>
                      <span className="text-base font-bold text-neutral-100 uppercase tracking-tight block">
                        {thirdPlaceName}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">Bronze Medalist</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* ============================================================== */
            /* REGIONAL DIVISION BRACKET TREE (8 CONTENDERS)                  */
            /* Total Height = 4 * 86px = 344px                                */
            /* ============================================================== */
            <div className="flex items-start">
              
              {/* COLUMN 1: Regional Quarter-Finals (4 Matches in 86px slots) */}
              <div className="w-[210px] flex flex-col">
                <MatchSlot match={getMatch("RQF1")} sanitizeName={sanitizeName} label="RQF1" />
                <MatchSlot match={getMatch("RQF4")} sanitizeName={sanitizeName} label="RQF4" />
                <MatchSlot match={getMatch("RQF2")} sanitizeName={sanitizeName} label="RQF2" />
                <MatchSlot match={getMatch("RQF3")} sanitizeName={sanitizeName} label="RQF3" />
              </div>

              {/* CONNECTOR 1: 2 Bezier Connectors (each 172px tall) */}
              <div className="w-[44px] flex flex-col">
                <BezierConnector
                  height={172}
                  topY={43}
                  bottomY={129}
                  targetY={86}
                  topWon={Boolean(getMatch("RQF1")?.winnerId)}
                  bottomWon={Boolean(getMatch("RQF4")?.winnerId)}
                />
                <BezierConnector
                  height={172}
                  topY={43}
                  bottomY={129}
                  targetY={86}
                  topWon={Boolean(getMatch("RQF2")?.winnerId)}
                  bottomWon={Boolean(getMatch("RQF3")?.winnerId)}
                />
              </div>

              {/* COLUMN 2: Regional Semi-Finals (2 Matches in 172px slots) */}
              <div className="w-[210px] flex flex-col">
                <MatchSlot match={getMatch("RSF1")} sanitizeName={sanitizeName} height={172} label="RSF1" />
                <MatchSlot match={getMatch("RSF2")} sanitizeName={sanitizeName} height={172} label="RSF2" />
              </div>

              {/* CONNECTOR 2: 1 Bezier Connector (344px tall) */}
              <div className="w-[44px] flex flex-col">
                <BezierConnector
                  height={344}
                  topY={86}
                  bottomY={258}
                  targetY={172}
                  topWon={Boolean(getMatch("RSF1")?.winnerId)}
                  bottomWon={Boolean(getMatch("RSF2")?.winnerId)}
                />
              </div>

              {/* COLUMN 3: Regional Grand Final (344px tall, centered at 172px) */}
              <div className="w-[220px] h-[344px] relative flex flex-col items-center">
                <div className="absolute top-[172px] -translate-y-1/2 w-full">
                  <TreeNodeCard
                    battle={finalMatch}
                    isGrandFinal={true}
                    sanitizeName={sanitizeName}
                    label="REGIONAL FINAL"
                  />
                </div>
              </div>

              {/* CONNECTOR 3: Straight Line to Regional Champion Podium */}
              <div className="w-[44px] h-[344px] relative">
                <StraightConnector
                  height={344}
                  y={172}
                  isActive={Boolean(finalMatch?.winnerId)}
                />
              </div>

              {/* COLUMN 4: Regional Champion Showcase Podium */}
              <div className="w-[230px] h-[344px] relative flex flex-col items-center">
                <div className="absolute top-[172px] -translate-y-1/2 w-full">
                  <div className="w-full bg-gradient-to-b from-[#250d15] via-[#160a0f] to-[#0a0a0c] border border-rose-500/40 rounded-2xl p-5 shadow-[0_8px_32px_rgba(251,113,133,0.15)] text-center relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
                    
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-rose-500/20 to-rose-700/10 border border-rose-400/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(251,113,133,0.25)]">
                      <Trophy className="w-6 h-6 text-rose-300 filter drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                    </div>

                    <span className="text-[10px] font-mono tracking-[0.25em] text-rose-400 font-semibold uppercase block mb-1">
                      ★ REGIONAL CHAMPION ★
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(251,113,133,0.4)]">
                      {championName || "TBD"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-mono mt-1">
                      HBC 2026 Regional Title
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/**
 * Match Slot Wrapper
 * Positions a match card with geometric precision inside its assigned height slot.
 */
function MatchSlot({
  match,
  sanitizeName,
  height = 86,
  label,
}: {
  match?: BattleMatch;
  sanitizeName: (name: string | null | undefined) => string;
  height?: number;
  label?: string;
}) {
  return (
    <div
      className="w-[210px] flex items-center justify-center flex-shrink-0"
      style={{ height: `${height}px` }}
    >
      <TreeNodeCard battle={match} sanitizeName={sanitizeName} label={label} />
    </div>
  );
}

/**
 * Minimalist, Premium Match Card
 * Obsidian glass container with micro-glow winner bar, dignified loser muting,
 * seed badges, and subtle vote counters.
 */
function TreeNodeCard({
  battle,
  isGrandFinal = false,
  isSmallFinal = false,
  sanitizeName,
  label,
}: {
  battle?: BattleMatch;
  isGrandFinal?: boolean;
  isSmallFinal?: boolean;
  sanitizeName: (name: string | null | undefined) => string;
  label?: string;
}) {
  if (!battle) {
    return (
      <div className="w-[210px] h-[66px] bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl flex items-center justify-center text-xs text-neutral-600 font-mono">
        TBD Matchup
      </div>
    );
  }

  const compA = battle.competitorA;
  const compB = battle.competitorB;
  const compAName = sanitizeName(compA?.name);
  const compBName = sanitizeName(compB?.name);

  const hasWinner = Boolean(battle.winnerId);
  const isAWinner = Boolean(hasWinner && battle.winnerId === compA?.id && compA?.id);
  const isBWinner = Boolean(hasWinner && battle.winnerId === compB?.id && compB?.id);
  const isALoser = Boolean(hasWinner && !isAWinner && compA);
  const isBLoser = Boolean(hasWinner && !isBWinner && compB);

  // Compute judge votes if available
  let votesA: number | undefined = undefined;
  let votesB: number | undefined = undefined;
  if (battle.judge1Vote || battle.judge2Vote) {
    votesA = (battle.judge1Vote === "A" ? 1 : 0) + (battle.judge2Vote === "A" ? 1 : 0);
    votesB = (battle.judge1Vote === "B" ? 1 : 0) + (battle.judge2Vote === "B" ? 1 : 0);
  }

  return (
    <div
      className={`relative w-[210px] rounded-xl border transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group ${
        isGrandFinal
          ? "bg-gradient-to-b from-[#1b1708]/95 via-[#120f06]/95 to-[#0b0a08]/95 border-amber-400/40 shadow-[0_4px_24px_rgba(251,191,36,0.12)] hover:border-amber-400/60 ring-1 ring-amber-400/20"
          : isSmallFinal
          ? "bg-gradient-to-b from-[#17100a]/95 via-[#100c08]/95 to-[#090807]/95 border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.08)] hover:border-orange-500/50"
          : "bg-[#0e0f13]/90 border-white/[0.08] hover:border-white/[0.2]"
      }`}
    >
      {/* Contender A Row */}
      <ContenderRow
        comp={compA}
        name={compAName}
        isWinner={isAWinner}
        isLoser={isALoser}
        isGrandFinal={isGrandFinal}
        votes={votesA}
      />

      {/* Subtle Hairline Row Divider */}
      <div className="h-[1px] bg-white/[0.05] w-full my-0.5" />

      {/* Contender B Row */}
      <ContenderRow
        comp={compB}
        name={compBName}
        isWinner={isBWinner}
        isLoser={isBLoser}
        isGrandFinal={isGrandFinal}
        votes={votesB}
      />
    </div>
  );
}

/**
 * Individual Contender Row inside a Match Card
 */
function ContenderRow({
  comp,
  name,
  isWinner,
  isLoser,
  isGrandFinal,
  votes,
}: {
  comp: BattleCompetitor | null;
  name: string;
  isWinner: boolean;
  isLoser: boolean;
  isGrandFinal: boolean;
  votes?: number;
}) {
  return (
    <div
      className={`relative flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
        isWinner
          ? isGrandFinal
            ? "bg-amber-400/[0.12] text-white"
            : "bg-emerald-400/[0.1] text-white"
          : isLoser
          ? "text-neutral-500"
          : "text-neutral-300"
      }`}
    >
      {/* Left Vertical Micro-Glow Accent Bar for Winner */}
      {isWinner && (
        <div
          className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-full ${
            isGrandFinal
              ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          }`}
        />
      )}

      {/* Left: Seed + Name */}
      <div className="flex items-center gap-2 min-w-0">
        {comp?.seed ? (
          <span
            className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded leading-none ${
              isWinner
                ? isGrandFinal
                  ? "bg-amber-400/20 text-amber-300"
                  : "bg-emerald-400/20 text-emerald-300"
                : "bg-white/[0.04] text-neutral-400"
            }`}
          >
            #{String(comp.seed).padStart(2, "0")}
          </span>
        ) : null}

        <span
          className={`text-xs truncate tracking-wide font-sans ${
            isWinner
              ? "font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
              : isLoser
              ? "text-neutral-500 font-normal"
              : "text-neutral-200 font-medium"
          }`}
        >
          {name || "TBD"}
        </span>
      </div>

      {/* Right: Vote Score / Crown Icon */}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
        {votes !== undefined && (
          <span
            className={`text-[10px] font-mono font-semibold px-1 rounded ${
              isWinner
                ? isGrandFinal
                  ? "text-amber-300 bg-amber-400/10"
                  : "text-emerald-300 bg-emerald-400/10"
                : "text-neutral-600"
            }`}
          >
            {votes}
          </span>
        )}
        {isWinner && (
          <Crown
            className={`w-3.5 h-3.5 ${
              isGrandFinal
                ? "text-amber-300 fill-amber-300/30 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                : "text-emerald-400 fill-emerald-400/30 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]"
            }`}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Smooth Cubic-Bezier SVG Connector Branch
 * Draws a flowing S-curve linking top & bottom feeder matches into the subsequent target match.
 */
function BezierConnector({
  height,
  topY,
  bottomY,
  targetY,
  topWon = false,
  bottomWon = false,
  width = 44,
}: {
  height: number;
  topY: number;
  bottomY: number;
  targetY: number;
  topWon?: boolean;
  bottomWon?: boolean;
  width?: number;
}) {
  const midX = width / 2;

  // Cubic Bezier paths:
  const topPath = `M 0 ${topY} C ${midX} ${topY}, ${midX} ${targetY}, ${width} ${targetY}`;
  const bottomPath = `M 0 ${bottomY} C ${midX} ${bottomY}, ${midX} ${targetY}, ${width} ${targetY}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible pointer-events-none flex-shrink-0"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <defs>
        <linearGradient id="bezier-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
        </linearGradient>
        <filter id="bezier-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#10B981" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* Inactive subtle track lines */}
      <path
        d={topPath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1.5"
      />
      <path
        d={bottomPath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1.5"
      />

      {/* Active advancing winner paths */}
      {topWon && (
        <path
          d={topPath}
          fill="none"
          stroke="url(#bezier-emerald)"
          strokeWidth="2.5"
          filter="url(#bezier-glow)"
          className="transition-all duration-500"
        />
      )}
      {bottomWon && (
        <path
          d={bottomPath}
          fill="none"
          stroke="url(#bezier-emerald)"
          strokeWidth="2.5"
          filter="url(#bezier-glow)"
          className="transition-all duration-500"
        />
      )}
    </svg>
  );
}

/**
 * Straight SVG Connector line to Champion Podium
 */
function StraightConnector({
  width = 44,
  height,
  y,
  isActive = false,
  secondY,
  isSecondActive = false,
}: {
  width?: number;
  height: number;
  y: number;
  isActive?: boolean;
  secondY?: number;
  isSecondActive?: boolean;
}) {
  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible pointer-events-none flex-shrink-0"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <defs>
        <filter id="straight-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FDE047" floodOpacity="0.8" />
        </filter>
        <filter id="straight-bronze-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F97316" floodOpacity="0.8" />
        </filter>
      </defs>
      {/* Primary Gold Line to Champion Podium */}
      <line
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={isActive ? "#FDE047" : "rgba(255, 255, 255, 0.08)"}
        strokeWidth={isActive ? 2.5 : 1.5}
        filter={isActive ? "url(#straight-gold-glow)" : undefined}
      />
      {/* Secondary Bronze Line to 3rd Place Podium */}
      {secondY !== undefined && (
        <line
          x1={0}
          y1={secondY}
          x2={width}
          y2={secondY}
          stroke={isSecondActive ? "#F97316" : "rgba(255, 255, 255, 0.08)"}
          strokeWidth={isSecondActive ? 2 : 1.5}
          filter={isSecondActive ? "url(#straight-bronze-glow)" : undefined}
        />
      )}
    </svg>
  );
}
