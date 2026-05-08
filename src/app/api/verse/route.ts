import { NextRequest, NextResponse } from "next/server"
import { getVerseByKey, getTafsirByVerseKey } from "@/lib/quranApi"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const verseKey = searchParams.get("key")
  const withTafsir = searchParams.get("tafsir") === "true"

  if (!verseKey) {
    return NextResponse.json({ error: "verse key required" }, { status: 400 })
  }

  try {
    const [verse, tafsir] = await Promise.all([
      getVerseByKey(verseKey),
      withTafsir ? getTafsirByVerseKey(verseKey) : Promise.resolve(null),
    ])

    return NextResponse.json({ verse, tafsir })
  } catch (error) {
    console.error("Verse detail error:", error)
    return NextResponse.json(
      { error: "Failed to fetch verse details" },
      { status: 500 }
    )
  }
}
