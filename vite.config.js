import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL':    JSON.stringify('https://wcavpryumlohjccxiohq.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON':   JSON.stringify('sb_publishable_EoFH2MIrf4Xc1cJJaiAlHg_ct72t-ru'),
    'import.meta.env.VITE_ORACLE_BASE_URL': JSON.stringify('https://your-oracle-ip:3001'),
  },
})