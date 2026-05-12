import Link from 'next/link'
import Image from 'next/image'
import LangToggle from '@/components/LangToggle'

export const metadata = {
  title: 'Privacy Policy · Mizan',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-parchment font-sans text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-parchment/95 backdrop-blur-sm border-b border-gold/15">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/mizan-logo.png"
              alt="Mizan"
              width={30}
              height={30}
              className="rounded-full"
              unoptimized
            />
            <span className="font-semibold text-sm tracking-wide text-ink">Mizan</span>
          </Link>
          <LangToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-gold font-semibold">Legal</p>
          <h1 className="font-playfair text-3xl text-ink">Privacy Policy</h1>
          <p className="text-sm text-ink-muted">Last updated: May 2026</p>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed">
          Mizan (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
          This policy explains what information is collected when you use Mizan and how it is handled.
        </p>

        <Section title="1. Information We Collect">
          <p>
            Mizan does not require an account and does not collect any personally identifiable information.
          </p>
          <p>
            When you submit a situation or feeling, that text is sent to Anthropic&apos;s Claude API solely
            to identify relevant Quran verses. It is not stored on our servers.
          </p>
          <p>
            Verses you save are stored exclusively in your browser&apos;s <code>localStorage</code> on your
            device. This data never leaves your device and is not accessible to us.
          </p>
        </Section>

        <Section title="2. Third-Party Services">
          <p>Mizan integrates with the following third-party services to deliver its features:</p>
          <ul className="list-disc list-inside space-y-2 text-ink-muted">
            <li>
              <span className="text-ink font-medium">Anthropic (Claude API)</span> — your situation text
              is processed by Claude to find semantically relevant verses. Anthropic&apos;s own privacy
              policy governs how they handle API inputs. We do not send any identifying information
              alongside your text.
            </li>
            <li>
              <span className="text-ink font-medium">Quran Foundation API</span> — used to fetch
              verified Arabic text, translations, and tafsir. No user data is shared with this service.
            </li>
            <li>
              <span className="text-ink font-medium">QuranCDN (audio)</span> — verse recitation audio
              files are streamed directly from a public CDN. No user data is shared.
            </li>
          </ul>
        </Section>

        <Section title="3. Cookies & Local Storage">
          <p>
            Mizan does not use cookies. Your saved verse collection is stored in{' '}
            <code>localStorage</code> in your browser. You can clear it at any time through your
            browser&apos;s settings. Clearing site data will permanently remove your saved verses.
          </p>
        </Section>

        <Section title="4. Data Retention">
          <p>
            We do not retain any data on our servers. The text you type is forwarded to the
            Anthropic API in real time and is not logged or stored by Mizan. Saved verses exist
            only on your device for as long as you keep them.
          </p>
        </Section>

        <Section title="5. Children's Privacy">
          <p>
            Mizan is not directed at children under the age of 13. We do not knowingly collect
            information from children. If you believe a child has submitted personal information
            through our service, please contact us and we will take appropriate steps.
          </p>
        </Section>

        <Section title="6. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be reflected by
            updating the &ldquo;Last updated&rdquo; date above. Continued use of Mizan after
            changes constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            If you have questions about this Privacy Policy, please open an issue on our{' '}
            <a
              href="https://github.com/alieutech/mizan"
              className="text-gold hover:text-gold-light underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>
            .
          </p>
        </Section>

        <div className="pt-6 border-t border-gold/15 flex items-center justify-between text-xs text-ink-muted">
          <span>© 2026 Mizan</span>
          <Link href="/terms" className="hover:text-gold transition-colors">
            Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-playfair text-xl text-ink">{title}</h2>
      <div className="space-y-3 text-sm text-ink-muted leading-relaxed [&_code]:bg-parchment-card [&_code]:text-gold [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
        {children}
      </div>
    </section>
  )
}
