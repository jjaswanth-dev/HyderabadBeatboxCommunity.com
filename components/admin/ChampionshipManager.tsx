"use client";

import { useState, useEffect, useCallback } from "react";
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
  Award,
  ChevronRight,
  ListOrdered,
  RotateCcw,
  Trash2,
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
  const [adminBattleFilter, setAdminBattleFilter] = useState<"ALL" | "T16" | "QF" | "SF" | "FINAL">("ALL");

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

  const rankedContenders = currentParticipants.map((p) => {
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

  rankedContenders.sort((a, b) => b.combinedTotal - a.combinedTotal);
  const qualifierThreshold = activeCategory === "national" ? 16 : 8;

  // Split battles by stage
  const top16Battles = currentBattles.filter((b) => b.roundStage === "T16");
  const quarterFinals = currentBattles.filter((b) => b.roundStage === "QF");
  const semiFinals = currentBattles.filter((b) => b.roundStage === "SF");
  const finalBattles = currentBattles.filter((b) => b.roundStage === "FINAL");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <div className="border-4 border-white border-t-transparent w-10 h-10 animate-spin mb-4" />
        <div className="bg-[#1e1e1e] border-2 border-white px-4 py-2 text-xs font-mono font-bold uppercase">
          LOADING CHAMPIONSHIP ENGINE...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-white selection:bg-white selection:text-black">
      {/* Top Banner in Dark Grey & White Neubrutalism */}
      <div className="border-4 border-white bg-[#181818] p-6 shadow-[8px_8px_0px_0px_#ffffff] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-white text-black font-black text-xs px-2.5 py-0.5 border border-black uppercase tracking-wider inline-block rounded-md">
            CHAMPIONSHIP MANAGER
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-2 tracking-tight">
            HBC 2026 SCORING & TOURNAMENT ENGINE
          </h2>
          <p className="text-neutral-400 text-xs mt-1">
            Manage isolated judge access links, monitor elimination rankings, auto-seed battles, and control winner progression.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-black border-2 border-white hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#ffffff] transition-all flex items-center gap-2 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" /> REFRESH SCORES
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 border-3 text-xs font-black uppercase flex items-center justify-between shadow-[4px_4px_0px_0px_#ffffff] rounded-xl ${
            feedback.type === "success"
              ? "bg-white text-black border-white"
              : "bg-black text-white border-white"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-black text-sm px-2">
            ✕
          </button>
        </div>
      )}

      {/* Global Settings & Public Visibility Controls */}
      <div className="border-3 border-white bg-[#181818] p-6 shadow-[6px_6px_0px_0px_#ffffff] space-y-5 rounded-2xl">
        <h3 className="text-xs uppercase tracking-widest font-black text-white border-b-2 border-white pb-2 flex items-center gap-2">
          PUBLIC WEBSITE SETTINGS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Active Switch */}
          <div className="bg-[#121212] border-2 border-white p-4 flex items-center justify-between rounded-xl">
            <div>
              <div className="text-xs font-black uppercase text-white">CHAMPIONSHIP HUB</div>
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
              <div className="w-12 h-6 bg-neutral-800 peer-focus:outline-none border-2 border-white peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black rounded-full"></div>
            </label>
          </div>

          {/* Active Stage Selector */}
          <div className="bg-[#121212] border-2 border-white p-4 rounded-xl">
            <div className="text-xs font-black uppercase text-white mb-1.5">PUBLIC STAGE VISIBILITY</div>
            <select
              value={activeStage}
              onChange={(e: any) => setActiveStage(e.target.value)}
              className="w-full bg-black border-2 border-white p-2 text-xs text-white font-black uppercase focus:outline-none rounded-lg"
            >
              <option value="eliminations">Elimination Leaderboard Only</option>
              <option value="battles">Battle Brackets Only</option>
              <option value="both">Both Leaderboard & Battles</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex items-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-3 bg-white text-black border-2 border-black hover:bg-neutral-200 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#888888] transition-all flex items-center justify-center gap-2 rounded-xl"
            >
              <Save className="w-4 h-4" /> {saving ? "SAVING..." : "SAVE PUBLIC SETTINGS"}
            </button>
          </div>
        </div>
      </div>

      {/* Judge Isolated Links Management */}
      <div className="border-3 border-white bg-[#181818] p-6 shadow-[6px_6px_0px_0px_#ffffff] space-y-4 rounded-2xl">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" /> JUDGE ISOLATED SCORECARD LINKS
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Give each judge their specific private link. Judges open these links on their phones directly without any login password.
            Judge 1 cannot see or alter Judge 2&apos;s scores!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {judges.map((judge) => {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const judgeUrl = `${origin}/judge/${judge.secretToken}`;
            const isCopied = copiedLink === judge.name;

            return (
              <div
                key={judge.id}
                className="bg-[#141414] border-2 border-white p-4 space-y-3 shadow-[4px_4px_0px_0px_#ffffff] rounded-xl"
              >
                <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-2">
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    {judge.name}
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-white text-black border border-black rounded-md">
                    ISOLATED LINK
                  </span>
                </div>

                <div className="bg-black border-2 border-neutral-600 p-2.5 text-[11px] text-neutral-300 break-all select-all font-mono rounded-lg">
                  {judgeUrl}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => copyJudgeLink(judge.secretToken, judge.name)}
                    className="flex-1 py-2 bg-white text-black border border-black hover:bg-neutral-200 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#888888] rounded-lg"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> COPIED!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> COPY LINK
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => shareJudgeLinkWhatsApp(judge.secretToken, judge.name)}
                    className="py-2 px-3 bg-[#242424] border border-white hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded-lg"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WHATSAPP
                  </button>

                  <a
                    href={`/judge/${judge.secretToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#242424] border border-white hover:bg-white hover:text-black text-white transition-colors rounded-lg"
                    title="Open Scorecard"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleRegenerateToken(judge.id)}
                    className="p-2 bg-[#242424] border border-white hover:bg-white hover:text-black text-neutral-400 hover:text-black transition-colors rounded-lg"
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

      {/* Category Tabs: National vs Regional & Auto-Seed Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b-2 border-white pb-5">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveCategory("national")}
            className={`px-5 py-3 border-3 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl ${
              activeCategory === "national"
                ? "bg-[#FDE047] text-black border-black shadow-[4px_4px_0px_0px_#ffffff] font-black"
                : "bg-[#141414] text-neutral-300 border-neutral-700 hover:border-white"
            }`}
          >
            <Trophy className="w-4 h-4" /> NATIONAL (25 CONTENDERS)
          </button>

          <button
            onClick={() => setActiveCategory("regional")}
            className={`px-5 py-3 border-3 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl ${
              activeCategory === "regional"
                ? "bg-[#FB7185] text-black border-black shadow-[4px_4px_0px_0px_#ffffff] font-black"
                : "bg-[#141414] text-neutral-300 border-neutral-700 hover:border-white"
            }`}
          >
            <Users className="w-4 h-4" /> REGIONAL (16 CONTENDERS)
          </button>
        </div>

        {/* Action Controls: Auto-Seed & Clear Test Data */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedBattles}
            disabled={saving}
            className="px-5 py-3 bg-[#38BDF8] text-black border-3 border-black hover:bg-sky-300 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#ffffff] transition-all flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 rounded-xl cursor-pointer"
            title="Click once after both judges finish scoring eliminations"
          >
            <Swords className="w-4 h-4 text-black" />
            <span>AUTO-SEED TOP {qualifierThreshold} BATTLES</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleClearData(activeCategory)}
              disabled={saving}
              className="px-4 py-3 bg-[#e11d48] text-white border-3 border-black hover:bg-rose-600 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#ffffff] transition-all flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 rounded-xl cursor-pointer"
              title={`Reset all scores and battle progression for ${activeCategory.toUpperCase()}`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>CLEAR {activeCategory.toUpperCase()} DATA</span>
            </button>

            <button
              onClick={() => handleClearData("all")}
              disabled={saving}
              className="px-3.5 py-3 bg-[#242424] text-neutral-300 hover:text-white hover:bg-neutral-800 border-2 border-neutral-700 hover:border-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-xl cursor-pointer"
              title="Reset both National and Regional divisions to fresh unseeded state"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>CLEAR ALL</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: MASTER ELIMINATION SCOREBOARD TABLE */}
      <div className="border-3 border-white bg-[#181818] p-6 shadow-[6px_6px_0px_0px_#ffffff] space-y-4 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b-2 border-white pb-3">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-white" /> MASTER ELIMINATION SCOREBOARD (COMBINED)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Rankings update automatically as Judge 1 and Judge 2 score. Top {qualifierThreshold} advance to Battles.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-neutral-300">
            QUALIFYING THRESHOLD: <strong className="bg-white text-black px-1.5 py-0.5 rounded-md">TOP {qualifierThreshold}</strong>
          </div>
        </div>

        <div className="overflow-x-auto border-2 border-white rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-white text-black uppercase font-mono text-[10px] tracking-wider border-b-2 border-black">
              <tr>
                <th className="py-3 px-4 border-r-2 border-black">RANK</th>
                <th className="py-3 px-4 border-r-2 border-black">CONTENDER #</th>
                <th className="py-3 px-4 border-r-2 border-black">CONTENDER NAME</th>
                <th className="py-3 px-4 text-center border-r-2 border-black">JUDGE 1 (/60)</th>
                <th className="py-3 px-4 text-center border-r-2 border-black">JUDGE 2 (/60)</th>
                <th className="py-3 px-4 text-center border-r-2 border-black font-black">COMBINED TOTAL (/120)</th>
                <th className="py-3 px-4 text-right">BATTLE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-700">
              {rankedContenders.map((contender, idx) => {
                const rank = idx + 1;
                const isQualified = rank <= qualifierThreshold && contender.combinedTotal > 0;

                return (
                  <tr
                    key={contender.id}
                    className={`transition-colors ${
                      isQualified
                        ? "bg-[#222222] hover:bg-[#2a2a2a]"
                        : "hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <td className="py-3 px-4 font-black border-r-2 border-neutral-700">
                      {rank <= 3 ? (
                        <span className="bg-white text-black px-2 py-0.5 border border-black inline-block rounded-md">
                          #{rank}
                        </span>
                      ) : (
                        <span className="text-neutral-400">#{rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 border-r-2 border-neutral-700">
                      {contender.contenderNumber}
                    </td>
                    <td className="py-3 px-4 font-black uppercase text-white border-r-2 border-neutral-700">
                      {contender.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-neutral-300 border-r-2 border-neutral-700">
                      {contender.j1Score.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-neutral-300 border-r-2 border-neutral-700">
                      {contender.j2Score.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-black text-white text-sm border-r-2 border-neutral-700">
                      {contender.combinedTotal > 0 ? (
                        <span className="bg-white text-black px-2 py-0.5 border border-black inline-block rounded-md">
                          {contender.combinedTotal.toFixed(1)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {isQualified ? (
                        <span className="px-2.5 py-1 bg-emerald-400 text-black text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] rounded-md">
                          TOP {qualifierThreshold} ADVANCE
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[10px] uppercase font-bold">
                          {contender.combinedTotal === 0 ? "PENDING" : "ELIMINATED"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: BATTLE BRACKET CONTROLLER (DIFFERENTIATED STAGES & COMPLETE NAMES) */}
      <div className="border-3 border-white bg-[#181818] p-6 shadow-[6px_6px_0px_0px_#ffffff] space-y-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-white pb-3">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-white" /> BATTLE TOURNAMENT CONTROLLER (WINNER SELECTION)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Click &quot;Pick Winner&quot; for any battle. The winner will automatically advance into their slot in Top 8, Top 4, or Grand Final!
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs font-black uppercase">
            <button
              onClick={() => setAdminBattleFilter("ALL")}
              className={`px-3 py-1.5 border-2 border-white transition-all rounded-lg ${
                adminBattleFilter === "ALL"
                  ? "bg-white text-black shadow-[2px_2px_0px_0px_#888888]"
                  : "bg-[#141414] text-neutral-400 hover:text-white"
              }`}
            >
              ALL
            </button>
            {top16Battles.length > 0 && (
              <button
                onClick={() => setAdminBattleFilter("T16")}
                className={`px-3 py-1.5 border-2 border-white transition-all rounded-lg ${
                  adminBattleFilter === "T16"
                    ? "bg-white text-black shadow-[2px_2px_0px_0px_#888888]"
                    : "bg-[#141414] text-neutral-400 hover:text-white"
                }`}
              >
                TOP 16
              </button>
            )}
            <button
              onClick={() => setAdminBattleFilter("QF")}
              className={`px-3 py-1.5 border-2 border-white transition-all rounded-lg ${
                adminBattleFilter === "QF"
                  ? "bg-white text-black shadow-[2px_2px_0px_0px_#888888]"
                  : "bg-[#141414] text-neutral-400 hover:text-white"
              }`}
            >
              TOP 8 (QF)
            </button>
            <button
              onClick={() => setAdminBattleFilter("SF")}
              className={`px-3 py-1.5 border-2 border-white transition-all rounded-lg ${
                adminBattleFilter === "SF"
                  ? "bg-white text-black shadow-[2px_2px_0px_0px_#888888]"
                  : "bg-[#141414] text-neutral-400 hover:text-white"
              }`}
            >
              TOP 4 (SF)
            </button>
            <button
              onClick={() => setAdminBattleFilter("FINAL")}
              className={`px-3 py-1.5 border-2 border-white transition-all rounded-lg ${
                adminBattleFilter === "FINAL"
                  ? "bg-white text-black shadow-[2px_2px_0px_0px_#888888]"
                  : "bg-[#141414] text-neutral-400 hover:text-white"
              }`}
            >
              FINALS
            </button>
          </div>
        </div>

        {/* STAGE 1: TOP 16 BATTLES */}
        {top16Battles.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "T16") && (
          <div className="space-y-3">
            <div className="bg-[#242424] border-2 border-white px-3.5 py-2 flex items-center justify-between shadow-[3px_3px_0px_0px_#ffffff] rounded-xl">
              <span className="font-black text-xs uppercase tracking-widest text-white">
                STAGE 1 &bull; TOP 16 BATTLES (8 MATCHES &bull; 1 MIN X 2 ROUNDS)
              </span>
              <span className="text-[10px] bg-black text-white px-2 py-0.5 border border-white rounded-md">
                WINNERS ADVANCE TO TOP 8
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {top16Battles.map((battle) => (
                <AdminBattleCard
                  key={battle.matchId}
                  battle={battle}
                  onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2: TOP 8 QUARTER-FINALS (QUARTILE) */}
        {quarterFinals.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "QF") && (
          <div className="space-y-3">
            <div className="bg-[#242424] border-2 border-white px-3.5 py-2 flex items-center justify-between shadow-[3px_3px_0px_0px_#ffffff] rounded-xl">
              <span className="font-black text-xs uppercase tracking-widest text-white">
                STAGE 2 &bull; TOP 8 QUARTER-FINALS (QUARTILE &bull; 4 MATCHES &bull; 1 MIN X 2 ROUNDS)
              </span>
              <span className="text-[10px] bg-black text-white px-2 py-0.5 border border-white rounded-md">
                WINNERS ADVANCE TO TOP 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quarterFinals.map((battle) => (
                <AdminBattleCard
                  key={battle.matchId}
                  battle={battle}
                  onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: TOP 4 SEMI-FINALS (SEMI-QUARTILE) */}
        {semiFinals.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "SF") && (
          <div className="space-y-3">
            <div className="bg-[#242424] border-2 border-white px-3.5 py-2 flex items-center justify-between shadow-[3px_3px_0px_0px_#ffffff] rounded-xl">
              <span className="font-black text-xs uppercase tracking-widest text-white">
                STAGE 3 &bull; TOP 4 SEMI-FINALS (SEMI-QUARTILE &bull; 2 MATCHES &bull; 1:30 MIN X 2 ROUNDS)
              </span>
              <span className="text-[10px] bg-black text-white px-2 py-0.5 border border-white rounded-md">
                WINNERS ADVANCE TO GRAND FINAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {semiFinals.map((battle) => (
                <AdminBattleCard
                  key={battle.matchId}
                  battle={battle}
                  onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: TOP 2 GRAND FINAL & 3RD PLACE BATTLE */}
        {finalBattles.length > 0 && (adminBattleFilter === "ALL" || adminBattleFilter === "FINAL") && (
          <div className="space-y-3">
            <div className="bg-white text-black border-2 border-black px-3.5 py-2 flex items-center justify-between shadow-[3px_3px_0px_0px_#ffffff] rounded-xl">
              <span className="font-black text-xs uppercase tracking-widest">
                STAGE 4 &bull; TOP 2 GRAND FINAL & 3RD PLACE BATTLE
              </span>
              <span className="text-[10px] bg-black text-white px-2 py-0.5 font-black uppercase rounded-md">
                CHAMPION CROWNED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {finalBattles.map((battle) => (
                <AdminBattleCard
                  key={battle.matchId}
                  battle={battle}
                  isGrandFinal={battle.matchId.includes("FINAL") && !battle.matchId.includes("THIRD")}
                  onPickWinner={(id, name) => handleSetBattleWinner(battle.matchId, id, name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminBattleCard({
  battle,
  isGrandFinal = false,
  onPickWinner,
}: {
  battle: BattleMatch;
  isGrandFinal?: boolean;
  onPickWinner: (id: number, name: string) => void;
}) {
  const compA = battle.competitorA;
  const compB = battle.competitorB;
  const hasWinner = Boolean(battle.winnerName);
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
    if (id === "FINAL") return "Grand Final: Title Decider";
    if (id === "THIRD_PLACE") return "3rd Place Battle";
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
    return slot === "A" ? "Contender A (Seed)" : "Contender B (Seed)";
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
        <span className="text-xs font-black uppercase text-white truncate pr-2 tracking-wide">
          {getFullMatchTitle()}
        </span>
        <span className="text-[10px] bg-[#222222] border border-neutral-600 px-2.5 py-0.5 text-neutral-300 font-bold uppercase rounded-full shrink-0">
          {battle.roundDurationText}
        </span>
      </div>

      {/* Head-to-Head (VS) Side-by-Side Contenders */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5 sm:gap-3">
        {/* Competitor A */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between transition-all min-h-[82px] ${
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
                  ✓ Winner
                </span>
              )}
            </div>
            <div className={`text-xs sm:text-sm font-bold truncate ${isAWinner ? "text-emerald-300 font-black" : ""}`}>
              {compA?.name || getPlaceholder("A")}
            </div>
          </div>

          {compA && (
            <button
              onClick={() => onPickWinner(compA.id!, compA.name)}
              className={`mt-3 w-full py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                isAWinner
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {isAWinner ? "✓ Confirmed Winner" : "Pick As Winner"}
            </button>
          )}
        </div>

        {/* Central VS Badge */}
        <div className="flex flex-col items-center justify-center">
          <span className="bg-[#242424] text-neutral-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-neutral-600 uppercase shadow-sm">
            VS
          </span>
        </div>

        {/* Competitor B */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between transition-all min-h-[82px] ${
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
                  ✓ Winner
                </span>
              )}
            </div>
            <div className={`text-xs sm:text-sm font-bold truncate ${isBWinner ? "text-emerald-300 font-black" : ""}`}>
              {compB?.name || getPlaceholder("B")}
            </div>
          </div>

          {compB && (
            <button
              onClick={() => onPickWinner(compB.id!, compB.name)}
              className={`mt-3 w-full py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                isBWinner
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {isBWinner ? "✓ Confirmed Winner" : "Pick As Winner"}
            </button>
          )}
        </div>
      </div>

      {/* Judge Votes & Match Status Bar */}
      <div className="mt-3 pt-2.5 border-t border-neutral-700 flex flex-col gap-1 text-[10px] text-neutral-400">
        <div className="flex justify-between">
          <span>Judge 1 Vote: <strong className="text-white">{battle.judge1Vote ? `Comp ${battle.judge1Vote}` : "None"}</strong></span>
          <span>Judge 2 Vote: <strong className="text-white">{battle.judge2Vote ? `Comp ${battle.judge2Vote}` : "None"}</strong></span>
        </div>

        {battle.winnerName && (
          <div className="flex items-center justify-between text-emerald-400 font-bold mt-1">
            <span>Winner: <strong className="text-white">{battle.winnerName}</strong></span>
            {battle.nextMatchId && (
              <span className="text-neutral-400 text-[10px] font-normal">
                Advances &rarr; <strong className="text-[#A78BFA]">{battle.nextMatchId}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
