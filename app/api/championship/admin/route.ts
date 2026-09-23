import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Championship from "@/models/Championship";
import { protect } from "@/lib/auth";
import crypto from "crypto";
import {
  INITIAL_NATIONAL_BATTLES,
  INITIAL_REGIONAL_BATTLES,
} from "@/lib/championshipDefaults";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    let championship = await Championship.findOne({});
    if (!championship) {
      championship = await Championship.create({});
    }
    return NextResponse.json(championship);
  } catch (error: any) {
    if (error.message && error.message.includes("Not authorized")) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { message: error.message || "Failed to load admin championship data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    await protect(req);
    const body = await req.json();
    const { action } = body;

    let championship = await Championship.findOne({});
    if (!championship) {
      championship = await Championship.create({});
    }

    if (action === "update_settings") {
      if (body.isActive !== undefined) championship.isActive = body.isActive;
      if (body.title) championship.title = body.title;
      if (body.activeStage) championship.activeStage = body.activeStage;
      await championship.save();
      return NextResponse.json({ success: true, championship });
    }

    if (action === "regenerate_token") {
      const { judgeId } = body;
      const judge = championship.judges.find((j: any) => j.id === judgeId);
      if (judge) {
        const randHex = crypto.randomBytes(6).toString("hex");
        judge.secretToken = `hbc-${judgeId.replace("judge-", "j")}-${randHex}`;
        championship.markModified("judges");
        await championship.save();
      }
      return NextResponse.json({ success: true, judges: championship.judges });
    }

    if (action === "update_participants") {
      const { category, participants } = body;
      const catKey = category === "regional" ? "regional" : "national";
      if (Array.isArray(participants)) {
        championship[catKey].participants = participants;
        championship.markModified(`${catKey}.participants`);
        await championship.save();
      }
      return NextResponse.json({ success: true, participants: championship[catKey].participants });
    }

    if (action === "update_criteria") {
      const { category, criteria } = body;
      const catKey = category === "regional" ? "regional" : "national";
      if (Array.isArray(criteria)) {
        championship[catKey].criteria = criteria;
        championship.markModified(`${catKey}.criteria`);
        await championship.save();
      }
      return NextResponse.json({ success: true, criteria: championship[catKey].criteria });
    }

    if (action === "seed_battles") {
      const { category } = body;
      const catKey = category === "regional" ? "regional" : "national";
      const participants = championship[catKey].participants;
      const scores = championship[catKey].eliminationScores;

      // Calculate combined score per participant
      const rankedList = participants.map((p: any) => {
        const j1Score = scores.find(
          (s: any) => s.participantId === p.id && s.judgeId === "judge-1"
        )?.totalScore || 0;
        const j2Score = scores.find(
          (s: any) => s.participantId === p.id && s.judgeId === "judge-2"
        )?.totalScore || 0;
        const total = Math.round((j1Score + j2Score) * 10) / 10;
        return {
          id: p.id,
          name: p.name,
          contenderNumber: p.contenderNumber,
          j1Score,
          j2Score,
          total,
        };
      });

      // Sort descending by total score
      rankedList.sort((a: any, b: any) => b.total - a.total);

      if (catKey === "national") {
        // Top 16 Seeding
        const top16 = rankedList.slice(0, 16);
        const seedMap: Record<number, { id: number; name: string; seed: number }> = {};
        top16.forEach((p: any, idx: number) => {
          seedMap[idx + 1] = { id: p.id, name: p.name, seed: idx + 1 };
        });

        // Exact seeding matchups:
        // T16-1: #1 vs #16
        // T16-2: #2 vs #15
        // T16-3: #3 vs #14
        // T16-4: #4 vs #13
        // T16-5: #5 vs #12
        // T16-6: #6 vs #11
        // T16-7: #7 vs #10
        // T16-8: #8 vs #9
        const pairRules: Record<string, [number, number]> = {
          "T16-1": [1, 16],
          "T16-2": [2, 15],
          "T16-3": [3, 14],
          "T16-4": [4, 13],
          "T16-5": [5, 12],
          "T16-6": [6, 11],
          "T16-7": [7, 10],
          "T16-8": [8, 9],
        };

        championship.national.battles.forEach((battle: any) => {
          if (pairRules[battle.matchId]) {
            const [seedA, seedB] = pairRules[battle.matchId];
            battle.competitorA = seedMap[seedA] || null;
            battle.competitorB = seedMap[seedB] || null;
            battle.winnerId = null;
            battle.winnerName = null;
            battle.judge1Vote = null;
            battle.judge2Vote = null;
          } else {
            // Reset subsequent rounds
            battle.competitorA = null;
            battle.competitorB = null;
            battle.winnerId = null;
            battle.winnerName = null;
            battle.judge1Vote = null;
            battle.judge2Vote = null;
          }
        });

        championship.markModified("national.battles");
        await championship.save();
        return NextResponse.json({
          success: true,
          message: "National Top 16 Battles seeded successfully!",
          battles: championship.national.battles,
        });
      } else {
        // Regional Top 8 Seeding
        const top8 = rankedList.slice(0, 8);
        const seedMap: Record<number, { id: number; name: string; seed: number }> = {};
        top8.forEach((p: any, idx: number) => {
          seedMap[idx + 1] = { id: p.id, name: p.name, seed: idx + 1 };
        });

        const pairRules: Record<string, [number, number]> = {
          RQF1: [1, 8],
          RQF2: [2, 7],
          RQF3: [3, 6],
          RQF4: [4, 5],
        };

        championship.regional.battles.forEach((battle: any) => {
          if (pairRules[battle.matchId]) {
            const [seedA, seedB] = pairRules[battle.matchId];
            battle.competitorA = seedMap[seedA] || null;
            battle.competitorB = seedMap[seedB] || null;
            battle.winnerId = null;
            battle.winnerName = null;
          } else {
            battle.competitorA = null;
            battle.competitorB = null;
            battle.winnerId = null;
            battle.winnerName = null;
          }
        });

        championship.markModified("regional.battles");
        await championship.save();
        return NextResponse.json({
          success: true,
          message: "Regional Top 8 Battles seeded successfully!",
          battles: championship.regional.battles,
        });
      }
    }

    if (action === "set_battle_winner") {
      const { category, matchId, winnerId, winnerName } = body;
      const catKey = category === "regional" ? "regional" : "national";
      const battles = championship[catKey].battles;

      const currentMatch = battles.find((b: any) => b.matchId === matchId);
      if (!currentMatch) {
        return NextResponse.json({ message: "Match not found" }, { status: 404 });
      }

      currentMatch.winnerId = winnerId;
      currentMatch.winnerName = winnerName;

      // Advance winner to next match if specified
      if (currentMatch.nextMatchId && currentMatch.nextMatchSlot) {
        const nextMatch = battles.find(
          (b: any) => b.matchId === currentMatch.nextMatchId
        );
        if (nextMatch) {
          const advancingCompetitor = {
            id: winnerId,
            name: winnerName,
            seed:
              currentMatch.competitorA?.id === winnerId
                ? currentMatch.competitorA?.seed
                : currentMatch.competitorB?.seed,
          };

          if (currentMatch.nextMatchSlot === "A") {
            nextMatch.competitorA = advancingCompetitor;
          } else {
            nextMatch.competitorB = advancingCompetitor;
          }
        }
      }

      // If this was a semi-final, auto-place the losing competitor into the 3rd place battle
      if (currentMatch.matchId === "SF1" || currentMatch.matchId === "SF2" || currentMatch.matchId === "RSF1" || currentMatch.matchId === "RSF2") {
        const thirdPlaceMatchId = currentMatch.matchId.startsWith("R") ? "RTHIRD_PLACE" : "THIRD_PLACE";
        const thirdPlaceMatch = championship[catKey].battles.find(
          (b: any) => b.matchId === thirdPlaceMatchId
        );
        if (thirdPlaceMatch) {
          const losingComp = currentMatch.competitorA?.id === currentMatch.winnerId ? currentMatch.competitorB : currentMatch.competitorA;
          if (losingComp) {
            if (currentMatch.matchId === "SF1" || currentMatch.matchId === "RSF1") {
              thirdPlaceMatch.competitorA = losingComp;
            } else {
              thirdPlaceMatch.competitorB = losingComp;
            }
          }
        }
      }

      championship.markModified(`${catKey}.battles`);
      await championship.save();

      return NextResponse.json({
        success: true,
        battles: championship[catKey].battles,
      });
    }

    if (action === "clear_data") {
      const { category } = body; // "national", "regional", or "all"

      if (category === "national" || category === "all") {
        championship.national.eliminationScores = [];
        championship.national.battles = JSON.parse(JSON.stringify(INITIAL_NATIONAL_BATTLES));
        championship.markModified("national.eliminationScores");
        championship.markModified("national.battles");
      }

      if (category === "regional" || category === "all") {
        championship.regional.eliminationScores = [];
        championship.regional.battles = JSON.parse(JSON.stringify(INITIAL_REGIONAL_BATTLES));
        championship.markModified("regional.eliminationScores");
        championship.markModified("regional.battles");
      }

      await championship.save();
      return NextResponse.json({
        success: true,
        message: "Championship data successfully reset to fresh event state!",
        championship,
      });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error.message && error.message.includes("Not authorized")) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { message: error.message || "Failed to execute admin action" },
      { status: 500 }
    );
  }
}
