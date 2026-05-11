import { NextResponse } from "next/server"
import { getVerseByKey, getTafsirByVerseKey } from "@/lib/quranApi"

// 30 curated verses — one shown per day of the month, cycling
const DAILY_VERSES = [
  "2:255",  // Ayat al-Kursi
  "1:1",    // Al-Fatiha
  "94:5",   // With hardship comes ease
  "2:286",  // No burden beyond capacity
  "13:28",  // Hearts find rest in dhikr
  "3:173",  // Sufficient is Allah for us
  "65:3",   // Whoever trusts in Allah
  "2:153",  // Seek help through patience and prayer
  "39:53",  // Do not despair of Allah's mercy
  "93:5",   // Your Lord will give — you will be satisfied
  "94:1",   // Did We not expand your chest
  "16:97",  // Pure life for believers
  "3:139",  // Do not weaken or grieve
  "57:4",   // He is with you wherever you are
  "2:216",  // You may dislike what is good for you
  "9:51",   // Nothing but what Allah has decreed
  "40:60",  // Call upon Me, I will respond
  "89:27",  // O tranquil soul, return to your Lord
  "3:160",  // If Allah helps you, none can overcome you
  "33:41",  // Remember Allah with much remembrance
  "20:25",  // My Lord, expand for me my chest
  "25:70",  // Allah will replace sins with good deeds
  "49:13",  // Most noble is most righteous
  "17:79",  // Night prayer — an honoured station
  "112:1",  // Say: He is Allah, the One
  "55:13",  // Which of your Lord's favours will you deny
  "36:58",  // Peace — a word from a Merciful Lord
  "2:152",  // Remember Me and I will remember you
  "3:8",    // Do not let our hearts deviate
  "29:45",  // Prayer prevents immorality
]

export async function GET() {
  const dayIndex = (new Date().getDate() - 1) % DAILY_VERSES.length
  const verseKey = DAILY_VERSES[dayIndex]

  try {
    const [verse, tafsir] = await Promise.all([
      getVerseByKey(verseKey),
      getTafsirByVerseKey(verseKey),
    ])

    return NextResponse.json({
      verse_key: verseKey,
      arabic: verse?.text_uthmani || "",
      translation:
        verse?.translations?.[0]?.text?.replace(/<[^>]*>/g, "") || "",
      tafsir: tafsir?.text
        ? tafsir.text.replace(/<[^>]*>/g, "").slice(0, 300)
        : null,
      audio_url: verse?.audio?.url || null,
    })
  } catch (error) {
    console.error("Verse of day error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
