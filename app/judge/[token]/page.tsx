"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Trophy,
  Swords,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  Crown,
  ArrowRight,
  Flame,
  ListOrdered,
  Save,
} from "lucide-react";

interface Participant {
  id: number;
  contenderNumber: string;
  name: string;
  status: string;
}

interface Criterion {
  id: string;
  name: string;
  maxPoints: number;
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
  myVote?: "A" | "B" | null;
  nextMatchId?: string;
  nextMatchSlot?: "A" | "B";
}

interface JudgePortalData {
  judge: {
    id: string;
    name: string;
  };
  national: {
    participants: Participant[];
    criteria: Criterion[];
    myScores: ScoreRecord[];
    battles: BattleMatch[];
  };
  regional: {
    participants: Participant[];
    criteria: Criterion[];
    myScores: ScoreRecord[];
    battles: BattleMatch[];
  };
}

export default function JudgeScorecardPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [judgeInfo, setJudgeInfo] = useState<{ id: string; name: string } | null>(null);

  const [activeCategory, setActiveCategory] = useState<"national" | "regional">("national");
  const [activeTab, setActiveTab] = useState<"eliminations" | "battles">("eliminations");
  const [selectedParticipantIdx, setSelectedParticipantIdx] = useState(0);

  const [nationalData, setNationalData] = useState<{
    participants: Participant[];
    criteria: Criterion[];
    myScores: ScoreRecord[];
    battles: BattleMatch[];
  }>({ participants: [], criteria: [], myScores: [], battles: [] });

  const [regionalData, setRegionalData] = useState<{
    participants: Participant[];
    criteria: Criterion[];
    myScores: ScoreRecord[];
    battles: BattleMatch[];
  }>({ participants: [], criteria: [], myScores: [], battles: [] });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [battleFilter, setBattleFilter] = useState<"ALL" | "T16" | "QF" | "SF" | "FINAL">("ALL");

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/championship/judge?token=${token}`);
      if (!res.ok) {
        const errJson = await res.json();
        setError(errJson.error || "Invalid or revoked judge token");
        return;
      }
      const data: JudgePortalData = await res.json();
      setJudgeInfo(data.judge);
      setNationalData(data.national);
      setRegionalData(data.regional);
    } catch (err: any) {
      setError(err?.message || "Failed to load judge data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentCategoryData = activeCategory === "national" ? nationalData : regionalData;
  const currentParticipants = currentCategoryData.participants;
  const currentCriteria = currentCategoryData.criteria;
  const currentScoresList = currentCategoryData.myScores;
  const currentBattles = currentCategoryData.battles;

  const currentParticipant = currentParticipants[selectedParticipantIdx] || null;

  const activeScoreRecord = currentParticipant
    ? currentScoresList.find((s) => s.participantId === currentParticipant.id)
    : null;

  const [scoresState, setScoresState] = useState<Record<string, number>>({});
  const [notesState, setNotesState] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    if (activeScoreRecord) {
      setScoresState(activeScoreRecord.scores || {});
      setNotesState(activeScoreRecord.notes || "");
    } else {
      setScoresState({});
      setNotesState("");
    }
    setIsDirty(false);
  }, [selectedParticipantIdx, activeCategory, currentScoresList]);

  const computeTotal = (scores: Record<string, number>) => {
    let tot = 0;
    Object.values(scores).forEach((val) => {
      const n = Number(val);
      if (!isNaN(n)) tot += n;
    });
    return Math.round(tot * 10) / 10;
  };

  // Local state update ONLY — Decimal precision supported (e.g. 7.5, 8.2)
  const handleScoreChange = (criteriaId: string, val: number) => {
    const parsed = isNaN(val) ? 0 : Math.max(0, Math.min(10, Math.round(val * 10) / 10));
    setScoresState((prev) => ({ ...prev, [criteriaId]: parsed }));
    setIsDirty(true);
  };

  const handleScoreStep = (criteriaId: string, delta: number) => {
    setScoresState((prev) => {
      const curr = prev[criteriaId] ?? 0;
      const next = Math.max(0, Math.min(10, Math.round((curr + delta) * 10) / 10));
      return { ...prev, [criteriaId]: next };
    });
    setIsDirty(true);
  };

  const handleNotesChange = (txt: string) => {
    setNotesState(txt);
    setIsDirty(true);
  };

  // Single Contender Save API Request
  const saveScoreToBackend = async (
    targetParticipantId: number,
    scores: Record<string, number>,
    notes: string
  ) => {
    if (!targetParticipantId || !token) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/championship/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type: "elimination_score",
          category: activeCategory,
          participantId: targetParticipantId,
          scores,
          notes,
        }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setIsDirty(false);
        const resData = await res.json();
        if (resData.myScores) {
          if (activeCategory === "national") {
            setNationalData((prev) => ({ ...prev, myScores: resData.myScores }));
          } else {
            setRegionalData((prev) => ({ ...prev, myScores: resData.myScores }));
          }
        } else if (resData.score) {
          const updated = resData.score;
          const updater = (prevList: ScoreRecord[]) => {
            const idx = prevList.findIndex((s) => s.participantId === updated.participantId);
            if (idx >= 0) {
              const copy = [...prevList];
              copy[idx] = updated;
              return copy;
            }
            return [...prevList, updated];
          };
          if (activeCategory === "national") {
            setNationalData((prev) => ({ ...prev, myScores: updater(prev.myScores) }));
          } else {
            setRegionalData((prev) => ({ ...prev, myScores: updater(prev.myScores) }));
          }
        }
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  const handleSaveCurrent = async () => {
    if (!currentParticipant) return;
    await saveScoreToBackend(currentParticipant.id, scoresState, notesState);
  };

  const handleSelectParticipant = async (targetIdx: number) => {
    if (targetIdx === selectedParticipantIdx) return;
    // Auto-save unsaved scores for previous candidate before switching
    if (isDirty && currentParticipant) {
      await saveScoreToBackend(currentParticipant.id, scoresState, notesState);
    }
    setSelectedParticipantIdx(targetIdx);
  };

  const handleSwitchCategory = async (cat: "national" | "regional") => {
    if (cat === activeCategory) return;
    if (isDirty && currentParticipant) {
      await saveScoreToBackend(currentParticipant.id, scoresState, notesState);
    }
    setActiveCategory(cat);
    setSelectedParticipantIdx(0);
  };

  const handleVoteBattle = async (matchId: string, vote: "A" | "B") => {
    try {
      const res = await fetch("/api/championship/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type: "battle_vote",
          category: activeCategory,
          battleMatchId: matchId,
          vote,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.battles) {
          if (activeCategory === "national") {
            setNationalData((prev) => ({ ...prev, battles: resData.battles }));
          } else {
            setRegionalData((prev) => ({ ...prev, battles: resData.battles }));
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclareWinner = async (matchId: string, winnerId: number, winnerName: string) => {
    try {
      const res = await fetch("/api/championship/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type: "declare_winner",
          category: activeCategory,
          battleMatchId: matchId,
          winnerId,
          winnerName,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.battles) {
          if (activeCategory === "national") {
            setNationalData((prev) => ({ ...prev, battles: resData.battles }));
          } else {
            setRegionalData((prev) => ({ ...prev, battles: resData.battles }));
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-6">
        <div className="border-3 border-white border-t-transparent w-8 h-8 rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Verifying Judge Portal...
        </span>
      </div>
    );
  }

  if (error || !judgeInfo) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#161616] border border-neutral-800 p-6 max-w-sm rounded-2xl shadow-xl">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-black uppercase text-white mb-1.5">Access Denied</h2>
          <p className="text-neutral-400 text-xs mb-4">{error || "Invalid Judge Link"}</p>
          <div className="bg-[#111111] border border-neutral-700 p-3 text-[11px] text-neutral-400 rounded-xl">
            Please ask the Championship Organizer for your valid personal judge link.
          </div>
        </div>
      </div>
    );
  }

  const currentTotal = computeTotal(scoresState);

  // Separate battles by stage
  const top16Battles = currentBattles.filter((b) => b.roundStage === "T16");
  const quarterFinals = currentBattles.filter((b) => b.roundStage === "QF");
  const semiFinals = currentBattles.filter((b) => b.roundStage === "SF");
  const finalBattles = currentBattles.filter((b) => b.roundStage === "FINAL");

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white pb-20 selection:bg-[#FDE047] selection:text-black">
      {/* Sticky Clean Header */}
      <header className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#FDE047] text-black font-extrabold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {judgeInfo.name}
            </span>
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
              Official Judge Portal
            </span>
          </div>

          {/* Sync Badge */}
          <div className="flex items-center gap-2 text-xs">
            {saveStatus === "saving" && (
              <span className="bg-neutral-800 text-neutral-200 px-2.5 py-0.5 text-[11px] font-bold rounded-md animate-pulse">
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-bold rounded-md">
                Error Saving
              </span>
            )}
            {saveStatus === "idle" && (
              <span className="text-neutral-500 text-[11px] font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-neutral-500" /> Synced
              </span>
            )}
          </div>
        </div>

        {/* Category & Stage Switchers */}
        <div className="max-w-3xl mx-auto mt-3 grid grid-cols-2 gap-2">
          {/* Category Switcher */}
          <div className="bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 flex">
            <button
              onClick={() => handleSwitchCategory("national")}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeCategory === "national"
                  ? "bg-[#FDE047] text-black shadow-sm font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>National</span>
            </button>

            <button
              onClick={() => handleSwitchCategory("regional")}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeCategory === "regional"
                  ? "bg-[#FB7185] text-black shadow-sm font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Regional</span>
            </button>
          </div>

          {/* Phase Switcher */}
          <div className="bg-[#0e0e0e] p-1 rounded-xl border border-neutral-800 flex">
            <button
              onClick={() => setActiveTab("eliminations")}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "eliminations"
                  ? "bg-[#38BDF8] text-black shadow-sm font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Eliminations</span>
            </button>

            <button
              onClick={() => setActiveTab("battles")}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "battles"
                  ? "bg-[#A78BFA] text-black shadow-sm font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Battles</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-5">
        {activeTab === "eliminations" ? (
          <div className="space-y-4">
            {/* Elimination Header Info */}
            <div className="bg-[#141414] border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Clock className="w-4 h-4 text-[#FDE047]" />
                <span>Round: <strong>1.5 min</strong> per contender</span>
              </div>
              <div className="text-neutral-400 font-medium">
                Scored: <strong className="text-white">{currentScoresList.length}</strong> / {currentParticipants.length}
              </div>
            </div>

            {/* Contender Carousel Selector */}
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Select Beatboxer</span>
                <span>#{selectedParticipantIdx + 1} of {currentParticipants.length}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {currentParticipants.map((p, idx) => {
                  const isScored = currentScoresList.some(
                    (s) => s.participantId === p.id && s.totalScore > 0
                  );
                  const isSelected = idx === selectedParticipantIdx;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectParticipant(idx)}
                      className={`flex-shrink-0 px-3 py-2 text-left rounded-xl transition-all border ${
                        isSelected
                          ? "bg-white text-black border-white shadow-md font-bold scale-105"
                          : isScored
                          ? "bg-[#181818] border-emerald-500/50 text-white"
                          : "bg-[#141414] border-neutral-800 text-neutral-400 hover:border-neutral-600"
                      }`}
                    >
                      <div className="text-[9px] font-mono opacity-75">{p.contenderNumber}</div>
                      <div className="text-xs font-bold whitespace-nowrap flex items-center gap-1">
                        {p.name}
                        {isScored && !isSelected && <span className="text-emerald-400">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Contender Scorecard */}
            {currentParticipant && (
              <div className="bg-[#141414] border border-neutral-800 p-5 sm:p-6 rounded-2xl shadow-xl space-y-5">
                {/* Header Card */}
                <div className="border-b border-neutral-800 pb-4 flex justify-between items-start">
                  <div>
                    <span className="bg-[#202020] text-neutral-300 font-mono text-[10px] px-2 py-0.5 rounded border border-neutral-700 uppercase">
                      {currentParticipant.contenderNumber}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentParticipant.name}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-neutral-400 font-bold block">
                      Total Score
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#FDE047]">
                      {currentTotal.toFixed(1)}
                      <span className="text-xs text-neutral-500 font-normal"> / 60.0</span>
                    </div>
                  </div>
                </div>

                {/* The 6 Criteria */}
                <div className="space-y-3.5">
                  {currentCriteria.map((crit) => {
                    const currentVal = scoresState[crit.id] ?? 0;

                    return (
                      <div
                        key={crit.id}
                        className="bg-[#1a1a1a] border border-neutral-800/80 p-3.5 sm:p-4 rounded-xl space-y-2.5"
                      >
                        <div className="flex justify-between items-center">
                          <label className="text-xs sm:text-sm font-bold text-white tracking-wide">
                            {crit.name}
                          </label>

                          {/* Direct Decimal Input Field & Display */}
                          <div className="flex items-center gap-1.5 bg-[#101010] border border-neutral-700/80 px-2 py-1 rounded-lg">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max={crit.maxPoints}
                              value={currentVal === 0 ? "0" : currentVal}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                handleScoreChange(crit.id, isNaN(val) ? 0 : val);
                              }}
                              className="w-14 bg-transparent text-right font-black font-mono text-base text-[#FDE047] focus:outline-none focus:text-white"
                            />
                            <span className="text-xs text-neutral-500 font-mono font-bold">
                              / {crit.maxPoints}
                            </span>
                          </div>
                        </div>

                        {/* Decimal Quick Steppers & Slider */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleScoreStep(crit.id, -0.5)}
                              className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-neutral-700 text-[11px] font-mono font-bold text-neutral-300 rounded active:scale-95"
                              title="Decrease 0.5"
                            >
                              -0.5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleScoreStep(crit.id, -0.1)}
                              className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-neutral-700 text-[11px] font-mono font-bold text-neutral-300 rounded active:scale-95"
                              title="Decrease 0.1"
                            >
                              -0.1
                            </button>
                          </div>

                          {/* Smooth Decimal Range Slider */}
                          <input
                            type="range"
                            min="0"
                            max={crit.maxPoints}
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                            className="flex-1 accent-[#FDE047] h-2 bg-neutral-800 rounded-lg cursor-pointer"
                          />

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleScoreStep(crit.id, 0.1)}
                              className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-neutral-700 text-[11px] font-mono font-bold text-[#FDE047] rounded active:scale-95"
                              title="Increase 0.1"
                            >
                              +0.1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleScoreStep(crit.id, 0.5)}
                              className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-neutral-700 text-[11px] font-mono font-bold text-[#FDE047] rounded active:scale-95"
                              title="Increase 0.5"
                            >
                              +0.5
                            </button>
                          </div>
                        </div>

                        {/* Quick Base Integer Selector (1 to 10) */}
                        <div className="grid grid-cols-10 gap-1 pt-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const isWholeMatch = currentVal === num;
                            const isInRange = currentVal >= num && currentVal < num + 1;
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleScoreChange(crit.id, num)}
                                className={`h-8 font-bold text-xs rounded transition-all active:scale-95 ${
                                  isWholeMatch
                                    ? "bg-[#FDE047] text-black font-black shadow-md ring-1 ring-white"
                                    : isInRange
                                    ? "bg-[#332b00] text-[#FDE047] border border-[#FDE047]/60"
                                    : "bg-[#111111] text-neutral-400 border border-neutral-800 hover:bg-[#222222] hover:text-white"
                                }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Private Notes */}
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-1.5 block">
                    Judge Private Notes (Optional)
                  </label>
                  <textarea
                    value={notesState}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Private notes for battle deliberations..."
                    rows={2}
                    className="w-full bg-[#111111] border border-neutral-700/80 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white rounded-xl transition-colors"
                  />
                </div>

                {/* Single Contender Save Action Button (1 API Request per Contender) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCurrent}
                    disabled={saveStatus === "saving"}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                      saveStatus === "saving"
                        ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        : isDirty
                        ? "bg-[#FDE047] text-black hover:bg-[#FACC15] ring-2 ring-[#FDE047]/50 shadow-[0_0_20px_rgba(253,224,71,0.25)] animate-pulse"
                        : saveStatus === "saved"
                        ? "bg-emerald-500 text-black font-extrabold"
                        : "bg-[#1e1e1e] text-neutral-200 hover:bg-[#282828] border border-neutral-700/80"
                    }`}
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent animate-spin rounded-full" />
                        <span>SAVING SCORES FOR {currentParticipant.name.toUpperCase()}...</span>
                      </>
                    ) : saveStatus === "saved" ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>SCORES SAVED ({currentTotal.toFixed(1)} / 60.0)</span>
                      </>
                    ) : isDirty ? (
                      <>
                        <Save className="w-4 h-4" />
                        <span>SAVE SCORE FOR {currentParticipant.name.toUpperCase()} ({currentTotal.toFixed(1)} / 60.0)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        <span>SCORES SAVED ({currentTotal.toFixed(1)} / 60.0) • TAP TO RE-SAVE</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-neutral-500 mt-1.5 font-medium">
                    Scores update locally instantly. Tapping save sends 1 single secure request. Auto-saves when you navigate.
                  </p>
                </div>

                {/* Bottom Navigation */}
                <div className="flex gap-3 pt-1">
                  <button
                    disabled={selectedParticipantIdx === 0}
                    onClick={() => handleSelectParticipant(Math.max(0, selectedParticipantIdx - 1))}
                    className="flex-1 py-2.5 bg-[#1e1e1e] border border-neutral-700 hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    disabled={selectedParticipantIdx === currentParticipants.length - 1}
                    onClick={() =>
                      handleSelectParticipant(
                        Math.min(currentParticipants.length - 1, selectedParticipantIdx + 1)
                      )
                    }
                    className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-30 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    Next Contender <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BATTLES TAB: CLEAR HEAD-TO-HEAD VS CARDS */
          <div className="space-y-5">
            {/* Stage Filter Tabs */}
            <div className="bg-[#141414] border border-neutral-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Battle Tournament</span>
                </h3>
                <span className="text-[11px] text-neutral-400">
                  Tap to vote or declare official winner.
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setBattleFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    battleFilter === "ALL"
                      ? "bg-white text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  All
                </button>
                {top16Battles.length > 0 && (
                  <button
                    onClick={() => setBattleFilter("T16")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      battleFilter === "T16"
                        ? "bg-[#38BDF8] text-black font-black"
                        : "bg-[#202020] text-neutral-300 hover:text-white"
                    }`}
                  >
                    Top 16
                  </button>
                )}
                <button
                  onClick={() => setBattleFilter("QF")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    battleFilter === "QF"
                      ? "bg-[#FDE047] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Top 8 (QF)
                </button>
                <button
                  onClick={() => setBattleFilter("SF")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    battleFilter === "SF"
                      ? "bg-[#FB7185] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Top 4 (SF)
                </button>
                <button
                  onClick={() => setBattleFilter("FINAL")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    battleFilter === "FINAL"
                      ? "bg-[#4ADE80] text-black font-black"
                      : "bg-[#202020] text-neutral-300 hover:text-white"
                  }`}
                >
                  Finals
                </button>
              </div>
            </div>

            {/* STAGE 1: TOP 16 */}
            {top16Battles.length > 0 && (battleFilter === "ALL" || battleFilter === "T16") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Stage 1: Top 16 Battles
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#202020] border border-neutral-700 px-2 py-0.5 rounded-md">
                    1 min × 2 rounds
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {top16Battles.map((battle) => (
                    <JudgeBattleBox
                      key={battle.matchId}
                      battle={battle}
                      stageName="Top 16 Battle"
                      onVote={(vote) => handleVoteBattle(battle.matchId, vote)}
                      onDeclare={(id, name) => handleDeclareWinner(battle.matchId, id, name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 2: TOP 8 QUARTER-FINALS */}
            {quarterFinals.length > 0 && (battleFilter === "ALL" || battleFilter === "QF") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FDE047]" /> Stage 2: Top 8 Quarter-Finals
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#202020] border border-neutral-700 px-2 py-0.5 rounded-md">
                    1 min × 2 rounds
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {quarterFinals.map((battle) => (
                    <JudgeBattleBox
                      key={battle.matchId}
                      battle={battle}
                      stageName="Quarter-Final"
                      onVote={(vote) => handleVoteBattle(battle.matchId, vote)}
                      onDeclare={(id, name) => handleDeclareWinner(battle.matchId, id, name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 3: TOP 4 SEMI-FINALS */}
            {semiFinals.length > 0 && (battleFilter === "ALL" || battleFilter === "SF") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FB7185]" /> Stage 3: Top 4 Semi-Finals
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#202020] border border-neutral-700 px-2 py-0.5 rounded-md">
                    1:30 min × 2 rounds
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {semiFinals.map((battle) => (
                    <JudgeBattleBox
                      key={battle.matchId}
                      battle={battle}
                      stageName="Semi-Final"
                      onVote={(vote) => handleVoteBattle(battle.matchId, vote)}
                      onDeclare={(id, name) => handleDeclareWinner(battle.matchId, id, name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 4: FINALS */}
            {finalBattles.length > 0 && (battleFilter === "ALL" || battleFilter === "FINAL") && (
              <div className="space-y-3">
                <div className="bg-[#151515] border border-neutral-700 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4ADE80]" /> Stage 4: Finals
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#202020] border border-neutral-700 px-2 py-0.5 rounded-md">
                    1:30 min × 2 rounds
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {finalBattles.map((battle) => (
                    <JudgeBattleBox
                      key={battle.matchId}
                      battle={battle}
                      stageName={battle.matchId.includes("THIRD") ? "Small Final (3rd Place Battle)" : "Grand Final"}
                      isGrandFinal={battle.matchId.includes("FINAL") && !battle.matchId.includes("THIRD")}
                      isSmallFinal={battle.matchId.includes("THIRD")}
                      onVote={(vote) => handleVoteBattle(battle.matchId, vote)}
                      onDeclare={(id, name) => handleDeclareWinner(battle.matchId, id, name)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Clean Judge Battle Box with Head-to-Head VS Layout
 */
function JudgeBattleBox({
  battle,
  stageName,
  isGrandFinal = false,
  isSmallFinal = false,
  onVote,
  onDeclare,
}: {
  battle: BattleMatch;
  stageName: string;
  isGrandFinal?: boolean;
  isSmallFinal?: boolean;
  onVote: (vote: "A" | "B") => void;
  onDeclare: (id: number, name: string) => void;
}) {
  const compA = battle.competitorA;
  const compB = battle.competitorB;
  const isA = battle.myVote === "A";
  const isB = battle.myVote === "B";
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
    if (id === "THIRD_PLACE") return "Small Final: 3rd Place Battle (Losers of Top 4)";
    return `${stageName} • ${battle.matchId}`;
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
      {/* Title & Round Info */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-700">
        <span className="text-xs font-black uppercase text-white truncate pr-2 tracking-wide">
          {getFullMatchTitle()}
        </span>
        <span className="text-[10px] bg-[#222222] border border-neutral-600 px-2.5 py-0.5 text-neutral-300 font-bold uppercase rounded-full shrink-0">
          {battle.roundDurationText}
        </span>
      </div>

      {/* Head-to-Head Contenders: Side-by-Side */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2.5 sm:gap-3">
        {/* Competitor A */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between transition-all min-h-[82px] ${
            isAWinner
              ? "bg-emerald-950/40 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
              : isALoser
              ? "bg-[#111111] border border-neutral-800 text-neutral-500 opacity-40 line-through"
              : isA
              ? "bg-[#1e1e1e] border-2 border-white text-white shadow-sm ring-1 ring-white/50"
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
            <div className={`text-xs sm:text-sm font-bold truncate ${isAWinner ? "text-emerald-300 font-black" : ""}`}>
              {compA?.name || getPlaceholder("A")}
            </div>
          </div>

          {/* Action Buttons: Vote & Declare Winner */}
          {compA && (
            <div className="mt-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onVote("A")}
                className={`w-full py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  isA
                    ? "bg-white text-black font-extrabold shadow-sm"
                    : "bg-[#282828] border border-neutral-600 text-neutral-200 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {isA ? "✓ My Vote" : "Vote Contender A"}
              </button>

              <button
                type="button"
                onClick={() => onDeclare(compA.id!, compA.name)}
                className={`w-full py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  isAWinner
                    ? "bg-emerald-500 text-black font-black"
                    : "bg-[#151515] border border-neutral-600 hover:border-emerald-400 text-neutral-300"
                }`}
              >
                {isAWinner ? "Official Winner" : "Declare Winner"}
              </button>
            </div>
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
              : isB
              ? "bg-[#1e1e1e] border-2 border-white text-white shadow-sm ring-1 ring-white/50"
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
            <div className={`text-xs sm:text-sm font-bold truncate ${isBWinner ? "text-emerald-300 font-black" : ""}`}>
              {compB?.name || getPlaceholder("B")}
            </div>
          </div>

          {/* Action Buttons: Vote & Declare Winner */}
          {compB && (
            <div className="mt-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onVote("B")}
                className={`w-full py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  isB
                    ? "bg-white text-black font-extrabold shadow-sm"
                    : "bg-[#282828] border border-neutral-600 text-neutral-200 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {isB ? "✓ My Vote" : "Vote Contender B"}
              </button>

              <button
                type="button"
                onClick={() => onDeclare(compB.id!, compB.name)}
                className={`w-full py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  isBWinner
                    ? "bg-emerald-500 text-black font-black"
                    : "bg-[#151515] border border-neutral-600 hover:border-emerald-400 text-neutral-300"
                }`}
              >
                {isBWinner ? "Official Winner" : "Declare Winner"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Official Winner Banner / Status */}
      <div className="mt-3 pt-2.5 border-t border-neutral-700 flex items-center justify-between text-[11px]">
        {hasWinner ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>
                {isSmallFinal
                  ? "3rd Place Winner: "
                  : isGrandFinal
                  ? "1st Place Champion: "
                  : "Winner: "}
                <strong className="text-white">{battle.winnerName}</strong>
              </span>
            </span>
            {battle.nextMatchId && (
              <span className="text-neutral-400 text-[10px] font-medium flex items-center gap-1">
                Advances to <strong className="text-[#A78BFA]">{battle.nextMatchId}</strong> <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-neutral-400 text-[10px]">
            <span>{compA && compB ? "Ready for decision" : "Awaiting contenders"}</span>
            <span className="uppercase font-mono text-neutral-500">{battle.matchId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
