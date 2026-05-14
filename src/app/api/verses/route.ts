import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { VERSE_MATCHER_SYSTEM_PROMPT } from "@/lib/prompts"
import { MatchResponse, VerseResult } from "@/lib/types"
import { getVerseByKey, getTafsirByVerseKey } from "@/lib/quranApi"

// ── Fallback verses (used when API key not set yet) ──
const FALLBACK: MatchResponse = {
  situation_summary: "your moment",
  verses: [
    {
      verse_key: "94:5",
      surah_name: "Ash-Sharh",
      arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "For indeed, with hardship will be ease.",
      relevance: 5,
      connection:
        "Allah repeats this promise <strong>twice</strong> in the same breath — not as comfort, but as certainty. Whatever weight you are carrying right now, this verse is a covenant: ease is not coming <em>after</em> your difficulty, it walks alongside it.",
    },
    {
      verse_key: "2:286",
      surah_name: "Al-Baqarah",
      arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
      translation: "Allah does not burden a soul beyond that it can bear.",
      relevance: 4,
      connection:
        "This is not just reassurance — it is <strong>divine knowledge of your capacity</strong>. Allah, who created you, has assessed exactly what you can carry. If this is in your life, it means He knows you are capable of bearing it.",
    },
    {
      verse_key: "13:28",
      surah_name: "Ar-Ra'd",
      arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translation: "Verily, in the remembrance of Allah do hearts find rest.",
      relevance: 4,
      connection:
        "When the mind races and the heart is unsettled, this verse names the <strong>only true anchor</strong>. Not solutions, not certainty — but remembrance. Turn toward dhikr in whatever form feels natural to you right now.",
    },
    {
      verse_key: "3:139",
      surah_name: "Ali 'Imran",
      arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ",
      translation:
        "Do not weaken and do not grieve, for you will be superior if you are believers.",
      relevance: 3,
      connection:
        "This was revealed to a community after a painful defeat. Allah did not deny their pain — He acknowledged it, then reminded them of their <strong>true standing</strong>. Your grief is real. And you are still standing.",
    },
  ],
}

// ── Enrich verse with live Quran Foundation API data ──
async function enrichVerse(verse: VerseResult): Promise<VerseResult> {
  try {
    const [liveVerse, tafsir] = await Promise.all([
      getVerseByKey(verse.verse_key),
      getTafsirByVerseKey(verse.verse_key),
    ])

    // Normalise audio URL from QF API response (may be relative or absolute)
    const rawAudio = liveVerse?.audio?.url
    const audioUrl = rawAudio
      ? rawAudio.startsWith("http")
        ? rawAudio
        : `https://audio.qurancdn.com/${rawAudio}`
      : undefined

    return {
      ...verse,
      arabic: liveVerse?.text_uthmani || verse.arabic,
      translation:
        liveVerse?.translations?.[0]?.text?.replace(/<[^>]*>/g, "") ||
        verse.translation,
      tafsir: tafsir?.text
        ? tafsir.text.replace(/<[^>]*>/g, "").slice(0, 400)
        : undefined,
      audio_url: audioUrl,
    }
  } catch {
    // If enrichment fails, return original AI verse unchanged
    return verse
  }
}

export async function POST(req: NextRequest) {
  try {
    const { situation } = await req.json()

    if (!situation || typeof situation !== "string") {
      return NextResponse.json(
        { error: "situation is required" },
        { status: 400 }
      )
    }

    if (situation.length > 600) {
      return NextResponse.json(
        { error: "situation must be under 600 characters" },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn("ANTHROPIC_API_KEY not set — returning fallback verses")
      // Still enrich fallback with live QF data
      const enriched = await Promise.all(FALLBACK.verses.map(enrichVerse))
      return NextResponse.json({ ...FALLBACK, verses: enriched })
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: VERSE_MATCHER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `My situation: ${situation}` }],
    })

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : ""
    const clean = rawText.replace(/```json|```/g, "").trim()
    const parsed: MatchResponse = JSON.parse(clean)

    // Enrich every AI-matched verse with live Quran Foundation API data
    const enriched = await Promise.all(parsed.verses.map(enrichVerse))

    return NextResponse.json({ ...parsed, verses: enriched })
  } catch (error: any) {
    console.error("Verse matching error:", error?.message || error)

    if (
      error?.status === 400 ||
      error?.status === 404 ||
      error?.status === 429 ||
      error?.status === 401 ||
      error?.message?.includes("quota") ||
      error?.message?.includes("API_KEY_INVALID") ||
      error?.message?.includes("API key not valid") ||
      error?.message?.includes("model")
    ) {
      console.warn("API issue — returning fallback verses")
      const enriched = await Promise.all(FALLBACK.verses.map(enrichVerse))
      return NextResponse.json({ ...FALLBACK, verses: enriched })
    }

    return NextResponse.json(
      { error: "Failed to find verses. Please try again." },
      { status: 500 }
    )
  }
}
