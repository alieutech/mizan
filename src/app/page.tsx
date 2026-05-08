'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  X,
  Play,
  Pause,
  Copy,
  Check,
} from 'lucide-react'
import { MatchResponse, SavedVerse, VerseResult } from '@/lib/types'
import { getVerseAudioUrl } from '@/lib/utils'

const MAX_CHARS = 600

// ── Audio Player ──────────────────────────────────────────────────────────────

function AudioPlayer({ verseKey }: { verseKey: string }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={getVerseAudioUrl(verseKey)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-xs text-ink-muted hover:text-gold transition-colors group"
      >
        <span
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
            playing
              ? 'border-gold bg-gold/20 text-gold'
              : 'border-ink-muted/30 group-hover:border-gold/50 group-hover:text-gold'
          }`}
        >
          {playing ? <Pause size={9} /> : <Play size={9} className="ml-0.5" />}
        </span>
        <span className="hidden sm:inline">{playing ? 'Pause' : 'Play recitation'}</span>
      </button>
    </div>
  )
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ verse }: { verse: VerseResult }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = `${verse.arabic}\n\n"${verse.translation}"\n\n— ${verse.surah_name} (${verse.verse_key})`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold transition-colors"
      title="Copy verse"
    >
      {copied ? (
        <Check size={13} className="text-green-400" />
      ) : (
        <Copy size={13} />
      )}
      <span className={copied ? 'text-green-400' : ''}>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}

// ── Skeleton Loading Card ─────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-parchment-card border border-gold/10 rounded-2xl p-4 sm:p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gold/10 rounded-full w-28" />
        <div className="h-4 w-4 bg-gold/10 rounded" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-7 bg-gold/10 rounded-lg w-full" />
        <div className="h-7 bg-gold/10 rounded-lg w-2/3 ml-auto" />
      </div>
      <div className="border-l-2 border-gold/10 pl-4 space-y-1.5">
        <div className="h-3 bg-gold/10 rounded-full w-full" />
        <div className="h-3 bg-gold/10 rounded-full w-5/6" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-gold/10 rounded-full w-full" />
        <div className="h-3 bg-gold/10 rounded-full w-full" />
        <div className="h-3 bg-gold/10 rounded-full w-4/5" />
      </div>
      <div className="h-px bg-gold/10" />
      <div className="flex justify-between">
        <div className="h-3 bg-gold/10 rounded-full w-32" />
        <div className="h-3 bg-gold/10 rounded-full w-16" />
      </div>
    </div>
  )
}

// ── Verse Card ────────────────────────────────────────────────────────────────

function VerseCard({
  verse,
  saved,
  onToggleSave,
  index,
}: {
  verse: VerseResult
  saved: boolean
  onToggleSave: () => void
  index: number
}) {
  const [tafsirOpen, setTafsirOpen] = useState(false)

  return (
    <div
      className="bg-parchment-card border border-gold/20 rounded-2xl p-4 sm:p-6 space-y-5 hover:border-gold/40 transition-colors"
      style={{
        animation: 'fadeSlideIn 0.5s ease forwards',
        animationDelay: `${index * 130}ms`,
        opacity: 0,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            {verse.surah_name}
          </span>
          <span className="ml-2 text-xs text-ink-muted">{verse.verse_key}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <CopyButton verse={verse} />
          <button
            onClick={onToggleSave}
            className={`p-1 transition-colors ${
              saved ? 'text-gold' : 'text-ink-muted hover:text-gold'
            }`}
            title={saved ? 'Unsave' : 'Save verse'}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      {/* Arabic */}
      <p
        className="font-amiri text-right text-2xl md:text-3xl leading-loose text-ink"
        dir="rtl"
        lang="ar"
      >
        {verse.arabic}
      </p>

      {/* Translation */}
      <p className="text-ink-light text-sm italic leading-relaxed border-l-2 border-gold/30 pl-4">
        {verse.translation}
      </p>

      {/* Connection — AI explanation */}
      <div
        className="text-ink text-sm leading-relaxed [&_strong]:font-semibold [&_strong]:text-gold [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: verse.connection }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gold/10">
        <AudioPlayer verseKey={verse.verse_key} />
        {verse.tafsir && (
          <button
            onClick={() => setTafsirOpen(!tafsirOpen)}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-gold transition-colors"
          >
            {tafsirOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>Tafsir</span>
          </button>
        )}
      </div>

      {/* Ibn Kathir Tafsir */}
      {verse.tafsir && tafsirOpen && (
        <div className="text-xs text-ink-muted leading-relaxed bg-parchment/40 rounded-xl p-4 border border-gold/10">
          <p className="text-gold text-xs font-semibold mb-2 uppercase tracking-wider">
            Ibn Kathir
          </p>
          {verse.tafsir}…
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([])
  const [view, setView] = useState<'search' | 'saved'>('search')
  const [error, setError] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mizan_saved')
      if (saved) setSavedVerses(JSON.parse(saved))
    } catch {}
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!situation.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/verses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setResult(data)
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        150
      )
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const isSaved = (key: string) => savedVerses.some((v) => v.verse_key === key)

  const toggleSave = (verse: VerseResult) => {
    let updated: SavedVerse[]
    if (isSaved(verse.verse_key)) {
      updated = savedVerses.filter((v) => v.verse_key !== verse.verse_key)
    } else {
      const entry: SavedVerse = {
        verse_key: verse.verse_key,
        surah_name: verse.surah_name,
        translation: verse.translation,
        arabic: verse.arabic,
        situation: situation.trim(),
        saved_at: new Date().toISOString(),
      }
      updated = [entry, ...savedVerses]
    }
    setSavedVerses(updated)
    localStorage.setItem('mizan_saved', JSON.stringify(updated))
  }

  const removeSaved = (key: string) => {
    const updated = savedVerses.filter((v) => v.verse_key !== key)
    setSavedVerses(updated)
    localStorage.setItem('mizan_saved', JSON.stringify(updated))
  }

  const resetSearch = () => {
    setResult(null)
    setSituation('')
    setError('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return (
    <div className="min-h-screen bg-parchment font-sans text-ink">

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-10 bg-parchment/95 backdrop-blur-sm border-b border-gold/15">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => { setView('search'); resetSearch() }}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/images/mizan-logo.png"
              alt="Mizan"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="font-semibold text-sm tracking-wide text-ink">Mizan</span>
          </button>

          <button
            onClick={() => setView(view === 'saved' ? 'search' : 'saved')}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
              view === 'saved'
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gold/20 text-ink-muted hover:border-gold/40 hover:text-ink'
            }`}
          >
            <Bookmark size={14} />
            Saved
            {savedVerses.length > 0 && (
              <span className="bg-gold text-parchment text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {savedVerses.length > 9 ? '9+' : savedVerses.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Saved View ── */}
      {view === 'saved' ? (
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-8">
            <h1 className="font-playfair text-2xl text-ink">Your Collection</h1>
            <span className="text-xs text-ink-muted">
              {savedVerses.length} verse{savedVerses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {savedVerses.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <Bookmark size={40} className="mx-auto text-ink-muted opacity-20" />
              <p className="font-medium text-ink">Your collection is empty.</p>
              <p className="text-sm text-ink-muted">
                Save verses that speak to you — they&apos;ll live here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedVerses.map((v, i) => (
                <div
                  key={v.verse_key}
                  className="bg-parchment-card border border-gold/20 rounded-2xl p-4 sm:p-5 space-y-4"
                  style={{
                    animation: 'fadeSlideIn 0.4s ease forwards',
                    animationDelay: `${i * 60}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gold uppercase tracking-widest">
                        {v.surah_name}
                      </span>
                      <span className="ml-2 text-xs text-ink-muted">{v.verse_key}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <AudioPlayer verseKey={v.verse_key} />
                      <button
                        onClick={() => removeSaved(v.verse_key)}
                        className="p-1 text-ink-muted hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p
                    className="font-amiri text-right text-2xl leading-loose text-ink"
                    dir="rtl"
                    lang="ar"
                  >
                    {v.arabic}
                  </p>

                  <p className="text-ink-light text-sm italic leading-relaxed border-l-2 border-gold/30 pl-4">
                    {v.translation}
                  </p>

                  {v.situation && (
                    <p className="text-xs text-ink-muted border-t border-gold/10 pt-3">
                      Saved for:{' '}
                      <span className="italic">
                        &ldquo;{v.situation.slice(0, 100)}
                        {v.situation.length > 100 ? '…' : ''}&rdquo;
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

      ) : (

        /* ── Search View ── */
        <main className="max-w-3xl mx-auto px-4">

          {/* Hero */}
          <section className="text-center py-10 sm:py-16 md:py-20">
            {/* Subtle gold radial glow behind logo */}
            <div className="relative flex justify-center mb-7">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gold/10 blur-2xl" />
              </div>
              <Image
                src="/images/mizan-logo.png"
                alt="Mizan"
                width={110}
                height={110}
                className="relative rounded-full shadow-xl"
                priority
              />
            </div>
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl text-ink mb-3 leading-snug">
              The Quran has a verse<br className="hidden sm:block" /> for what you&apos;re carrying.
            </h1>
            <p className="text-ink-muted text-sm max-w-xs mx-auto leading-relaxed">
              Describe your moment — Mizan finds the words written for you.
            </p>
          </section>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={situation}
                onChange={(e) => setSituation(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Share what you're carrying — a struggle, a question, a feeling, a moment of gratitude…"
                rows={5}
                className="w-full bg-parchment-card border border-gold/25 rounded-2xl p-4 sm:p-5 pr-16 text-ink placeholder:text-ink-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-gold/50 text-base sm:text-sm leading-relaxed transition-all"
              />
              <span
                className={`absolute bottom-4 right-4 text-xs transition-colors ${
                  situation.length > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-ink-muted/40'
                }`}
              >
                {situation.length}/{MAX_CHARS}
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3">
                <X size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!situation.trim() || loading}
                className="flex items-center justify-center gap-2 bg-gold text-parchment w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-full text-sm font-semibold hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold/20 hover:shadow-gold/30"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                    Finding verses…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Find My Verses
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Skeleton loading state */}
          {loading && (
            <div className="py-12 space-y-4">
              <p className="text-center text-xs text-gold uppercase tracking-widest animate-pulse mb-6">
                Searching the Quran…
              </p>
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <section ref={resultsRef} className="py-12 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold">
                  verses for
                </p>
                <h2 className="font-playfair text-2xl md:text-3xl text-ink">
                  {result.situation_summary}
                </h2>
                <p className="text-xs text-ink-muted">
                  {result.verses.length} verses · tap{' '}
                  <Bookmark size={11} className="inline mb-0.5" /> to save ·{' '}
                  <Play size={11} className="inline mb-0.5" /> to listen
                </p>
              </div>

              <div className="space-y-4">
                {result.verses.map((verse, i) => (
                  <VerseCard
                    key={verse.verse_key}
                    verse={verse}
                    saved={isSaved(verse.verse_key)}
                    onToggleSave={() => toggleSave(verse)}
                    index={i}
                  />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={resetSearch}
                  className="text-sm text-ink-muted hover:text-ink transition-colors underline underline-offset-4 decoration-gold/30 hover:decoration-gold/60"
                >
                  Search again
                </button>
              </div>
            </section>
          )}

          <div className="h-16" />
        </main>
      )}
    </div>
  )
}
