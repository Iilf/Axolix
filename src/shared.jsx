import { createClient } from '@supabase/supabase-js';

// ─── Supabase ───────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Oracle API ─────────────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json();
}

// ─── Auth helpers ────────────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Roblox helpers (all go through Oracle) ──────────────────────────────────
export async function fetchRobloxUser(robloxId) {
  return apiFetch(`/roblox/user/${robloxId}`);
}

export async function fetchRobloxAvatar(robloxId) {
  return apiFetch(`/roblox/avatar/${robloxId}`);
}

// ─── Theme constants ─────────────────────────────────────────────────────────
export const COLORS = {
  bg0:      '#0d0f1a',
  bg1:      '#13162b',
  bg2:      '#1a1e36',
  bg3:      '#20254a',
  purple:   '#7c5cfc',
  purple2:  '#9b82fd',
  text1:    '#e8e9f0',
  text2:    '#8b8fa8',
  text3:    '#555a75',
  border:   'rgba(255,255,255,0.07)',
  border2:  'rgba(255,255,255,0.12)',
  green:    '#34d399',
  red:      '#f87171',
  amber:    '#fbbf24',
};