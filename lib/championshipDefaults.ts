import { DEFAULT_25_BEATBOXERS } from "./draw24Defaults";

export interface CriteriaItem {
  id: string;
  name: string;
  maxPoints: number;
}

export const OFFICIAL_6_CRITERIA: CriteriaItem[] = [
  { id: "originality", name: "Originality", maxPoints: 10 },
  { id: "structureComp", name: "Structure & Comp", maxPoints: 10 },
  { id: "execution", name: "Execution", maxPoints: 10 },
  { id: "complexity", name: "Complexity", maxPoints: 10 },
  { id: "stagePresence", name: "Stage Presence", maxPoints: 10 },
  { id: "subjectivity", name: "Subjectivity", maxPoints: 10 },
];

export interface ParticipantItem {
  id: number;
  contenderNumber: string; // e.g. "#01"
  name: string;
  status: string;
}

export const DEFAULT_NATIONAL_PARTICIPANTS: ParticipantItem[] = [
  { id: 1, contenderNumber: "#01", name: "Parth", status: "Active" },
  { id: 2, contenderNumber: "#02", name: "LATHESH", status: "Active" },
  { id: 3, contenderNumber: "#03", name: "NPX", status: "Active" },
  { id: 4, contenderNumber: "#04", name: "sHz", status: "Active" },
  { id: 5, contenderNumber: "#05", name: "MOHIT", status: "Active" },
  { id: 6, contenderNumber: "#06", name: "Catalyst", status: "Active" },
  { id: 7, contenderNumber: "#07", name: "V2_bbx", status: "Active" },
  { id: 8, contenderNumber: "#08", name: "Piku", status: "Active" },
  { id: 9, contenderNumber: "#09", name: "Pracheta", status: "Active" },
  { id: 10, contenderNumber: "#10", name: "Drifter", status: "Active" },
  { id: 11, contenderNumber: "#11", name: "Beatlord", status: "Active" },
  { id: 12, contenderNumber: "#12", name: "Kawai senpai", status: "Active" },
  { id: 13, contenderNumber: "#13", name: "Marvel", status: "Active" },
  { id: 14, contenderNumber: "#14", name: "Ken-z", status: "Active" },
  { id: 15, contenderNumber: "#15", name: "DITTO", status: "Active" },
  { id: 16, contenderNumber: "#16", name: "Arth", status: "Active" },
  { id: 17, contenderNumber: "#17", name: "Tej", status: "Active" },
  { id: 18, contenderNumber: "#18", name: "Pranay", status: "Active" },
  { id: 19, contenderNumber: "#19", name: "SphereFx", status: "Active" },
  { id: 20, contenderNumber: "#20", name: "RDX", status: "Active" },
  { id: 21, contenderNumber: "#21", name: "Demus", status: "Active" },
  { id: 22, contenderNumber: "#22", name: "Xyren", status: "Active" },
  { id: 23, contenderNumber: "#23", name: "Tazmanzane", status: "Active" },
  { id: 24, contenderNumber: "#24", name: "Xboy", status: "Active" },
  { id: 25, contenderNumber: "#25", name: "ROMEO", status: "Active" },
];

export const DEFAULT_REGIONAL_PARTICIPANTS: ParticipantItem[] = [
  { id: 1, contenderNumber: "#01", name: "Mespop", status: "Active" },
  { id: 2, contenderNumber: "#02", name: "Tej", status: "Active" },
  { id: 3, contenderNumber: "#03", name: "Beatlord", status: "Active" },
  { id: 4, contenderNumber: "#04", name: "UNOS", status: "Active" },
  { id: 5, contenderNumber: "#05", name: "Nicholas Richard", status: "Active" },
  { id: 6, contenderNumber: "#06", name: "Tomms Fx", status: "Active" },
  { id: 7, contenderNumber: "#07", name: "Ken-Z", status: "Active" },
  { id: 8, contenderNumber: "#08", name: "Pranay", status: "Active" },
  { id: 9, contenderNumber: "#09", name: "Tazmanzane", status: "Active" },
  { id: 10, contenderNumber: "#10", name: "Xboy", status: "Active" },
  { id: 11, contenderNumber: "#11", name: "NPX", status: "Active" },
  { id: 12, contenderNumber: "#12", name: "Xyren", status: "Active" },
  { id: 13, contenderNumber: "#13", name: "Muzz", status: "Active" },
];

export interface BattleCompetitor {
  id?: number;
  name: string;
  seed?: number;
}

export interface BattleMatch {
  matchId: string; // e.g. "T16-1", "QF1", "SF1", "FINAL"
  title: string;
  roundStage: "T16" | "QF" | "SF" | "FINAL";
  roundDurationText: string; // e.g. "1 min x 2 rounds"
  competitorA: BattleCompetitor | null;
  competitorB: BattleCompetitor | null;
  winnerId?: number | null; // id of winning competitor
  winnerName?: string | null;
  judge1Vote?: "A" | "B" | null;
  judge2Vote?: "A" | "B" | null;
  nextMatchId?: string; // target match for the winner
  nextMatchSlot?: "A" | "B";
}

export const INITIAL_NATIONAL_BATTLES: BattleMatch[] = [
  // Top 16 Battles (1 min x 2 rounds)
  {
    matchId: "T16-1",
    title: "Battle 1 (#1 vs #16)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF1",
    nextMatchSlot: "A",
  },
  {
    matchId: "T16-2",
    title: "Battle 2 (#2 vs #15)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF2",
    nextMatchSlot: "A",
  },
  {
    matchId: "T16-3",
    title: "Battle 3 (#3 vs #14)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF3",
    nextMatchSlot: "A",
  },
  {
    matchId: "T16-4",
    title: "Battle 4 (#4 vs #13)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF4",
    nextMatchSlot: "A",
  },
  {
    matchId: "T16-5",
    title: "Battle 5 (#5 vs #12)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF4",
    nextMatchSlot: "B",
  },
  {
    matchId: "T16-6",
    title: "Battle 6 (#6 vs #11)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF3",
    nextMatchSlot: "B",
  },
  {
    matchId: "T16-7",
    title: "Battle 7 (#7 vs #10)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF2",
    nextMatchSlot: "B",
  },
  {
    matchId: "T16-8",
    title: "Battle 8 (#8 vs #9)",
    roundStage: "T16",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "QF1",
    nextMatchSlot: "B",
  },

  // Quarter Finals (1 min x 2 rounds)
  {
    matchId: "QF1",
    title: "Quarter Final 1 (Winner T16-1 vs Winner T16-8)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "SF1",
    nextMatchSlot: "A",
  },
  {
    matchId: "QF2",
    title: "Quarter Final 2 (Winner T16-2 vs Winner T16-7)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "SF2",
    nextMatchSlot: "A",
  },
  {
    matchId: "QF3",
    title: "Quarter Final 3 (Winner T16-3 vs Winner T16-6)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "SF2",
    nextMatchSlot: "B",
  },
  {
    matchId: "QF4",
    title: "Quarter Final 4 (Winner T16-4 vs Winner T16-5)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "SF1",
    nextMatchSlot: "B",
  },

  // Semi Finals (1:30 min x 2 rounds)
  {
    matchId: "SF1",
    title: "Semi Final 1 (Winner QF1 vs Winner QF4)",
    roundStage: "SF",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "FINAL",
    nextMatchSlot: "A",
  },
  {
    matchId: "SF2",
    title: "Semi Final 2 (Winner QF2 vs Winner QF3)",
    roundStage: "SF",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "FINAL",
    nextMatchSlot: "B",
  },

  // Finals & 3rd Place Battle
  {
    matchId: "FINAL",
    title: "Grand Final (Winner SF1 vs Winner SF2)",
    roundStage: "FINAL",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
  },
  {
    matchId: "THIRD_PLACE",
    title: "Small Final (3rd Place Battle - Loser SF1 vs Loser SF2)",
    roundStage: "FINAL",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
  },
];

export const INITIAL_REGIONAL_BATTLES: BattleMatch[] = [
  // Top 8 Quarter Finals
  {
    matchId: "RQF1",
    title: "QF 1 (#1 vs #8)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "RSF1",
    nextMatchSlot: "A",
  },
  {
    matchId: "RQF2",
    title: "QF 2 (#2 vs #7)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "RSF2",
    nextMatchSlot: "A",
  },
  {
    matchId: "RQF3",
    title: "QF 3 (#3 vs #6)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "RSF2",
    nextMatchSlot: "B",
  },
  {
    matchId: "RQF4",
    title: "QF 4 (#4 vs #5)",
    roundStage: "QF",
    roundDurationText: "1 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "RSF1",
    nextMatchSlot: "B",
  },
  // Semi Finals
  {
    matchId: "RSF1",
    title: "Semi Final 1 (Winner RQF1 vs Winner RQF4)",
    roundStage: "SF",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "RFINAL",
    nextMatchSlot: "A",
  },
  {
    matchId: "RSF2",
    title: "Semi Final 2 (Winner RQF2 vs Winner RQF3)",
    roundStage: "SF",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
    nextMatchId: "RFINAL",
    nextMatchSlot: "B",
  },
  // Regional Grand Final (No Small Final for Regional)
  {
    matchId: "RFINAL",
    title: "Regional Grand Final (Winner RSF1 vs Winner RSF2)",
    roundStage: "FINAL",
    roundDurationText: "1:30 min x 2 rounds",
    competitorA: null,
    competitorB: null,
  },
];
