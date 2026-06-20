import Link from 'next/link';
import './globals.css';

export default function Home() {
  return (
    <main className="page-shell flex items-center justify-center min-h-screen px-5 sm:px-8 py-6">
      <div className="page-content w-full max-w-xl animate-fade-in-up">
        <div className="glass-card p-10 space-y-8">
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="space-y-5">
            <span className="badge badge-indigo animate-fade-in delay-1">✨ v2.0 Beta</span>

            <h1 className="text-5xl font-black tracking-tight leading-tight">
              AI Travel{' '}
              <span className="text-gradient">Planner</span>
            </h1>

            <p className="text-muted text-lg font-light leading-relaxed">
              Generate bespoke, personalized multi-day itineraries, manage custom activities,
              and design smart, weather-ready packing lists — all powered by Gemini AI.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {['🗺️ Smart Itineraries', '🎒 Packing Lists', '🏨 Hotel Picks', '💰 Budget Estimates'].map((f) => (
              <span key={f} className="interest-tag">{f}</span>
            ))}
          </div>

          <hr className="divider" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              id="create-account-btn"
              className="btn btn-primary flex-1 text-center justify-center"
              href="/register"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Create account
            </Link>
            <Link
              id="sign-in-btn"
              className="btn btn-secondary flex-1 text-center justify-center"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}