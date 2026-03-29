import { Users, RefreshCw, Timer, ShieldBan, Globe, BadgeCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Staff Dashboard',
    desc: 'View and manage every staff member, their ranks, and activity in one clean interface.',
    accent: '#7c5cfc',
  },
  {
    icon: RefreshCw,
    title: 'Discord Role Sync',
    desc: 'Map Discord roles to ranks. Staff are automatically added or removed when their roles change.',
    accent: '#5865f2',
  },
  {
    icon: Timer,
    title: 'Shift Tracking',
    desc: 'Clock in and out via the dashboard or the /shift command. Full history and hours logged.',
    accent: '#34d399',
  },
  {
    icon: ShieldBan,
    title: 'Ban Management',
    desc: 'Issue in-game bans tied to Roblox IDs with reasons, evidence, and expiry dates.',
    accent: '#f87171',
  },
  {
    icon: Globe,
    title: 'Server Directory',
    desc: 'List your ERLC community publicly. Let players discover and join your server.',
    accent: '#fbbf24',
  },
  {
    icon: BadgeCheck,
    title: 'Roblox Verification',
    desc: 'Link Discord accounts to Roblox IDs. Usernames always stay current via live API lookups.',
    accent: '#e8634a',
  },
];

export default function FeaturesSection() {
  return (
    <section style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontSize: 12, color: '#7c5cfc', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
          Everything you need
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#e8e9f0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Built for ERLC communities
        </h2>
        <p style={{ fontSize: 16, color: '#8b8fa8', marginTop: 16, maxWidth: 480, margin: '16px auto 0' }}>
          Everything a serious department needs to operate smoothly.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
          <div
            key={title}
            style={{
              background: '#13162b', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '24px 24px 28px',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${accent}44`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: 16,
              background: `${accent}1a`, color: accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e9f0', marginBottom: 8 }}>
              {title}
            </h3>
            <p style={{ fontSize: 14, color: '#8b8fa8', lineHeight: 1.6 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}