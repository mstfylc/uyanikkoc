import { NextResponse } from "next/server";

function isAiCoachEnabled(): boolean {
  const flag = process.env.AI_COACH_ENABLED;
  return flag === "true" || flag === "1";
}

export async function GET() {
  if (!isAiCoachEnabled()) {
    return NextResponse.json(
      {
        enabled: false,
        message: "AI Koc yakinda. Canli yanit uretilmiyor.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      enabled: true,
      message: "Placeholder — canli AI henuz aktif degil.",
    },
    { status: 200 },
  );
}
