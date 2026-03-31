import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Zap,
  Users,
  ShieldCheck,
  Clock,
  Globe,
  Bot,
} from 'lucide-react'
import './Homepage.css'

// ── Feature cards data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: 'Staff Management',
    desc: 'Add, remove, and manage your staff members with role-based access and Discord sync.',
  },
  {
    icon: Clock,
    title: 'Shift Tracking',
    desc: 'Clock in and out via the dashboard or bot. Live timers, full history, and exportable logs.',
  },
  {
    icon: ShieldCheck,
    title: 'Ban Management',
    desc: 'Issue and track in-game bans by Roblox ID with reason, evidence, and expiry.',
  },
  {
    icon: Bot,
    title: 'Discord Bot',
    desc: 'Rich slash commands and automatic role sync keep your Discord and dashboard always in step.',
  },
  {
    icon: Globe,
    title: 'Server Directory',
    desc: 'List your community publicly and let players discover active ERLC servers using Axolix.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    desc: 'Built on a hybrid API architecture — reads are instant, writes are safe and verified.',
  },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function Homepage() {
  const navigate = useNavigate()

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="home__hero">
        <div className="container home__hero-inner">
          <p className="home__eyebrow">ERLC Community Management</p>
          <h1 className="home__headline">
            The fastest way to<br />manage your server.
          </h1>
          <p className="home__subheadline">
            Axolix brings staff management, shift tracking, ban logs, and Discord
            role sync into one polished dashboard — built for ERLC communities.
          </p>
          <div className="home__hero-actions">
            <button
              className="btn btn-primary home__cta"
              onClick={() => navigate('/login')}
            >
              Get Started
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/directory')}
            >
              Browse Servers
            </button>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="home__about">
        <div className="container home__about-inner">
          <h2 className="home__section-title">What is Axolix?</h2>
          <p className="home__section-body">
            Axolix is an all-in-one management platform built specifically for
            Emergency Response: Liberty County communities. Connect your Discord
            server, verify your staff&apos;s Roblox accounts, and get a live view
            of everything happening in your server — without juggling spreadsheets
            or manual role assignments.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home__features">
        <div className="container">
          <h2 className="home__section-title home__section-title--center">
            Everything you need
          </h2>
          <p className="home__section-sub">
            Purpose-built tools for every part of running an ERLC server.
          </p>
          <div className="home__feature-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="home__feature-card">
                <div className="home__feature-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="home__feature-title">{title}</h3>
                <p className="home__feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="home__cta-banner">
        <div className="container home__cta-banner-inner">
          <h2 className="home__cta-banner-title">Ready to get started?</h2>
          <p className="home__cta-banner-sub">
            Connect your Discord server and have your dashboard running in minutes.
          </p>
          <button
            className="btn btn-primary home__cta"
            onClick={() => navigate('/login')}
          >
            Add Axolix to your server
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home__footer">
        <div className="container home__footer-inner">
          <span className="home__footer-logo">
            <Zap size={14} />
            Axolix
          </span>
          <span className="home__footer-copy">
            © {new Date().getFullYear()} Axolix. All rights reserved.
          </span>
        </div>
      </footer>

    </div>
  )
}