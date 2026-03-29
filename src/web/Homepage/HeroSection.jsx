import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    let frame;
    let offset = 0;
    const animate = () => {
      offset = (offset + 0.2) % 60;
      el.style.backgroundPosition = `${offset}px ${offset}px`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={gridRef}
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(124,92,252,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%', zIndex: 0,
        background: 'radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#7c5cfc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Hexagon logo mark — kept as raw SVG since it's a brand asset, not a UI icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#e8e9f0', letterSpacing: '0.02em' }}>Axolix</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'Directory', path: '/directory' },
            { label: 'Resources', path: '/resources' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8b8fa8', fontSize: 14, padding: '6px 14px', borderRadius: 6,
                transition: 'color 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e8e9f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8b8fa8')}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate('/login')}
            style={{
              marginLeft: 8, background: '#7c5cfc', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 14, fontWeight: 500, padding: '7px 18px',
              borderRadius: 8, transition: 'background 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#9b82fd')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7c5cfc')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 100px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28,
          background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.3)',
          borderRadius: 99, padding: '5px 14px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c5cfc' }} />
          <span style={{ fontSize: 12, color: '#9b82fd', fontWeight: 500, letterSpacing: '0.05em' }}>
            ERLC Community Management
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.1,
          color: '#e8e9f0', maxWidth: 820, marginBottom: 24, letterSpacing: '-0.02em',
        }}>
          The platform built for{' '}
          <span style={{
            background: 'linear-gradient(135deg, #7c5cfc, #b69dff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            serious communities
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 19px)', color: '#8b8fa8', maxWidth: 540,
          lineHeight: 1.7, marginBottom: 40,
        }}>
          Staff management, shift tracking, ban logs, and Discord role sync — all in one place for your ERLC community.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#7c5cfc', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 15, fontWeight: 600, padding: '13px 28px',
              borderRadius: 10, transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#9b82fd'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7c5cfc'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Add to Discord
          </button>
          <button
            onClick={() => navigate('/directory')}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', color: '#e8e9f0', fontSize: 15, fontWeight: 500,
              padding: '13px 28px', borderRadius: 10, transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Browse Directory
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 40, marginTop: 64,
          padding: '20px 40px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { val: '50+', label: 'Communities' },
            { val: '2k+', label: 'Staff Members' },
            { val: '10k+', label: 'Shifts Logged' },
          ].map(({ val, label }, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#e8e9f0' }}>{val}</div>
              <div style={{ fontSize: 13, color: '#555a75', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}