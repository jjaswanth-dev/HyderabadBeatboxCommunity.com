import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Championship from "@/models/Championship";
import {
  DEFAULT_NATIONAL_PARTICIPANTS,
  DEFAULT_REGIONAL_PARTICIPANTS,
} from "@/lib/championshipDefaults";

export async function GET() {
  await connectToDatabase();
  try {
    let championship = await Championship.findOne({});
    if (!championship) {
      championship = await Championship.create({});
    }

    // Auto-sync roster if database has previous schema/data
    if (
      championship.national?.participants?.[0]?.name !== "Parth" ||
      championship.regional?.participants?.[0]?.name !== "Mespop" ||
      championship.regional?.participants?.length !== DEFAULT_REGIONAL_PARTICIPANTS.length
    ) {
      championship.national.participants = DEFAULT_NATIONAL_PARTICIPANTS;
      championship.regional.participants = DEFAULT_REGIONAL_PARTICIPANTS;
      championship.markModified("national.participants");
      championship.markModified("regional.participants");
      await championship.save();
    }

    // Auto-sync judge names to Nabinbe and Kevin
    let judgeModified = false;
    championship.judges.forEach((j: any) => {
      if (j.id === "judge-1" && j.name !== "Nabinbe") {
        j.name = "Nabinbe";
        judgeModified = true;
      }
      if (j.id === "judge-2" && j.name !== "Kevin") {
        j.name = "Kevin";
        judgeModified = true;
      }
    });
    if (judgeModified) {
      championship.markModified("judges");
      await championship.save();
    }

    // Prepare public safe response (exclude judge secretTokens)
    const publicData = {
      _id: championship._id,
      isActive: championship.isActive,
      title: championship.title,
      activeStage: championship.activeStage,
      judges: championship.judges.map((j: any) => ({
        id: j.id,
        name: j.name,
        isActive: j.isActive,
      })),
      national: {
        participants: championship.national.participants,
        criteria: championship.national.criteria,
        eliminationScores: championship.national.eliminationScores,
        battles: championship.national.battles,
      },
      regional: {
        participants: championship.regional.participants,
        criteria: championship.regional.criteria,
        eliminationScores: championship.regional.eliminationScores,
        battles: championship.regional.battles,
      },
      updatedAt: championship.updatedAt,
    };

    return NextResponse.json(publicData, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=20",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch championship data" },
      { status: 500 }
    );
  }
}
