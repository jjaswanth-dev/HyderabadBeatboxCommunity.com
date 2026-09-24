"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import {
  Trophy,
  Swords,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  Save,
  Share2,
  Users,
  Flame,
  Search,
  Crown,
  RotateCcw,
  Trash2,
  ArrowRight,
} from "lucide-react";

interface Judge {
  id: string;
  name: string;
  secretToken: string;
  isActive: boolean;
}

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
  notes?: string;
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
  judge1Vote?: "A" | "B" | null;
  judge2Vote?: "A" | "B" | null;
  nextMatchId?: string;
  nextMatchSlot?: "A" | "B";
}

export default function ChampionshipManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState("Hyderabad Beatbox Championship 2026");
  const [activeStage, setActiveStage] = useState<"eliminations" | "battles" | "both">("both");
  const [judges, setJudges] = useState<Judge[]>([]);

  const [activeCategory, setActiveCategory] = useState<"national" | "regional">("national");
  const [activeView, setActiveView] = useState<"eliminations" | "battles">("eliminations");
  const [adminBattleFilter, setAdminBattleFilter] = useState<"ALL" | "T16" | "QF" | "SF" | "FINAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [national, setNational] = useState<{
    participants: Participant[];
    eliminationScores: ScoreRecord[];
    battles: BattleMatch[];
  }>({ participants: [], eliminationScores: [], battles: [] });

  const [regional, setRegional] = useState<{
    participants: Participant[];
    eliminationScores: ScoreRecord[];
    battles: BattleMatch[];
  }>({ participants: [], eliminationScores: [], battles: [] });

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/championship/admin", {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load championship admin data");
      }

      const data = await res.json();
      setIsActive(data.isActive !== undefined ? data.isActive : true);
      setTitle(data.title || "Hyderabad Beatbox Championship 2026");
      setActiveStage(data.activeStage || "both");
      setJudges(data.judges || []);
      setNational({
        participants: data.national?.participants || [],
        eliminationScores: data.national?.eliminationScores || [],
        battles: data.national?.battles || [],
      });
      setRegional({
        participants: data.regional?.participants || [],
        eliminationScores: data.regional?.eliminationScores || [],
        battles: data.regional?.battles || [],
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/championship/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          action: "update_settings",
          isActive,
          title,
          activeStage,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setFeedback({ type: "success", text: "Championship settings saved successfully!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateToken = async (judgeId: string) => {
    if (!confirm(`Are you sure you want to regenerate the secret link for ${judgeId}? The old link will stop working.`)) return;
    try {
      const res = await fetch("/api/championship/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          action: "regenerate_token",
          judgeId,
        }),
      });
      if (!res.ok) throw new Error("Failed to regenerate token");
      const data = await res.json();
      setJudges(data.judges);
      setFeedback({ type: "success", text: `New link generated for ${judgeId}` });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  const copyJudgeLink = (token: string, judgeName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/judge/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(judgeName);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const shareJudgeLinkWhatsApp = (token: string, judgeName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/judge/${token}`;
    const text = encodeURIComponent(
      `Hello ${judgeName}! Here is your official private scorecard link for the Hyderabad Beatbox Championship 2026: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleSeedBattles = async () => {
    const qualifierCount = activeCategory === "national" ? 16 : 8;
    if (
      !confirm(
        `This will calculate all elimination scores for ${activeCategory.toUpperCase()} category, rank the beatboxers, and automatically seed the Top ${qualifierCount} into the battle tournament bracket. Proceed?`
      )
    )
      return;

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/championship/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          action: "seed_battles",
          category: activeCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to seed battles");
      const data = await res.json();

      if (activeCategory === "national") {
        setNational((prev) => ({ ...prev, battles: data.battles }));
      } else {
        setRegional((prev) => ({ ...prev, battles: data.battles }));
      }

      setFeedback({
        type: "success",
        text: `Top ${qualifierCount} successfully seeded into the battle bracket!`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async (targetCategory: "national" | "regional" | "all") => {
    const label = targetCategory === "all" ? "ALL (National & Regional)" : targetCategory.toUpperCase();
    const confirmed = confirm(
      `⚠️ RESET TEST DATA FOR EVENT DAY\n\nThis will permanently delete ALL elimination judge scores and reset ALL battle brackets back to clean unseeded matches for ${label}.\n\nAre you sure you want to clear test data for event day?`
    );
    if (!confirmed) return;

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/championship/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          action: "clear_data",
          category: targetCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to clear championship data");
      const data = await res.json();

      if (data.championship) {
        setNational(data.championship.national);
        setRegional(data.championship.regional);
      }

      setFeedback({
        type: "success",
        text: `✓ Successfully cleared ${label} data! Scoreboards and brackets are now fresh for the live event.`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSetBattleWinner = async (
    matchId: string,
    winnerId: number,
    winnerName: string
  ) => {
    try {
      const res = await fetch("/api/championship/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          action: "set_battle_winner",
          category: activeCategory,
          matchId,
          winnerId,
          winnerName,
        }),
      });

      if (!res.ok) throw new Error("Failed to set battle winner");
      const data = await res.json();

      if (activeCategory === "national") {
        setNational((prev) => ({ ...prev, battles: data.battles }));
      } else {
        setRegional((prev) => ({ ...prev, battles: data.battles }));
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  const currentCategoryData = activeCategory === "national" ? national : regional;
  const currentParticipants = currentCategoryData.participants;
  const currentScores = currentCategoryData.eliminationScores;
  const currentBattles = currentCategoryData.battles;

  const rankedContenders = useMemo(() => {
    const list = currentParticipants.map((p) => {
      const j1 = currentScores.find(
        (s) => s.participantId === p.id && s.judgeId === "judge-1"
      )?.totalScore || 0;
      const j2 = currentScores.find(
        (s) => s.participantId === p.id && s.judgeId === "judge-2"
      )?.totalScore || 0;
      const total = Math.round((j1 + j2) * 10) / 10;
      return {
        ...p,
        j1Score: j1,
        j2Score: j2,
        combinedTotal: total,
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
      const maxA = Math.max(a.j1Score || 0, a.j2Score || 0);
      const maxB = Math.max(b.j1Score || 0, b.j2Score || 0);
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
  }, [currentParticipants, currentScores]);

  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankedContenders;
    const q = searchQuery.toLowerCase();
    return rankedContenders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contenderNumber.toLowerCase().includes(q)
    );
  }, [rankedContenders, searchQuery]);

  const qualifierThreshold = activeCategory === "national" ? 16 : 8;
  const judge1Name = judges.find((j) => j.id === "judge-1")?.name || "Nabinbe";
  const judge2Name = judges.find((j) => j.id === "judge-2")?.name || "Kevin";

  // Split battles by stage
  const top16Battles = currentBattles.filter((b) => b.roundStage === "T16");
  const quarterFinals = currentBattles.filter((b) => b.roundStage === "QF");
  const semiFinals = currentBattles.filter((b) => b.roundStage === "SF");
  const finalBattles = currentBattles.filter((b) => b.roundStage === "FINAL");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <div className="border-3 border-white border-t-transparent w-8 h-8 animate-spin rounded-full mb-3" />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Loading Championship Engine...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-white selection:bg-[#FDE047] selection:text-black">
      {/* Top Header Card matching Public View */}
      <div className="bg-[#151515] border-2 border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-[#FDE047] text-black font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Crown className="w-3.5 h-3.5" /> ADMIN CONTROLLER
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2e2e2e] border border-neutral-700/80 text-xs font-bold text-neutral-200 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Refresh latest scores and battles"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FDE047]" : "text-neutral-400"}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Division & Phase Switcher Controls matching Public View */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Division Switcher */}
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Division
            </span>
            <div className="bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 flex">
              <button
                type="button"
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
                type="button"
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

          {/* View Phase Switcher */}
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Admin View Mode
            </span>
            <div className="bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 flex">
              <button
                type="button"
                onClick={() => setActiveView("eliminations")}
                className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeView === "eliminations"
                    ? "bg-[#38BDF8] text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Elimination Scoreboard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("battles")}
                className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeView === "battles"
                    ? "bg-[#A78BFA] text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Battle Bracket Controller</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Bar: Auto-Seed & Clear Data Controls */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSeedBattles}
              disabled={saving}
              className="px-4 py-2 bg-[#38BDF8] hover:bg-sky-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              title="Seed ranked qualifiers into battle bracket"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Auto-Seed Top {qualifierThreshold} Battles</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleClearData(activeCategory)}
              disabled={saving}
              className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              title={`Reset all scores and battle matches for ${activeCategory.toUpperCase()}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear {activeCategory.toUpperCase()} Data</span>
            </button>

            <button
              type="button"
              onClick={() => handleClearData("all")}
              disabled={saving}
              className="px-3 py-2 bg-[#1f1f1f] hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700/80 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              title="Reset all categories to fresh unseeded state"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs font-bold uppercase flex items-center justify-between rounded-xl shadow-md ${
            feedback.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50"
              : "bg-rose-950/40 text-rose-300 border-rose-500/50"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-black text-sm px-2">
            ✕
          </button>
        </div>
      )}

      {/* Public Hub Settings Card */}
      <div className="bg-[#151515] border border-neutral-800 p-5 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-black text-white pb-2 border-b border-neutral-800 flex items-center gap-2">
          Public Website Visibility Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#101010] border border-neutral-800 p-3.5 flex items-center justify-between rounded-xl">
            <div>
              <div className="text-xs font-bold text-white">Championship Hub Active</div>
              <div className="text-[11px] text-neutral-400">
                Show &apos;/championship&apos; page & header nav
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FDE047] peer-checked:after:bg-black"></div>
            </label>
          </div>

          <div className="bg-[#101010] border border-neutral-800 p-3.5 rounded-xl">
            <div className="text-xs font-bold text-white mb-1">Public Stage Visibility</div>
            <select
              value={activeStage}
              onChange={(e: any) => setActiveStage(e.target.value)}
              className="w-full bg-[#161616] border border-neutral-700 p-2 text-xs text-white font-medium rounded-lg focus:outline-none focus:border-white"
            >
              <option value="eliminations">Elimination Leaderboard Only</option>
              <option value="battles">Battle Brackets Only</option>
              <option value="both">Both Leaderboard & Battles</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Public Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Judge Isolated Scorecard Links Management */}
      <div className="bg-[#151515] border border-neutral-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FDE047]" /> Isolated Judge Scorecard Links
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Send each judge their isolated scorecard link. Judge 1 cannot view or modify Judge 2&apos;s scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {judges.map((judge) => {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const judgeUrl = `${origin}/judge/${judge.secretToken}`;
            const isCopied = copiedLink === judge.name;

            return (
              <div
                key={judge.id}
                className="bg-[#101010] border border-neutral-800 p-4 space-y-3 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    {judge.name}
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-[#FDE047] text-black rounded-md">
                    Isolated Link
                  </span>
                </div>

                <div className="bg-[#161616] border border-neutral-800 p-2.5 text-[11px] text-neutral-300 break-all select-all font-mono rounded-lg">
                  {judgeUrl}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyJudgeLink(judge.secretToken, judge.name)}
                    className="flex-1 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => shareJudgeLinkWhatsApp(judge.secretToken, judge.name)}
                    className="py-1.5 px-3 bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp
                  </button>

                  <a
                    href={`/judge/${judge.secretToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-[#242424] hover:bg-[#303030] text-white rounded-lg transition-colors"
                    title="Open Scorecard"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRegenerateToken(judge.id)}
                    className="p-1.5 bg-[#242424] hover:bg-[#303030] text-neutral-400 hover:text-white rounded-lg transition-colors"
                    title="Regenerate Secret Token"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main View Area: Elimination Leaderboard or Battle Brackets */}
      {activeView === "eliminations" ? (
        /* ELIMINATION LEADERBOARD (MATCHING PUBLIC UI) */
        <div className="space-y-4">
          <div className="bg-[#151515] border border-neutral-800 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-neutral-300 font-medium">
              Formula: <span className="text-white font-bold">{judge1Name} (/60.0)</span> +{" "}
              <span className="text-white font-bold">{judge2Name} (/60.0)</span> ={" "}
              <span className="bg-[#FDE047] text-black font-black px-1.5 py-0.5 rounded text-[11px]">
                Total (/120.0)
              </span>
            </div>

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
                    <th className="py-3 px-4 text-right w-44">Battle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredRankings.map((contender, index) => {
                    const rank = index + 1;
                    const isTopQualified = rank <= qualifierThreshold && contender.combinedTotal > 0;
                    const showCutoffLineAfter =
                      rank === qualifierThreshold && filteredRankings.length > qualifierThreshold;

                    return (
                      <Fragment key={contender.id}>
                        <tr
                          className={`transition-colors ${
                            isTopQualified
                              ? "bg-emerald-950/15 hover:bg-emerald-950/30"
                              : "hover:bg-neutral-800/30"
                          }`}
                        >
                          {/* Rank with Medal Badges */}
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

                          <td className="py-3 px-4 font-mono font-bold text-neutral-400">
                            {contender.contenderNumber}
                          </td>

                          <td className="py-3 px-4 font-bold text-white text-sm">
                            {contender.name}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-neutral-300">
                            {contender.j1Score > 0 ? contender.j1Score.toFixed(1) : "—"}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-neutral-300">
                            {contender.j2Score > 0 ? contender.j2Score.toFixed(1) : "—"}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-black text-white text-sm">
                            {contender.combinedTotal > 0 ? (
                              <span className="bg-neutral-800 text-[#FDE047] px-2.5 py-1 rounded-md border border-neutral-700">
                                {contender.combinedTotal.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-neutral-500">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isTopQualified ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" /> Top {qualifierThreshold} Qualified
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

                        {/* Cutoff Divider Line matching Public View */}
                        {showCutoffLineAfter && (
                          <tr key={`${contender.id}-cutoff`} className="bg-emerald-500/10 border-y-2 border-dashed border-emerald-500/60">
                            <td colSpan={7} className="py-2.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                                <span>▲</span>
                                <span>Top {qualifierThreshold} Qualify For Battle Tournament</span>
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
        /* BATTLE BRACKET CONTROLLER (MATCHING PUBLIC UI WITH WINNER SELECTION) */
        <div className="space-y-6">
          {/* Stage Filter Tabs matching Public UI */}
          <div className="bg-[#151515] border border-neutral-800 p-3 sm:p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wide flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#A78BFA]" />
                {activeCategory === "national"
                  ? "National Battle Controller"
                  : "Regional Battle Controller"}
              </h2>
              <span className="text-xs text-neutral-400">
                Pick official winners to automatically advance contenders through the bracket.
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAdminBattleFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  adminBattleFilter === "ALL"
                    ? "bg-white text-black font-black"
                    : "bg-[#202020] text-neutral-300 hover:text-white"
                }`}
              >
                All Matches
              </button>
              {top16Battles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAdminBattleFilter("T16")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    adminBattleFilter === "T16"
                      ? "bg-[#38BDF8] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Top 16
                </button>
              )}
              <button
                type="button"
                onClick={() => setAdminBattleFilter("QF")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  adminBattleFilter === "QF"
                    ? "bg-[#FDE047] text-black font-black"
                    : "bg-[#202020] text-neutral-300 hover:text-white"
                }`}
              >
                Top 8 (QF)
              </button>
              <button
                type="button"
                onClick={() => setAdminBattleFilter("SF")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  adminBattleFilter === "SF"
                    ? "bg-[#FB7185] text-black font-black"
                    : "bg-[#202020] text-neutral-300 hover:text-white"
                }`}
              >
                Top 4 (SF)
              </button>
              <button
                type="button"
                onClick={() => setAdminBattleFilter("FINAL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  adminBattleFilter === "FINAL"
                    ? "bg-[#4ADE80] text-black font-black"
                    : "bg-[#202020] text-neutral-300 hover:text-white"
                }`}
              >
                Finals
              </button>
            </div>
          </div>

          {/* STAGE 1: TOP 16 */}
          {top16Battles.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "T16") && (
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
                  <AdminPublicStyleBattleCard
                    key={battle.matchId}
                    battle={battle}
                    onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STAGE 2: TOP 8 QUARTER-FINALS */}
          {quarterFinals.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "QF") && (
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
                  <AdminPublicStyleBattleCard
                    key={battle.matchId}
                    battle={battle}
                    onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: TOP 4 SEMI-FINALS */}
          {semiFinals.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "SF") && (
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
                  <AdminPublicStyleBattleCard
                    key={battle.matchId}
                    battle={battle}
                    onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STAGE 4: FINALS & SMALL FINAL */}
          {finalBattles.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "FINAL") && (
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
                  <AdminPublicStyleBattleCard
                    key={battle.matchId}
                    battle={battle}
                    isGrandFinal={battle.matchId.includes("FINAL") && !battle.matchId.includes("THIRD")}
                    isSmallFinal={battle.matchId.includes("THIRD")}
                    onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Admin Battle Card identical to PublicBattleCard but with integrated Pick Winner actions
 */
function AdminPublicStyleBattleCard({
  battle,
  isGrandFinal = false,
  isSmallFinal = false,
  onPickWinner,
  judge1Name = "Nabinbe",
  judge2Name = "Kevin",
}: {
  battle: BattleMatch;
  isGrandFinal?: boolean;
  isSmallFinal?: boolean;
  onPickWinner: (id: number, name: string) => void;
  judge1Name?: string;
  judge2Name?: string;
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

      {/* Head-to-Head (VS) Side-by-Side Contenders */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5 sm:gap-3">
        {/* Contender A */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between min-h-[95px] transition-all ${
            isAWinner
              ? "bg-emerald-950/40 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
              : isALoser
              ? "bg-[#111111] border border-neutral-800 text-neutral-500 opacity-40 line-through"
              : compA
              ? "bg-[#1f1f1f] border border-neutral-600 text-white shadow-sm"
              : "bg-[#101010] border border-dashed border-neutral-700 text-neutral-500"
          }`}
        >
          <div>
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
            <span className={`text-xs sm:text-sm font-bold truncate block ${isAWinner ? "text-emerald-300 font-black" : ""}`}>
              {compA?.name || getPlaceholder("A")}
            </span>
          </div>

          {compA && (
            <button
              type="button"
              onClick={() => onPickWinner(compA.id!, compA.name)}
              className={`mt-2.5 w-full py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                isAWinner
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-[#252525] border border-neutral-600 hover:bg-white hover:text-black text-white"
              }`}
            >
              {isAWinner ? "✓ Confirmed Winner" : "Pick Winner A"}
            </button>
          )}
        </div>

        {/* Central VS Badge */}
        <div className="flex flex-col items-center justify-center">
          <span className="bg-[#242424] text-neutral-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-neutral-600 uppercase shadow-sm">
            VS
          </span>
        </div>

        {/* Contender B */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between min-h-[95px] transition-all ${
            isBWinner
              ? "bg-emerald-950/40 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
              : isBLoser
              ? "bg-[#111111] border border-neutral-800 text-neutral-500 opacity-40 line-through"
              : compB
              ? "bg-[#1f1f1f] border border-neutral-600 text-white shadow-sm"
              : "bg-[#101010] border border-dashed border-neutral-700 text-neutral-500"
          }`}
        >
          <div>
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
            <span className={`text-xs sm:text-sm font-bold truncate block ${isBWinner ? "text-emerald-300 font-black" : ""}`}>
              {compB?.name || getPlaceholder("B")}
            </span>
          </div>

          {compB && (
            <button
              type="button"
              onClick={() => onPickWinner(compB.id!, compB.name)}
              className={`mt-2.5 w-full py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                isBWinner
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-[#252525] border border-neutral-600 hover:bg-white hover:text-black text-white"
              }`}
            >
              {isBWinner ? "✓ Confirmed Winner" : "Pick Winner B"}
            </button>
          )}
        </div>
      </div>

      {/* Advancement & Judge Votes Footer */}
      <div className="mt-3 pt-2.5 border-t border-neutral-700 flex flex-col gap-1.5 text-[11px]">
        <div className="flex items-center justify-between text-[10px] text-neutral-400">
          <span>
            {judge1Name}: <strong className="text-white">{battle.judge1Vote ? `Comp ${battle.judge1Vote}` : "—"}</strong>
          </span>
          <span>
            {judge2Name}: <strong className="text-white">{battle.judge2Vote ? `Comp ${battle.judge2Vote}` : "—"}</strong>
          </span>
        </div>

        {hasWinner ? (
          <div className="flex items-center justify-between w-full pt-1">
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
          <div className="flex items-center justify-between w-full text-neutral-400 text-[10px] pt-1">
            <span>{compA && compB ? "Ready for decision" : "Awaiting previous round"}</span>
            <span className="uppercase font-mono text-neutral-500">{battle.matchId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
