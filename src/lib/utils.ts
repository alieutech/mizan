import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mishary Rashid Alafasy recitation via qurancdn CDN
export function getVerseAudioUrl(verseKey: string): string {
  const [chapter, verse] = verseKey.split(":")
  return `https://audio.qurancdn.com/Alafasy_128kbps/${chapter.padStart(3, "0")}/${verse.padStart(3, "0")}.mp3`
}
