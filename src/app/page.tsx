'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Copy,
  Check,
  LogOut,
  Pause,
  Play,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react'
import {
  MatchResponse,
  QuranChapter,
  QuranVerse,
  SavedVerse,
  VerseResult,
  VotdData,
} from '@/lib/types'
import { getVerseAudioUrl } from '@/lib/utils'

const MAX_CHARS = 600
type View = 'home' | 'chapters' | 'search' | 'saved'
type QFUser = { sub?: string; name?: string; email?: string; preferred_username?: string; username?: string }

function displayName(user: QFUser) {
  return user.preferred_username || user.username || user.name || user.email?.split('@')[0] || 'Signed in'
}

// ── Audio Player ──────────────────────────────────────────────────────────────

function AudioPlayer({ verseKey, audioUrl }: { verseKey: string; audioUrl?: string }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const src = audioUrl || getVerseAudioUrl(verseKey)

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
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} preload="none" />
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
        <span className="hidden sm:inline">{playing ? 'Pause' : 'Play'}</span>
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
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
      <span className={copied ? 'text-green-400' : ''}>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-parchment-card border border-gold/10 rounded-2xl p-4 sm:p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gold/10 rounded-full w-28" />
        <div className="h-4 w-4 bg-gold/10 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-7 bg-gold/10 rounded-lg w-full" />
        <div className="h-7 bg-gold/10 rounded-lg w-2/3 ml-auto" />
      </div>
      <div className="border-l-2 border-gold/10 pl-4 space-y-1.5">
        <div className="h-3 bg-gold/10 rounded-full w-full" />
        <div className="h-3 bg-gold/10 rounded-full w-5/6" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-gold/10 rounded-full w-full" />
        <div className="h-3 bg-gold/10 rounded-full w-4/5" />
      </div>
    </div>
  )
}

// ── Verse Card (AI results) ───────────────────────────────────────────────────

function VerseCard({
  verse, saved, onToggleSave, index,
}: {
  verse: VerseResult; saved: boolean; onToggleSave: () => void; index: number
}) {
  const [tafsirOpen, setTafsirOpen] = useState(false)
  return (
    <div
      className="bg-parchment-card border border-gold/20 rounded-2xl p-4 sm:p-6 space-y-5 hover:border-gold/40 transition-colors"
      style={{ animation: 'fadeSlideIn 0.5s ease forwards', animationDelay: `${index * 130}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold uppercase tracking-widest">{verse.surah_name}</span>
          <span className="ml-2 text-xs text-ink-muted">{verse.verse_key}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <CopyButton verse={verse} />
          <button
            onClick={onToggleSave}
            className={`p-1 transition-colors ${saved ? 'text-gold' : 'text-ink-muted hover:text-gold'}`}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>
      <p className="font-amiri text-right text-2xl md:text-3xl leading-loose text-ink" dir="rtl" lang="ar">
        {verse.arabic}
      </p>
      <p className="text-ink-light text-sm italic leading-relaxed border-l-2 border-gold/30 pl-4">
        {verse.translation}
      </p>
      <div
        className="text-ink text-sm leading-relaxed [&_strong]:font-semibold [&_strong]:text-gold [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: verse.connection }}
      />
      <div className="flex items-center justify-between pt-1 border-t border-gold/10">
        <AudioPlayer verseKey={verse.verse_key} audioUrl={verse.audio_url} />
        {verse.tafsir && (
          <button
            onClick={() => setTafsirOpen(!tafsirOpen)}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-gold transition-colors"
          >
            {tafsirOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Tafsir
          </button>
        )}
      </div>
      {verse.tafsir && tafsirOpen && (
        <div className="text-xs text-ink-muted leading-relaxed bg-parchment/40 rounded-xl p-4 border border-gold/10">
          <p className="text-gold text-xs font-semibold mb-2 uppercase tracking-wider">Ibn Kathir</p>
          {verse.tafsir}…
        </div>
      )}
    </div>
  )
}

// ── Verse of the Day Card ─────────────────────────────────────────────────────

function VotdCard({ votd }: { votd: VotdData }) {
  const [tafsirOpen, setTafsirOpen] = useState(false)
  return (
    <div
      className="bg-parchment-card border border-gold/25 rounded-2xl p-4 sm:p-5 space-y-3 mb-8"
      style={{ animation: 'fadeSlideIn 0.5s ease forwards', opacity: 0 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gold font-semibold">Verse of the Day</p>
        <span className="text-xs text-ink-muted">{votd.verse_key}</span>
      </div>
      <p className="font-amiri text-right text-xl sm:text-2xl leading-loose text-ink" dir="rtl" lang="ar">
        {votd.arabic}
      </p>
      <p className="text-ink-light text-sm italic leading-relaxed border-l-2 border-gold/30 pl-3">
        {votd.translation}
      </p>
      <div className="flex items-center justify-between pt-1 border-t border-gold/10">
        <AudioPlayer verseKey={votd.verse_key} audioUrl={votd.audio_url} />
        {votd.tafsir && (
          <button
            onClick={() => setTafsirOpen(!tafsirOpen)}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-gold transition-colors"
          >
            {tafsirOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Tafsir
          </button>
        )}
      </div>
      {votd.tafsir && tafsirOpen && (
        <div className="text-xs text-ink-muted leading-relaxed bg-parchment/40 rounded-xl p-4 border border-gold/10">
          <p className="text-gold text-xs font-semibold mb-2 uppercase tracking-wider">Ibn Kathir</p>
          {votd.tafsir}…
        </div>
      )}
    </div>
  )
}

// ── Nav Button ────────────────────────────────────────────────────────────────

function NavBtn({
  active, onClick, icon: Icon, label, count,
}: {
  active: boolean; onClick: () => void; icon: any; label: string; count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
        active
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
      {count != null && count > 0 && (
        <span className="bg-gold text-parchment text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState<View>('home')

  // Auth
  const [user, setUser] = useState<QFUser | null>(null)
  const [authReady, setAuthReady] = useState<boolean | null>(null) // null = checking
  const [authToast, setAuthToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Home view
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [error, setError] = useState('')
  const [votd, setVotd] = useState<VotdData | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Chapters view
  const [chapters, setChapters] = useState<QuranChapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<QuranChapter | null>(null)
  const [chapterVerses, setChapterVerses] = useState<QuranVerse[]>([])
  const [chapterAudioMap, setChapterAudioMap] = useState<Record<string, string>>({})
  const [chapterLoading, setChapterLoading] = useState(false)

  // Search view
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Saved
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([])

  // ── Init ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mizan_saved')
      if (saved) setSavedVerses(JSON.parse(saved))
    } catch {}
    textareaRef.current?.focus()

    // Fetch verse of the day
    fetch('/api/verse-of-day')
      .then(r => r.json())
      .then(d => { if (d.verse_key) setVotd(d) })
      .catch(() => {})

    // Check auth session
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user) })
      .catch(() => {})

    // Check if OAuth redirect URI is registered with QF
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(d => setAuthReady(d.ready ?? false))
      .catch(() => setAuthReady(false))

    // Handle OAuth redirect params
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'success') {
      setAuthToast({ type: 'success', msg: 'Signed in with Quran.com' })
      window.history.replaceState({}, '', '/')
      setTimeout(() => setAuthToast(null), 4000)
    } else if (params.get('auth_error')) {
      setAuthToast({ type: 'error', msg: 'Sign-in failed — please try again.' })
      window.history.replaceState({}, '', '/')
      setTimeout(() => setAuthToast(null), 4000)
    }
  }, [])

  // Fetch chapters lazily when view opens
  useEffect(() => {
    if (view === 'chapters' && chapters.length === 0 && !chaptersLoading) {
      setChaptersLoading(true)
      fetch('/api/chapters')
        .then(r => r.json())
        .then(d => setChapters(d.chapters || []))
        .catch(() => {})
        .finally(() => setChaptersLoading(false))
    }
  }, [view])

  // ── Handlers ──
  const handleMatch = async (e: React.FormEvent) => {
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
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const openChapter = async (chapter: QuranChapter) => {
    setSelectedChapter(chapter)
    setChapterVerses([])
    setChapterAudioMap({})
    setChapterLoading(true)
    try {
      const res = await fetch(`/api/chapters/${chapter.id}`)
      const data = await res.json()
      setChapterVerses(data.verses || [])
      setChapterAudioMap(data.audioMap || {})
    } catch {}
    finally { setChapterLoading(false) }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || searchLoading) return
    setSearchLoading(true)
    setHasSearched(true)
    setSearchResults([])
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch {}
    finally { setSearchLoading(false) }
  }

  const isSaved = (key: string) => savedVerses.some(v => v.verse_key === key)

  const toggleSave = (verse: VerseResult) => {
    let updated: SavedVerse[]
    if (isSaved(verse.verse_key)) {
      updated = savedVerses.filter(v => v.verse_key !== verse.verse_key)
    } else {
      updated = [{ verse_key: verse.verse_key, surah_name: verse.surah_name, translation: verse.translation, arabic: verse.arabic, situation: situation.trim(), saved_at: new Date().toISOString() }, ...savedVerses]
    }
    setSavedVerses(updated)
    localStorage.setItem('mizan_saved', JSON.stringify(updated))
  }

  const removeSaved = (key: string) => {
    const updated = savedVerses.filter(v => v.verse_key !== key)
    setSavedVerses(updated)
    localStorage.setItem('mizan_saved', JSON.stringify(updated))
  }

  const resetHome = () => {
    setResult(null); setSituation(''); setError('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const goHome = () => { setView('home'); resetHome() }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-parchment font-sans text-ink">

      {/* ── Auth Toast ── */}
      {authToast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-xl border transition-all ${
            authToast.type === 'success'
              ? 'bg-teal-900 border-gold/30 text-gold'
              : 'bg-red-900/80 border-red-700/30 text-red-200'
          }`}
          style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}
        >
          {authToast.type === 'success' ? <User size={14} /> : <X size={14} />}
          {authToast.msg}
        </div>
      )}

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-10 bg-parchment/95 backdrop-blur-sm border-b border-gold/15">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-2.5">
            <Image src="/images/mizan-logo.png" alt="Mizan" width={30} height={30} className="rounded-full" unoptimized />
            <span className="hidden sm:block font-semibold text-sm tracking-wide">Mizan</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavBtn active={view === 'chapters'} onClick={() => { setView('chapters'); setSelectedChapter(null) }} icon={BookOpen} label="Surahs" />
            <NavBtn active={view === 'search'} onClick={() => setView('search')} icon={Search} label="Search" />
            <NavBtn active={view === 'saved'} onClick={() => setView('saved')} icon={Bookmark} label="Saved" count={savedVerses.length} />
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-gold/15">
                <span className="hidden sm:block text-xs text-gold font-medium max-w-[80px] truncate">{displayName(user)}</span>
                <a
                  href="/api/auth/logout"
                  title="Sign out"
                  className="p-1.5 rounded-full text-ink-muted hover:text-gold transition-colors"
                >
                  <LogOut size={14} />
                </a>
              </div>
            ) : authReady ? (
              <a
                href="/api/auth/qf"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-gold/30 text-xs font-medium text-gold hover:bg-gold/10 transition-all ml-1"
              >
                <User size={13} />
                <span className="hidden sm:inline">Sign in</span>
              </a>
            ) : authReady === false ? (
              <div
                title="Quran.com sign-in coming soon"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-gold/15 text-xs font-medium text-ink-muted/50 cursor-default ml-1"
              >
                <User size={13} />
                <span className="hidden sm:inline">Sign in</span>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* ── Saved View ── */}
      {view === 'saved' && (
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-baseline justify-between mb-8">
            <h1 className="font-playfair text-2xl">Your Collection</h1>
            <span className="text-xs text-ink-muted">{savedVerses.length} verse{savedVerses.length !== 1 ? 's' : ''}</span>
          </div>
          {savedVerses.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <Bookmark size={40} className="mx-auto text-ink-muted opacity-20" />
              <p className="font-medium">Your collection is empty.</p>
              <p className="text-sm text-ink-muted">Save verses that speak to you — they'll live here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedVerses.map((v, i) => (
                <div key={v.verse_key} className="bg-parchment-card border border-gold/20 rounded-2xl p-4 sm:p-5 space-y-4"
                  style={{ animation: 'fadeSlideIn 0.4s ease forwards', animationDelay: `${i * 60}ms`, opacity: 0 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gold uppercase tracking-widest">{v.surah_name}</span>
                      <span className="ml-2 text-xs text-ink-muted">{v.verse_key}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <AudioPlayer verseKey={v.verse_key} />
                      <button onClick={() => removeSaved(v.verse_key)} className="p-1 text-ink-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="font-amiri text-right text-2xl leading-loose" dir="rtl" lang="ar">{v.arabic}</p>
                  <p className="text-ink-light text-sm italic leading-relaxed border-l-2 border-gold/30 pl-4">{v.translation}</p>
                  {v.situation && (
                    <p className="text-xs text-ink-muted border-t border-gold/10 pt-3">
                      Saved for: <span className="italic">&ldquo;{v.situation.slice(0, 100)}{v.situation.length > 100 ? '…' : ''}&rdquo;</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── Chapters View ── */}
      {view === 'chapters' && (
        <main className="max-w-3xl mx-auto px-4 py-10">
          {selectedChapter ? (
            // Chapter detail — verses
            <div>
              <button onClick={() => setSelectedChapter(null)} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-gold transition-colors mb-6">
                <ChevronLeft size={16} /> All Surahs
              </button>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">Surah {selectedChapter.id}</p>
                <h1 className="font-playfair text-2xl">{selectedChapter.name_simple}</h1>
                <p className="font-amiri text-2xl text-ink-muted mt-0.5" dir="rtl" lang="ar">{selectedChapter.name_arabic}</p>
                <p className="text-xs text-ink-muted mt-1">{selectedChapter.verses_count} verses · {selectedChapter.revelation_place}</p>
              </div>

              {chapterLoading ? (
                <div className="space-y-3">{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <div className="space-y-3">
                  {chapterVerses.map((v, i) => (
                    <div key={v.verse_key} className="bg-parchment-card border border-gold/15 rounded-xl p-4 space-y-3"
                      style={{ animation: 'fadeSlideIn 0.3s ease forwards', animationDelay: `${Math.min(i * 30, 600)}ms`, opacity: 0 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gold">{v.verse_key}</span>
                        <AudioPlayer verseKey={v.verse_key} audioUrl={chapterAudioMap[v.verse_key]} />
                      </div>
                      <p className="font-amiri text-right text-xl sm:text-2xl leading-loose text-ink" dir="rtl" lang="ar">{v.text_uthmani}</p>
                      <p className="text-sm text-ink-light italic leading-relaxed border-l-2 border-gold/25 pl-3">
                        {v.translations?.[0]?.text?.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Chapter grid
            <div>
              <div className="mb-6">
                <h1 className="font-playfair text-2xl mb-1">Browse the Quran</h1>
                <p className="text-sm text-ink-muted">All 114 Surahs — tap to read</p>
              </div>
              {chaptersLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-parchment-card border border-gold/10 rounded-xl p-3 space-y-2 animate-pulse">
                      <div className="h-3 bg-gold/10 rounded w-8" />
                      <div className="h-6 bg-gold/10 rounded w-full" />
                      <div className="h-3 bg-gold/10 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chapters.map((ch, i) => (
                    <button key={ch.id} onClick={() => openChapter(ch)}
                      className="bg-parchment-card border border-gold/15 rounded-xl p-3 text-left hover:border-gold/40 hover:bg-parchment-dark/30 transition-all"
                      style={{ animation: 'fadeSlideIn 0.3s ease forwards', animationDelay: `${Math.min(i * 10, 500)}ms`, opacity: 0 }}>
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="text-xs font-bold text-gold">{ch.id}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${ch.revelation_place === 'Makkah' ? 'bg-amber-900/30 text-amber-400' : 'bg-teal-900/30 text-teal-400'}`}>
                          {ch.revelation_place}
                        </span>
                      </div>
                      <p className="font-amiri text-lg text-ink leading-tight mb-0.5" dir="rtl" lang="ar">{ch.name_arabic}</p>
                      <p className="text-xs text-ink-light font-medium">{ch.name_simple}</p>
                      <p className="text-xs text-ink-muted mt-1">{ch.verses_count} verses</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ── Search View ── */}
      {view === 'search' && (
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-6">
            <h1 className="font-playfair text-2xl mb-1">Search the Quran</h1>
            <p className="text-sm text-ink-muted">Search by keyword across all verses</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. patience, mercy, light…"
              className="flex-1 bg-parchment-card border border-gold/25 rounded-xl px-4 py-3 text-base sm:text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-gold/50 transition-all"
            />
            <button type="submit" disabled={!searchQuery.trim() || searchLoading}
              className="flex items-center gap-2 bg-gold text-parchment px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {searchLoading
                ? <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                : <Search size={15} />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {searchLoading && (
            <div className="space-y-3">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>
          )}

          {!searchLoading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-16 text-ink-muted">
              <Search size={36} className="mx-auto mb-3 opacity-20" />
              <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}

          {!searchLoading && searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted mb-4">{searchResults.length} results</p>
              {searchResults.map((r: any, i) => (
                <div key={r.verse_key || i} className="bg-parchment-card border border-gold/15 rounded-xl p-4 space-y-2"
                  style={{ animation: 'fadeSlideIn 0.3s ease forwards', animationDelay: `${i * 60}ms`, opacity: 0 }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold">{r.verse_key}</span>
                    <AudioPlayer verseKey={r.verse_key} />
                  </div>
                  {r.text && (
                    <p className="font-amiri text-right text-xl leading-loose text-ink" dir="rtl" lang="ar">{r.text}</p>
                  )}
                  <p className="text-sm text-ink-light italic leading-relaxed border-l-2 border-gold/25 pl-3">
                    {r.translations?.[0]?.text?.replace(/<[^>]*>/g, '') || r.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── Home View ── */}
      {view === 'home' && (
        <main className="max-w-3xl mx-auto px-4">
          {/* Hero */}
          <section className="text-center py-10 sm:py-16 md:py-20">
            <div className="relative flex justify-center mb-7">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gold/10 blur-2xl" />
              </div>
              <Image src="/images/mizan-logo.png" alt="Mizan" width={110} height={110} className="relative z-10 rounded-full shadow-xl" priority unoptimized />
            </div>
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl mb-3 leading-snug">
              The Quran has a verse<br className="hidden sm:block" /> for what you&apos;re carrying.
            </h1>
            <p className="text-ink-muted text-sm max-w-xs mx-auto leading-relaxed">
              Describe your moment — Mizan finds the words written for you.
            </p>
          </section>

          {/* Verse of the Day */}
          {votd && !result && !loading && <VotdCard votd={votd} />}

          {/* Form */}
          <form onSubmit={handleMatch} className="space-y-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={situation}
                onChange={e => setSituation(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Share what you're carrying — a struggle, a question, a feeling, a moment of gratitude…"
                rows={5}
                className="w-full bg-parchment-card border border-gold/25 rounded-2xl p-4 sm:p-5 pr-16 text-ink placeholder:text-ink-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-gold/50 text-base sm:text-sm leading-relaxed transition-all"
              />
              <span className={`absolute bottom-4 right-4 text-xs transition-colors ${situation.length > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-ink-muted/40'}`}>
                {situation.length}/{MAX_CHARS}
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3">
                <X size={14} className="flex-shrink-0" />{error}
              </div>
            )}

            <div className="flex justify-center">
              <button type="submit" disabled={!situation.trim() || loading}
                className="flex items-center justify-center gap-2 bg-gold text-parchment w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-full text-sm font-semibold hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold/20">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />Finding verses…</>
                  : <><Sparkles size={15} />Find My Verses</>}
              </button>
            </div>
          </form>

          {/* Skeleton loading */}
          {loading && (
            <div className="py-12 space-y-4">
              <p className="text-center text-xs text-gold uppercase tracking-widest animate-pulse mb-6">Searching the Quran…</p>
              {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <section ref={resultsRef} className="py-12 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold">verses for</p>
                <h2 className="font-playfair text-2xl md:text-3xl">{result.situation_summary}</h2>
                <p className="text-xs text-ink-muted">
                  {result.verses.length} verses · tap <Bookmark size={11} className="inline mb-0.5" /> to save · <Play size={11} className="inline mb-0.5" /> to listen
                </p>
              </div>
              <div className="space-y-4">
                {result.verses.map((verse, i) => (
                  <VerseCard key={verse.verse_key} verse={verse} saved={isSaved(verse.verse_key)} onToggleSave={() => toggleSave(verse)} index={i} />
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <button onClick={resetHome} className="text-sm text-ink-muted hover:text-ink transition-colors underline underline-offset-4 decoration-gold/30">
                  Search again
                </button>
              </div>
            </section>
          )}

          <div className="h-16" />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-gold/10 py-6">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <span>© 2026 Mizan · Built for the Quran Foundation Hackathon</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
