import { useNavigate } from 'react-router-dom';

const LINKS = {
  Platform: [
    { label: 'Directory', path: '/directory' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Verify', path: '/verify' },
  ],
  Resources: [
    { label: 'Guides', path: '/resources/guides' },
    { label: 'Commands', path: '/resources/commands' },
    { label: 'Changelog', path: '/resources/changelog' },
    { label: 'API Docs', path: '/resources/api' },
  ],
  Community: [
    { label: 'Discord', href: 'https://discord.gg/' },
    { label: 'PRC Forums', href: 'https://policeroleplay.community' },
  ],
};

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '60px 48px 32px',
      background: '#0a0c17',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top row */}
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap', marginBottom: 48 }}>
          {/* Brand */}
          <div style={{ flex: '0 0 220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: '#7c5cfc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                </svg>
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#e8e9f0' }}>Axolix</span>
            </div>
            <p style={{ fontSize: 13, color: '#555a75', lineHeight: 1.6, maxWidth: 200 }}>
              Community management for ERLC departments.
            </p>
          </div>

          {/* Link columns */}
          <div style={{ display: 'flex', gap: 48, flex: 1, flexWrap: 'wrap' }}>
            {Object.entries(LINKS).map(([section, links]) => (
              <div key={section}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555a75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                  {section}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(({ label, path, href }) => (
                    href ? (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, color: '#8b8fa8', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.target.style.color = '#e8e9f0')}
                        onMouseLeave={e => (e.target.style.color = '#8b8fa8')}
                      >
                        {label}
                      </a>
                    ) : (
                      <span
                        key={label}
                        onClick={() => navigate(path)}
                        style={{ fontSize: 13, color: '#8b8fa8', cursor: 'pointer', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.target.style.color = '#e8e9f0')}
                        onMouseLeave={e => (e.target.style.color = '#8b8fa8')}
                      >
                        {label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 12, color: '#555a75' }}>
            © {new Date().getFullYear()} Axolix. Not affiliated with Roblox or PRC.
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Terms', 'Privacy'].map(label => (
              <span
                key={label}
                style={{ fontSize: 12, color: '#555a75', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.target.style.color = '#8b8fa8')}
                onMouseLeave={e => (e.target.style.color = '#555a75')}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}