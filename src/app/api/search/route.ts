import { NextRequest, NextResponse } from "next/server"
import { searchVerses } from "@/lib/quranApi"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 })
  }

  try {
    const results = await searchVerses(query)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
