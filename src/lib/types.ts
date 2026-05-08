export interface VerseResult {
  verse_key: string
  surah_name: string
  arabic: string
  translation: string
  relevance: number
  connection: string
  // Enriched from Quran Foundation API
  audio_url?: string
  tafsir?: string
  word_count?: number
}

export interface MatchResponse {
  situation_summary: string
  verses: VerseResult[]
}

export interface SavedVerse {
  verse_key: string
  surah_name: string
  translation: string
  arabic: string
  situation: string
  saved_at: string
}

export interface Reflection {
  text: string
  situation: string
  date: string
}

export interface QuranChapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  revelation_place: string
}
