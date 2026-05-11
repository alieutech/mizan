import { NextRequest, NextResponse } from "next/server"
import { getVersesByChapter, getAudioByChapter } from "@/lib/quranApi"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const chapterId = parseInt(params.id)
  if (isNaN(chapterId) || chapterId < 1 || chapterId > 114) {
    return NextResponse.json({ error: "Invalid chapter" }, { status: 400 })
  }

  try {
    const [verses, audioFiles] = await Promise.all([
      getVersesByChapter(chapterId, { perPage: 300 }),
      getAudioByChapter(7, chapterId), // Mishary Alafasy, recitation ID 7
    ])

    // Build verse_key → audio URL map from QF API response
    const audioMap: Record<string, string> = {}
    for (const af of audioFiles) {
      if (af.verse_key && af.url) {
        audioMap[af.verse_key] = af.url.startsWith("http")
          ? af.url
          : `https://audio.qurancdn.com/${af.url}`
      }
    }

    return NextResponse.json({ verses, audioMap })
  } catch (error) {
    console.error("Chapter detail error:", error)
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    )
  }
}
