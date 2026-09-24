"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import {
  Trophy,
  Swords,
  Search,
  Check,
  Radio,
  Flame,
  Crown,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";

interface Participant {
  id: number;
  contenderNumber: string;
  name: string;
  status: string;
}

interface ScoreRecord {
  participantId: number;
  judgeId: string;
  scores: Record<string, number>;
  totalScore: number;
}

interface BattleCompetitor {
  id?: number;
  name: string;
  seed?: number;
}

interface BattleMatch {
  matchId: string;
  title: string;
  roundStage: "T16" | "QF" | "SF" | "FINAL";
  roundDurationText: string;
  competitorA: BattleCompetitor | null;
  competitorB: BattleCompetitor | null;
  winnerId?: number | null;
  winnerName?: string | null;
  nextMatchId?: string;
  nextMatchSlot?: "A" | "B";
}

export default function ChampionshipPublicPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"national" | "regional">("national");
  const [activeView, setActiveView] = useState<"eliminations" | "battles">("eliminations");
  const [bracketRoundFilter, setBracketRoundFilter] = useState<"ALL" | "T16" | "QF" | "SF" | "FINAL">("ALL");

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const res = await fetch("/api/championship/public", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to load championship data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);

    // Optimized 45-second auto-poll (only active when tab is visible to avoid burning requests)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchData(false);
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const currentCat = activeCategory === "national" ? data?.national : data?.regional;
  const participants: Participant[] = currentCat?.participants || [];
  const scores: ScoreRecord[] = currentCat?.eliminationScores || [];
  const battles: BattleMatch[] = currentCat?.battles || [];

  // Ranked Elimination Leaderboard
  const rankedParticipants = useMemo(() => {
    const list = participants.map((p) => {
      const j1 = scores.find(
        (s) => s.participantId === p.id && s.judgeId === "judge-1"
      )?.totalScore || 0;
      const j2 = scores.find(
        (s) => s.participantId === p.id && s.judgeId === "judge-2"
      )?.totalScore || 0;
      const combinedTotal = Math.round((j1 + j2) * 10) / 10;
      return {
        ...p,
        j1,
        j2,
        combinedTotal,
      };
    });

    list.sort((a, b) => {
      if (b.combinedTotal !== a.combinedTotal) {
        return b.combinedTotal - a.combinedTotal;
      }
      // If both are un-scored (0 points), preserve confirmed roster order
      if ((a.combinedTotal || 0) === 0 && (b.combinedTotal || 0) === 0) {
        return a.id - b.id;
      }
      // Tier 2: Highest peak judge score
      const maxA = Math.max(a.j1 || 0, a.j2 || 0);
      const maxB = Math.max(b.j1 || 0, b.j2 || 0);
      if (maxB !== maxA) {
        return maxB - maxA;
      }
      // Tier 3: Ascending alphabetical order by name
      const nameComp = (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      });
      if (nameComp !== 0) {
        return nameComp;
      }
      return a.id - b.id;
    });
    return list;
  }, [participants, scores]);

  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankedParticipants;
    const q = searchQuery.toLowerCase();
    return rankedParticipants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contenderNumber.toLowerCase().includes(q)
    );
  }, [rankedParticipants, searchQuery]);

  const qualifierCutoff = activeCategory === "national" ? 16 : 8;
  const judge1Name = data?.judges?.find((j: any) => j.id === "judge-1")?.name || "Nabinbe";
  const judge2Name = data?.judges?.find((j: any) => j.id === "judge-2")?.name || "Kevin";

  // Separate battles by stage
  const top16Battles = battles.filter((b) => b.roundStage === "T16");
  const quarterFinals = battles.filter((b) => b.roundStage === "QF");
  const semiFinals = battles.filter((b) => b.roundStage === "SF");
  const finalBattles = battles.filter((b) => b.roundStage === "FINAL");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-[#FDE047] selection:text-black">
      <Header />

      {/* Streamlined, High-Clarity Control Hub */}
      <section className="pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#151515] border-2 border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-[#FDE047] text-black font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" /> LIVE
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                {data?.title || "HBC 2026 Championship"}
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              {lastUpdated && (
                <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline-block">
                  Synced: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2e2e2e] border border-neutral-700/80 text-xs font-bold text-neutral-200 hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                title="Refresh latest scores and battles"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FDE047]" : "text-neutral-400"}`} />
                <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls: Clean Segmented Bar */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Division Switcher */}
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Division
              </span>
              <div className="bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 flex">
                <button
                  onClick={() => setActiveCategory("national")}
                  className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeCategory === "national"
                      ? "bg-[#FDE047] text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>National Division (25)</span>
                </button>
                <button
                  onClick={() => setActiveCategory("regional")}
                  className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeCategory === "regional"
                      ? "bg-[#FB7185] text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Regional Division (13)</span>
                </button>
              </div>
            </div>

            {/* Phase Switcher */}
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Tournament Stage
              </span>
              <div className="bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 flex">
                <button
                  onClick={() => setActiveView("eliminations")}
                  className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeView === "eliminations"
                      ? "bg-[#38BDF8] text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Elimination Leaderboard</span>
                </button>
                <button
                  onClick={() => setActiveView("battles")}
                  className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeView === "battles"
                      ? "bg-[#A78BFA] text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Battle Brackets</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-white border-t-transparent animate-spin rounded-full mb-3" />
            <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
              Syncing Scoreboard...
            </span>
          </div>
        ) : data && !data.isActive ? (
          <div className="border border-neutral-800 bg-[#161616] p-8 text-center max-w-md mx-auto rounded-2xl shadow-xl">
            <Trophy className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-base font-black uppercase text-white">Championship Standby</h3>
            <p className="text-neutral-400 text-xs mt-1">
              Live scores and matchups will go live as soon as the championship begins.
            </p>
          </div>
        ) : activeView === "eliminations" ? (
          /* ELIMINATION LEADERBOARD */
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-[#151515] border border-neutral-800 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-neutral-300 font-medium">
                Scoring Formula:{" "}
                <span className="text-white font-bold">{judge1Name} (/60)</span> +{" "}
                <span className="text-white font-bold">{judge2Name} (/60)</span> ={" "}
                <span className="bg-[#FDE047] text-black font-black px-1.5 py-0.5 rounded text-[11px]">
                  Total (/120)
                </span>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-neutral-700 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Scoreboard Table */}
            <div className="border border-neutral-800 bg-[#141414] overflow-hidden rounded-2xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#1c1c1c] text-neutral-300 font-bold text-[11px] uppercase tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4 w-28">Contender #</th>
                      <th className="py-3 px-4">Contender Name</th>
                      <th className="py-3 px-4 text-center w-28 font-mono">{judge1Name} (/60)</th>
                      <th className="py-3 px-4 text-center w-28 font-mono">{judge2Name} (/60)</th>
                      <th className="py-3 px-4 text-center w-36 font-mono text-white">Combined (/120)</th>
                      <th className="py-3 px-4 text-right w-44">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {filteredRankings.map((contender, index) => {
                      const rank = index + 1;
                      const isTopQualified = rank <= qualifierCutoff && contender.combinedTotal > 0;
                      const showCutoffLineAfter = rank === qualifierCutoff && filteredRankings.length > qualifierCutoff;

                      return (
                        <Fragment key={contender.id}>
                          <tr
                            className={`transition-colors ${
                              isTopQualified
                                ? "bg-emerald-950/15 hover:bg-emerald-950/30"
                                : "hover:bg-neutral-800/30"
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3 px-4 font-black text-sm">
                              {rank === 1 ? (
                                <span className="bg-[#FDE047] text-black px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1 shadow-sm">
                                  🥇 1
                                </span>
                              ) : rank === 2 ? (
                                <span className="bg-neutral-200 text-black px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1">
                                  🥈 2
                                </span>
                              ) : rank === 3 ? (
                                <span className="bg-[#f97316] text-black px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1">
                                  🥉 3
                                </span>
                              ) : isTopQualified ? (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold">
                                  #{rank}
                                </span>
                              ) : (
                                <span className="text-neutral-500 font-medium">#{rank}</span>
                              )}
                            </td>

                            {/* Contender # */}
                            <td className="py-3 px-4 font-mono font-bold text-neutral-400">
                              {contender.contenderNumber}
                            </td>

                            {/* Contender Name */}
                            <td className="py-3 px-4 font-bold text-white text-sm">
                              {contender.name}
                            </td>

                            {/* Judge 1 */}
                            <td className="py-3 px-4 text-center font-mono font-bold text-neutral-300">
                              {contender.j1 > 0 ? contender.j1.toFixed(1) : "—"}
                            </td>

                            {/* Judge 2 */}
                            <td className="py-3 px-4 text-center font-mono font-bold text-neutral-300">
                              {contender.j2 > 0 ? contender.j2.toFixed(1) : "—"}
                            </td>

                            {/* Combined Total */}
                            <td className="py-3 px-4 text-center font-mono font-black text-white text-sm">
                              {contender.combinedTotal > 0 ? (
                                <span className="bg-neutral-800 text-[#FDE047] px-2.5 py-1 rounded-md border border-neutral-700">
                                  {contender.combinedTotal.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-neutral-500">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-right">
                              {isTopQualified ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                  <Check className="w-3 h-3 stroke-[3]" /> Top {qualifierCutoff} Qualified
                                </span>
                              ) : contender.combinedTotal > 0 ? (
                                <span className="text-neutral-500 text-[11px] font-medium">
                                  Eliminated
                                </span>
                              ) : (
                                <span className="text-neutral-500 text-[11px] italic">
                                  Pending Score
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* Unmistakable Qualification Cutoff Divider Line */}
                          {showCutoffLineAfter && (
                            <tr key={`${contender.id}-cutoff`} className="bg-emerald-500/10 border-y-2 border-dashed border-emerald-500/60">
                              <td colSpan={7} className="py-2.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                                  <span>▲</span>
                                  <span>Top {qualifierCutoff} Qualify For Battle Tournament</span>
                                  <span className="hidden sm:inline">&bull; Contenders below are eliminated</span>
                                  <span>▲</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* BATTLE TOURNAMENT BRACKETS */
          <div className="space-y-6">
            {/* Stage Filter Tabs */}
            <div className="bg-[#151515] border border-neutral-800 p-3 sm:p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <Swords className="w-4 h-4 text-[#A78BFA]" />
                  {activeCategory === "national"
                    ? "National Championship Battles"
                    : "Regional Championship Battles"}
                </h2>
                <span className="text-xs text-neutral-400">
                  Head-to-head knockout matches with verified winner advancement.
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setBracketRoundFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    bracketRoundFilter === "ALL"
                      ? "bg-white text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  All Matches
                </button>
                {top16Battles.length > 0 && (
                  <button
                    onClick={() => setBracketRoundFilter("T16")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      bracketRoundFilter === "T16"
                        ? "bg-[#38BDF8] text-black font-black"
                        : "bg-[#202020] text-neutral-300 hover:text-white"
                    }`}
                  >
                    Top 16
                  </button>
                )}
                <button
                  onClick={() => setBracketRoundFilter("QF")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    bracketRoundFilter === "QF"
                      ? "bg-[#FDE047] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Top 8 (QF)
                </button>
                <button
                  onClick={() => setBracketRoundFilter("SF")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    bracketRoundFilter === "SF"
                      ? "bg-[#FB7185] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Top 4 (SF)
                </button>
                <button
                  onClick={() => setBracketRoundFilter("FINAL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    bracketRoundFilter === "FINAL"
                      ? "bg-[#4ADE80] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Finals
                </button>
              </div>
            </div>

            {/* STAGE 1: TOP 16 */}
            {top16Battles.length > 0 && (bracketRoundFilter === "ALL" || bracketRoundFilter === "T16") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] ring-2 ring-[#38BDF8]/30" />
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">
                      Stage 1: Top 16 Battles
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium bg-[#1e1e1e] border border-neutral-700/80 px-2.5 py-0.5 rounded-md">
                    8 Matches &bull; 1 min × 2 rounds &bull; Winners Advance to Top 8
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {top16Battles.map((battle) => (
                    <PublicBattleCard key={battle.matchId} battle={battle} />
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 2: TOP 8 QUARTER-FINALS */}
            {quarterFinals.length > 0 && (bracketRoundFilter === "ALL" || bracketRoundFilter === "QF") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FDE047] ring-2 ring-[#FDE047]/30" />
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">
                      Stage 2: Top 8 Quarter-Finals
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium bg-[#1e1e1e] border border-neutral-700/80 px-2.5 py-0.5 rounded-md">
                    4 Matches &bull; 1 min × 2 rounds &bull; Winners Advance to Top 4
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quarterFinals.map((battle) => (
                    <PublicBattleCard key={battle.matchId} battle={battle} />
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 3: TOP 4 SEMI-FINALS */}
            {semiFinals.length > 0 && (bracketRoundFilter === "ALL" || bracketRoundFilter === "SF") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185] ring-2 ring-[#FB7185]/30" />
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">
                      Stage 3: Top 4 Semi-Finals
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium bg-[#1e1e1e] border border-neutral-700/80 px-2.5 py-0.5 rounded-md">
                    2 Matches &bull; 1:30 min × 2 rounds &bull; Winners Advance to Grand Final
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semiFinals.map((battle) => (
                    <PublicBattleCard key={battle.matchId} battle={battle} />
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 4: FINALS & SMALL FINAL */}
            {finalBattles.length > 0 && (bracketRoundFilter === "ALL" || bracketRoundFilter === "FINAL") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] ring-2 ring-[#4ADE80]/30" />
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">
                      {activeCategory === "national"
                        ? "Stage 4: Grand Final & Small Final (3rd Place Battle)"
                        : "Stage 4: Regional Grand Final"}
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium bg-[#1e1e1e] border border-neutral-700/80 px-2.5 py-0.5 rounded-md">
                    Championship Deciders &bull; 1:30 min × 2 rounds
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finalBattles.map((battle) => (
                    <PublicBattleCard
                      key={battle.matchId}
                      battle={battle}
                      isGrandFinal={battle.matchId.includes("FINAL") && !battle.matchId.includes("THIRD")}
                      isSmallFinal={battle.matchId.includes("THIRD")}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Clean Modern Footer */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0a] py-6 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Hyderabad Beatbox Community. All rights reserved.</p>
      </footer>
    </div>
  );
}

/**
 * Head-to-Head VS Battle Card with Soothing, Distinct Outline Borders
 */
function PublicBattleCard({
  battle,
  isGrandFinal = false,
  isSmallFinal = false,
}: {
  battle: BattleMatch;
  isGrandFinal?: boolean;
  isSmallFinal?: boolean;
}) {
  const compA = battle.competitorA;
  const compB = battle.competitorB;
  const hasWinner = Boolean(battle.winnerId);
  const isAWinner = Boolean(hasWinner && battle.winnerId === compA?.id && compA?.id);
  const isBWinner = Boolean(hasWinner && battle.winnerId === compB?.id && compB?.id);
  const isALoser = Boolean(hasWinner && !isAWinner && compA);
  const isBLoser = Boolean(hasWinner && !isBWinner && compB);

  const getFullMatchTitle = () => {
    const id = battle.matchId;
    if (id === "T16-1") return "Top 16 Battle 1: Seed #1 vs #16";
    if (id === "T16-2") return "Top 16 Battle 2: Seed #2 vs #15";
    if (id === "T16-3") return "Top 16 Battle 3: Seed #3 vs #14";
    if (id === "T16-4") return "Top 16 Battle 4: Seed #4 vs #13";
    if (id === "T16-5") return "Top 16 Battle 5: Seed #5 vs #12";
    if (id === "T16-6") return "Top 16 Battle 6: Seed #6 vs #11";
    if (id === "T16-7") return "Top 16 Battle 7: Seed #7 vs #10";
    if (id === "T16-8") return "Top 16 Battle 8: Seed #8 vs #9";
    if (id === "QF1") return "Quarter-Final 1: Winner T16-1 vs T16-8";
    if (id === "QF2") return "Quarter-Final 2: Winner T16-2 vs T16-7";
    if (id === "QF3") return "Quarter-Final 3: Winner T16-3 vs T16-6";
    if (id === "QF4") return "Quarter-Final 4: Winner T16-4 vs T16-5";
    if (id === "SF1") return "Semi-Final 1: Winner QF1 vs QF4";
    if (id === "SF2") return "Semi-Final 2: Winner QF2 vs QF3";
    if (id === "FINAL") return "Grand Final: Championship Title Match";
    if (id === "THIRD_PLACE") return "Small Final: 3rd Place Battle (Bronze)";
    if (id === "RQF1") return "Regional QF 1: Seed #1 vs #8";
    if (id === "RQF2") return "Regional QF 2: Seed #2 vs #7";
    if (id === "RQF3") return "Regional QF 3: Seed #3 vs #6";
    if (id === "RQF4") return "Regional QF 4: Seed #4 vs #5";
    if (id === "RSF1") return "Regional Semi-Final 1";
    if (id === "RSF2") return "Regional Semi-Final 2";
    if (id === "RFINAL") return "Regional Grand Final";
    if (id === "RTHIRD_PLACE") return "Regional 3rd Place Battle";
    return battle.title || battle.matchId;
  };

  const getPlaceholder = (slot: "A" | "B") => {
    const id = battle.matchId;
    if (id === "QF1") return slot === "A" ? "Winner T16-1" : "Winner T16-8";
    if (id === "QF2") return slot === "A" ? "Winner T16-2" : "Winner T16-7";
    if (id === "QF3") return slot === "A" ? "Winner T16-3" : "Winner T16-6";
    if (id === "QF4") return slot === "A" ? "Winner T16-4" : "Winner T16-5";
    if (id === "SF1") return slot === "A" ? "Winner QF1" : "Winner QF4";
    if (id === "SF2") return slot === "A" ? "Winner QF2" : "Winner QF3";
    if (id === "FINAL") return slot === "A" ? "Winner SF1" : "Winner SF2";
    if (id === "THIRD_PLACE") return slot === "A" ? "Runner-up SF1" : "Runner-up SF2";
    return slot === "A" ? "Contender A" : "Contender B";
  };

  return (
    <div
      className={`border-2 rounded-2xl p-4 transition-all duration-200 shadow-lg ${
        isGrandFinal
          ? "bg-[#181818] border-[#FDE047]/70 shadow-[0_0_25px_rgba(253,224,71,0.12)] ring-1 ring-[#FDE047]/30"
          : hasWinner
          ? "bg-[#161616] border-neutral-600 hover:border-neutral-400"
          : "bg-[#151515] border-neutral-700 hover:border-neutral-500"
      }`}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-700">
        <div className="truncate pr-2">
          <span className="text-xs font-black uppercase text-white truncate block tracking-wide">
            {getFullMatchTitle()}
          </span>
        </div>
        <span className="text-[10px] bg-[#222222] border border-neutral-600 text-neutral-300 font-bold px-2.5 py-0.5 rounded-full shrink-0">
          {battle.roundDurationText}
        </span>
      </div>

      {/* Head-to-Head (VS) Side-by-Side Contender Presentation */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 sm:gap-3">
        {/* Contender A */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between min-h-[78px] transition-all ${
            isAWinner
              ? "bg-emerald-950/40 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
              : isALoser
              ? "bg-[#111111] border border-neutral-800 text-neutral-500 opacity-40 line-through"
              : compA
              ? "bg-[#1f1f1f] border border-neutral-600 text-white shadow-sm"
              : "bg-[#101010] border border-dashed border-neutral-700 text-neutral-500"
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              {compA?.seed ? `Seed #${compA.seed}` : "Slot A"}
            </span>
            {isAWinner && (
              <span className="bg-emerald-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Crown className="w-2.5 h-2.5" /> Winner
              </span>
            )}
          </div>
          <span className={`text-xs sm:text-sm font-bold truncate ${isAWinner ? "text-emerald-300 font-black" : ""}`}>
            {compA?.name || getPlaceholder("A")}
          </span>
        </div>

        {/* Central VS Badge */}
        <div className="flex flex-col items-center justify-center">
          <span className="bg-[#242424] text-neutral-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-neutral-600 uppercase shadow-sm">
            VS
          </span>
        </div>

        {/* Contender B */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between min-h-[78px] transition-all ${
            isBWinner
              ? "bg-emerald-950/40 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
              : isBLoser
              ? "bg-[#111111] border border-neutral-800 text-neutral-500 opacity-40 line-through"
              : compB
              ? "bg-[#1f1f1f] border border-neutral-600 text-white shadow-sm"
              : "bg-[#101010] border border-dashed border-neutral-700 text-neutral-500"
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              {compB?.seed ? `Seed #${compB.seed}` : "Slot B"}
            </span>
            {isBWinner && (
              <span className="bg-emerald-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Crown className="w-2.5 h-2.5" /> Winner
              </span>
            )}
          </div>
          <span className={`text-xs sm:text-sm font-bold truncate ${isBWinner ? "text-emerald-300 font-black" : ""}`}>
            {compB?.name || getPlaceholder("B")}
          </span>
        </div>
      </div>

      {/* Advancement / Match Status Footer */}
      <div className="mt-3 pt-2.5 border-t border-neutral-700 flex items-center justify-between text-[11px]">
        {hasWinner ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>
                {isSmallFinal ? "3rd Place Winner: " : isGrandFinal ? "Champion: " : "Winner: "}
                <strong className="text-white">{battle.winnerName}</strong>
              </span>
            </span>
            {battle.nextMatchId && (
              <span className="text-neutral-400 text-[10px] font-medium flex items-center gap-1">
                Advances to <strong className="text-[#A78BFA]">{battle.nextMatchId}</strong> <ArrowRight className="w-3 h-3" />
              </span>
            )}
            {isGrandFinal && (
              <span className="bg-[#FDE047] text-black font-black text-[9px] px-2 py-0.5 rounded uppercase">
                🥇 HBC 2026 Champion
              </span>
            )}
            {isSmallFinal && (
              <span className="bg-[#f97316] text-black font-black text-[9px] px-2 py-0.5 rounded uppercase">
                🥉 3rd Place Winner
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-neutral-400 text-[10px]">
            <span>{compA && compB ? "Ready for battle" : "Awaiting previous match"}</span>
            <span className="uppercase font-mono text-neutral-500">{battle.matchId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
