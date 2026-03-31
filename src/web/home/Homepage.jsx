import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Users, ShieldCheck, Clock, Globe, Bot } from 'lucide-react'

const FEATURES = [
  { icon: Users,       title: 'Staff Management', desc: 'Add, remove, and manage your staff members with role-based access and Discord sync.' },
  { icon: Clock,       title: 'Shift Tracking',   desc: 'Clock in and out via the dashboard or bot. Live timers, full history, and exportable logs.' },
  { icon: ShieldCheck, title: 'Ban Management',   desc: 'Issue and track in-game bans by Roblox ID with reason, evidence, and expiry.' },
  { icon: Bot,         title: 'Discord Bot',      desc: 'Rich slash commands and automatic role sync keep your Discord and dashboard always in step.' },
  { icon: Globe,       title: 'Server Directory', desc: 'List your community publicly and let players discover active ERLC servers using Axolix.' },
  { icon: Zap,         title: 'Fast & Reliable',  desc: 'Built on a hybrid API architecture — reads are instant, writes are safe and verified.' },
]

export default function Homepage() {
  const navigate = useNavigate()

  return (
    <div className="stack">

      {/* ── Hero ── */}
      <section className="home-hero section section--first">
        <div className="container">
          <p className="home-hero__eyebrow">ERLC Community Management</p>
          <h1>The fastest way to<br />manage your server.</h1>
          <p className="home-hero__sub">
            Axolix brings staff management, shift tracking, ban logs, and Discord
            role sync into one polished dashboard — built for ERLC communities.
          </p>
          <div className="home-hero__actions">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/directory')}>
              Browse Servers
            </button>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 680 }}>
          <p className="section-label">About</p>
          <h2>What is Axolix?</h2>
          <p style={{ marginTop: 12 }}>
            Axolix is an all-in-one management platform built specifically for
            Emergency Response: Liberty County communities. Connect your Discord
            server, verify your staff&apos;s Roblox accounts, and get a live view
            of everything happening in your server — without juggling spreadsheets
            or manual role assignments.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="container">
          <p className="section-label">Features</p>
          <h2>Everything you need</h2>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card feature-card">
                <div className="feature-card__icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p style={{ fontSize: 13 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section cta-banner">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p style={{ marginTop: 10 }}>
            Connect your Discord server and have your dashboard running in minutes.
          </p>
          <div className="cta-banner__actions">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Add Axolix to your server <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__logo">
            <Zap size={14} /> Axolix
          </span>
          <span className="footer__copy">
            © {new Date().getFullYear()} Axolix. All rights reserved.
          </span>
        </div>
      </footer>

    </div>
  )
}