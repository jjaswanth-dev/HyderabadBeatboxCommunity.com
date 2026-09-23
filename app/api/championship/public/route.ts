import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Championship from "@/models/Championship";

export async function GET() {
  await connectToDatabase();
  try {
    let championship = await Championship.findOne({});
    if (!championship) {
      championship = await Championship.create({});
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

    return NextResponse.json(publicData);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch championship data" },
      { status: 500 }
    );
  }
}
