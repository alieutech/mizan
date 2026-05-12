'use client'

import { useEffect, useState } from 'react'
import type { Lang } from '@/lib/i18n'

export default function LangToggle() {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('mizan_lang') as Lang | null
    if (saved === 'ar') {
      setLang('ar')
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    }
  }, [])

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    localStorage.setItem('mizan_lang', next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <button
      onClick={toggle}
      title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      className="px-2 py-1.5 rounded-full border border-gold/20 text-xs font-semibold text-gold hover:bg-gold/10 transition-all"
    >
      {lang === 'en' ? 'عر' : 'En'}
    </button>
  )
}
