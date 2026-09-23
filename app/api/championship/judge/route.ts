import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Championship from "@/models/Championship";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Access token is required" },
        { status: 400 }
      );
    }

    let championship = await Championship.findOne({});
    if (!championship) {
      championship = await Championship.create({});
    }

    const judge = championship.judges.find(
      (j: any) => j.secretToken === token && j.isActive
    );

    if (!judge) {
      return NextResponse.json(
        { message: "Invalid or inactive judge access link" },
        { status: 403 }
      );
    }

    // Filter only this judge's scores
    const filterScoresForJudge = (scores: any[]) => {
      return (scores || []).filter((s) => s.judgeId === judge.id);
    };

    return NextResponse.json({
      judge: {
        id: judge.id,
        name: judge.name,
      },
      title: championship.title,
      activeStage: championship.activeStage,
      national: {
        participants: championship.national.participants,
        criteria: championship.national.criteria,
        myScores: filterScoresForJudge(championship.national.eliminationScores),
        battles: championship.national.battles.map((b: any) => ({
          matchId: b.matchId,
          title: b.title,
          roundStage: b.roundStage,
          roundDurationText: b.roundDurationText,
          competitorA: b.competitorA,
          competitorB: b.competitorB,
          myVote: judge.id === "judge-1" ? b.judge1Vote : b.judge2Vote,
          winnerId: b.winnerId,
          winnerName: b.winnerName,
        })),
      },
      regional: {
        participants: championship.regional.participants,
        criteria: championship.regional.criteria,
        myScores: filterScoresForJudge(championship.regional.eliminationScores),
        battles: championship.regional.battles.map((b: any) => ({
          matchId: b.matchId,
          title: b.title,
          roundStage: b.roundStage,
          roundDurationText: b.roundDurationText,
          competitorA: b.competitorA,
          competitorB: b.competitorB,
          myVote: judge.id === "judge-1" ? b.judge1Vote : b.judge2Vote,
          winnerId: b.winnerId,
          winnerName: b.winnerName,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to load judge data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const { token, type, category = "national", participantId, scores, notes, battleMatchId, vote } = body;

    if (!token) {
      return NextResponse.json({ message: "Token missing" }, { status: 400 });
    }

    const championship = await Championship.findOne({});
    if (!championship) {
      return NextResponse.json({ message: "Championship not found" }, { status: 404 });
    }

    const judge = championship.judges.find(
      (j: any) => j.secretToken === token && j.isActive
    );

    if (!judge) {
      return NextResponse.json({ message: "Unauthorized token" }, { status: 403 });
    }

    const catKey = category === "regional" ? "regional" : "national";

    if (type === "battle_vote" || type === "declare_winner") {
      const { winnerId: proposedWinnerId, winnerName: proposedWinnerName } = body;
      const battle = championship[catKey].battles.find(
        (b: any) => b.matchId === battleMatchId
      );
      if (!battle) {
        return NextResponse.json({ message: "Battle match not found" }, { status: 404 });
      }

      if (type === "battle_vote") {
        if (judge.id === "judge-1") {
          battle.judge1Vote = vote; // "A" or "B"
        } else {
          battle.judge2Vote = vote;
        }

        // If both judges voted for the same competitor, auto-declare winner!
        if (battle.judge1Vote && battle.judge2Vote && battle.judge1Vote === battle.judge2Vote) {
          const chosenComp = battle.judge1Vote === "A" ? battle.competitorA : battle.competitorB;
          if (chosenComp) {
            battle.winnerId = chosenComp.id;
            battle.winnerName = chosenComp.name;
          }
        }
      }

      if (type === "declare_winner") {
        battle.winnerId = proposedWinnerId;
        battle.winnerName = proposedWinnerName;
      }

      // If winner is decided, advance winner to the next round slot (Top 8, Top 4, Finals)
      if (battle.winnerId && battle.nextMatchId && battle.nextMatchSlot) {
        const nextMatch = championship[catKey].battles.find(
          (b: any) => b.matchId === battle.nextMatchId
        );
        if (nextMatch) {
          const advancingCompetitor = {
            id: battle.winnerId,
            name: battle.winnerName,
            seed:
              battle.competitorA?.id === battle.winnerId
                ? battle.competitorA?.seed
                : battle.competitorB?.seed,
          };

          if (battle.nextMatchSlot === "A") {
            nextMatch.competitorA = advancingCompetitor;
          } else {
            nextMatch.competitorB = advancingCompetitor;
          }
        }
      }

      // If this was a semi-final, auto-place the losing competitor into the 3rd place battle
      if (battle.matchId === "SF1" || battle.matchId === "SF2" || battle.matchId === "RSF1" || battle.matchId === "RSF2") {
        const thirdPlaceMatchId = battle.matchId.startsWith("R") ? "RTHIRD_PLACE" : "THIRD_PLACE";
        const thirdPlaceMatch = championship[catKey].battles.find(
          (b: any) => b.matchId === thirdPlaceMatchId
        );
        if (thirdPlaceMatch) {
          const losingComp = battle.competitorA?.id === battle.winnerId ? battle.competitorB : battle.competitorA;
          if (losingComp) {
            if (battle.matchId === "SF1" || battle.matchId === "RSF1") {
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
        battleMatchId,
        vote: battle.judge1Vote,
        winnerId: battle.winnerId,
        winnerName: battle.winnerName,
        battles: championship[catKey].battles,
      });
    }

    // Otherwise it's an elimination score update
    if (participantId === undefined || participantId === null) {
      return NextResponse.json(
        { message: "Participant ID is required" },
        { status: 400 }
      );
    }

    // Calculate total score from criteria map
    let totalScore = 0;
    if (scores && typeof scores === "object") {
      Object.values(scores).forEach((val) => {
        const num = Number(val);
        if (!isNaN(num)) totalScore += num;
      });
    }
    // Round to 1 decimal place
    totalScore = Math.round(totalScore * 10) / 10;

    const existingScoreIdx = championship[catKey].eliminationScores.findIndex(
      (s: any) => s.participantId === Number(participantId) && s.judgeId === judge.id
    );

    const scoreData = {
      participantId: Number(participantId),
      judgeId: judge.id,
      scores: scores || {},
      totalScore,
      notes: notes !== undefined ? notes : "",
      updatedAt: new Date(),
    };

    if (existingScoreIdx >= 0) {
      championship[catKey].eliminationScores[existingScoreIdx] = scoreData;
    } else {
      championship[catKey].eliminationScores.push(scoreData);
    }

    championship.markModified(`${catKey}.eliminationScores`);
    await championship.save();

    return NextResponse.json({
      success: true,
      score: scoreData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to save score" },
      { status: 500 }
    );
  }
}
