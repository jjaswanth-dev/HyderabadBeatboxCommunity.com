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
    const eventStatus = championship.eventStatus || "results";
    const defaultNavLabel = eventStatus === "live" ? "LIVE CHAMPIONSHIP" : "CHAMPIONSHIP RESULTS 2026";
    const navLabel = championship.navLabel || defaultNavLabel;

    const publicData = {
      _id: championship._id,
      isActive: championship.isActive,
      title: championship.title,
      activeStage: championship.activeStage,
      eventStatus,
      navLabel,
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
