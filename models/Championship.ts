import mongoose from "mongoose";
import {
  OFFICIAL_6_CRITERIA,
  DEFAULT_NATIONAL_PARTICIPANTS,
  DEFAULT_REGIONAL_PARTICIPANTS,
  INITIAL_NATIONAL_BATTLES,
  INITIAL_REGIONAL_BATTLES,
} from "@/lib/championshipDefaults";

const criteriaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    maxPoints: { type: Number, required: true, default: 10 },
  },
  { _id: false }
);

const participantSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    contenderNumber: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, default: "Active" },
  },
  { _id: false }
);

const scoreEntrySchema = new mongoose.Schema(
  {
    participantId: { type: Number, required: true },
    judgeId: { type: String, required: true }, // "judge-1" or "judge-2"
    scores: { type: Map, of: Number, default: {} }, // e.g. { originality: 8.5, structureComp: 9, ... }
    totalScore: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const competitorSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String },
    seed: { type: Number },
  },
  { _id: false }
);

const battleMatchSchema = new mongoose.Schema(
  {
    matchId: { type: String, required: true },
    title: { type: String, required: true },
    roundStage: { type: String, required: true }, // "T16", "QF", "SF", "FINAL"
    roundDurationText: { type: String, default: "1 min x 2 rounds" },
    competitorA: { type: competitorSchema, default: null },
    competitorB: { type: competitorSchema, default: null },
    winnerId: { type: Number, default: null },
    winnerName: { type: String, default: null },
    judge1Vote: { type: String, default: null }, // "A" or "B"
    judge2Vote: { type: String, default: null },
    nextMatchId: { type: String, default: null },
    nextMatchSlot: { type: String, default: null },
  },
  { _id: false }
);

const judgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // "judge-1", "judge-2"
    name: { type: String, required: true },
    secretToken: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const championshipCategorySchema = new mongoose.Schema(
  {
    participants: { type: [participantSchema], default: [] },
    criteria: { type: [criteriaSchema], default: OFFICIAL_6_CRITERIA },
    eliminationScores: { type: [scoreEntrySchema], default: [] },
    battles: { type: [battleMatchSchema], default: [] },
  },
  { _id: false }
);

const championshipSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: true },
    title: {
      type: String,
      default: "HBC 2026 National & Regional Beatbox Championship",
    },
    activeStage: {
      type: String,
      enum: ["eliminations", "battles", "both"],
      default: "both",
    },
    judges: {
      type: [judgeSchema],
      default: [
        {
          id: "judge-1",
          name: "Judge 1",
          secretToken: "hbc-j1-auth-48f10b7a",
          isActive: true,
        },
        {
          id: "judge-2",
          name: "Judge 2",
          secretToken: "hbc-j2-auth-92c73e15",
          isActive: true,
        },
      ],
    },
    national: {
      type: championshipCategorySchema,
      default: () => ({
        participants: DEFAULT_NATIONAL_PARTICIPANTS,
        criteria: OFFICIAL_6_CRITERIA,
        eliminationScores: [],
        battles: INITIAL_NATIONAL_BATTLES,
      }),
    },
    regional: {
      type: championshipCategorySchema,
      default: () => ({
        participants: DEFAULT_REGIONAL_PARTICIPANTS,
        criteria: OFFICIAL_6_CRITERIA,
        eliminationScores: [],
        battles: INITIAL_REGIONAL_BATTLES,
      }),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Championship ||
  mongoose.model("Championship", championshipSchema);
