// Static legal / help pages, rendered in-app (single-file build safe).
// Mirrors the NYT/Wordle footer pattern: Sitemap, Privacy, Terms, Cookies,
// Terms of Sale, Manage Privacy Preferences.

export type DocId = 'sitemap' | 'privacy' | 'terms' | 'cookies' | 'sale'

type DocSection = { h: string; body: string[] }

const SECTIONS: Record<DocId, DocSection[]> = {
  sitemap: [
    { h: 'Pages', body: [
      'Home: Today\'s puzzle. One hidden answer per day, one category chosen by the system.',
      'Archive & Practice: Play any of the last 7 daily puzzles, or a random practice puzzle. Practice never affects your streak.',
      'Manage Privacy Preferences: Control analytics and marketing consent from your browser.',
    ] },
    { h: 'Legal documents', body: [
      'Privacy Policy: what we collect and why.',
      'Terms of Service: the rules of using the site.',
      'Cookie Policy: how we use cookies and local storage.',
      'Terms of Sale: purchasing terms (currently no paid features).',
    ] },
    { h: 'About the game', body: [
      'Guess of the Day is a daily deduction puzzle. Tap yes/no question chips to shrink the candidate pool, then make a guess in the fewest taps possible. One puzzle per day; results are shareable and comparable across players.',
    ] },
  ],
  privacy: [
    { h: 'Overview', body: [
      'Guess of the Day ("we", "us") runs a free daily browser puzzle. This policy explains what information is processed when you play, and the choices you have. We built this game to work without an account: nothing you type identifies you.',
    ] },
    { h: 'Information we process', body: [
      'Session identifier: a random, anonymous ID stored in your browser to keep your streak and puzzle progress consistent. It contains no name, email, or other personal information.',
      'Game progress: chips you asked, guesses made, taps used, and completion state, stored locally and mirrored to our servers only so your progress can be restored if you clear your browser data.',
      'Analytics events: anonymous counts of game starts, chip taps, completions and share actions. No personal identifiers are attached. Analytics are only collected after you give consent.',
    ] },
    { h: 'Legal basis for processing', body: [
      'Session and game progress (essential storage): Legitimate interest — strictly necessary to provide the core game service (streaks, progress restore) and cannot be turned off.',
      'Anonymous analytics: Consent — only processed after you accept via the cookie banner or privacy preferences. You may withdraw consent at any time.',
      'Abuse prevention and rate limiting: Legitimate interest — transient request metadata (not stored) is used to enforce rate limits and keep the service fair for all players.',
    ] },
    { h: 'How we use it', body: [
      'To run the game (progress, streaks), to prevent cheating (server-validated sessions), and to improve the game (aggregate analytics). We do not sell personal information.',
    ] },
    { h: 'Analytics providers', body: [
      'Firebase Analytics (Google LLC) and Cloudflare Web Analytics may process the anonymous events above after consent is given. Your browser is not added to any advertising or cross-site tracking networks.',
    ] },
    { h: 'Third-party images', body: [
      'Some game tiles load images from third-party CDNs. Your browser may contact these providers to load images; they do not receive gameplay data. The providers are: flagcdn.com (country flags), icons.duckduckgo.com (brand logos), en.wikipedia.org (historical portraits), and www.google.com (favicon fallbacks).',
    ] },
    { h: 'Retention & security', body: [
      'Anonymous sessions expire after 90 days of inactivity. Analytics are retained in aggregated form. We use edge-network protections and rate limiting to keep the service safe.',
    ] },
    { h: 'Your choices & rights', body: [
      'You can clear your progress and session at any time by clearing your browser storage for this site. You can opt out of analytics via Manage Privacy Preferences in the footer. Depending on your region you may have rights to access, correct or delete data; contact us using the details below.',
      'Contact: support@guessofday.game',
    ] },
    { h: 'Changes', body: [
      'If we change this policy, we will update the date below and note the change here. Effective: August 2026.',
    ] },
  ],
  terms: [
    { h: 'Acceptance', body: [
      'By using Guess of the Day you agree to these Terms of Service. If you do not agree, please do not use the service.',
    ] },
    { h: 'The service', body: [
      'Guess of the Day is a free, browser-based daily puzzle game provided "as is" for entertainment. We may change, pause or discontinue any part of it at any time.',
    ] },
    { h: 'Your use', body: [
      'You may play the game, share your result card, and quote small portions of it in conversations and posts. You may not copy, scrape, reverse-engineer, or resell the service or its content, or use it in ways that harm others or the service.',
    ] },
    { h: 'No guarantees', body: [
      'The service is provided without warranties of any kind. We do not guarantee uninterrupted availability, and we are not liable for lost streaks, lost data, or anything else arising from use of the service, to the maximum extent permitted by law.',
    ] },
    { h: 'Content & IP', body: [
      'Game content, code, and design are our property or used with permission. Emoji, flags, logos and portraits shown in-game belong to their respective owners and are used for identification purposes only.',
    ] },
    { h: 'Contact', body: [
      'Questions about these terms: mayankjaindd@gmail.com. Effective: August 2026.',
    ] },
  ],
  cookies: [
    { h: 'What we use', body: [
      'Guess of the Day uses browser local storage (and, for anonymous session handling, a strictly-necessary session cookie) rather than tracking cookies. We use no advertising cookies.',
    ] },
    { h: 'Essential storage', body: [
      'Session ID, streak, history, and preferences (including this choice). These are required for the game to work and cannot be turned off.',
    ] },
    { h: 'Analytics', body: [
      'When enabled, Firebase Analytics (Google LLC) and Cloudflare Web Analytics process anonymous event data. This is used only to understand how the game is played. You can turn it off in Manage Privacy Preferences.',
    ] },
    { h: 'Third-party images', body: [
      'Flag, logo and portrait images load from third-party CDNs (flagcdn.com, icons.duckduckgo.com, en.wikipedia.org, www.google.com). Those providers may log standard request data such as IP address as part of normal web operations.',
    ] },
    { h: 'Managing your choices', body: [
      'Use Manage Privacy Preferences in the footer, or your browser settings, to control storage. Clearing your browser data for this site removes all stored information.',
    ] },
    { h: 'Updates', body: [
      'We will update this policy if our practices change. Effective: August 2026.',
    ] },
  ],
  sale: [
    { h: 'Current status', body: [
      'Guess of the Day is completely free. There are no paid products, subscriptions, or in-game purchases today, so no purchases are made on this site.',
    ] },
    { h: 'Future paid features', body: [
      'If premium features (such as extended archive access or ad-free mode) launch in the future, this page will govern purchases of those features. Prices, billing terms, and delivery will be shown at the point of purchase.',
    ] },
    { h: 'Refunds', body: [
      'Because no purchases currently exist, there is nothing to refund. If paid features launch, you will have the right to cancel and request a refund within 14 days of purchase where required by applicable consumer law.',
    ] },
    { h: 'Contact', body: [
      'For anything related to this page: mayankjaindd@gmail.com. Effective: August 2026.',
    ] },
  ],
}

const TITLES: Record<DocId, { title: string; tag: string }> = {
  sitemap: { title: 'Sitemap', tag: 'SITE GUIDE' },
  privacy: { title: 'Privacy Policy', tag: 'LEGAL' },
  terms: { title: 'Terms of Service', tag: 'LEGAL' },
  cookies: { title: 'Cookie Policy', tag: 'LEGAL' },
  sale: { title: 'Terms of Sale', tag: 'LEGAL' },
}

export default function DocsPage({ doc, onBack }: { doc: DocId; onBack: () => void }) {
  const meta = TITLES[doc]
  return (
    <div className="pt-6 pb-10 max-w-[760px] mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-black/10 grid place-items-center hover:bg-black hover:text-white transition-colors font-bold">←</button>
        <div>
          <div className="text-[10px] font-black tracking-[0.18em] text-black/40">{meta.tag}</div>
          <h1 className="font-display text-[28px] sm:text-[34px] leading-none tracking-tight">{meta.title}</h1>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[24px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-8 space-y-6">
        {SECTIONS[doc].map(s => (
          <section key={s.h}>
            <h2 className="font-extrabold text-[15px] tracking-tight border-b-2 border-black/10 pb-1.5">{s.h}</h2>
            <div className="mt-2 space-y-2">
              {s.body.map((p, i) => (
                <p key={i} className="text-[13px] leading-relaxed text-black/70 font-medium">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 text-center text-[11px] font-bold text-black/40">
        Questions? <span className="underline">mayankjaindd@gmail.com</span>
      </div>
    </div>
  )
}
