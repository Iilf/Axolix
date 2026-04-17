# Axolix

A Next.js application with React 19, TypeScript, and Cloudflare Workers integration.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```

## Deployment

### Cloudflare Workers
```bash
npm run deploy
```

### Preview
```bash
npm run preview
```

## Tech Stack

- **Framework:** Next.js 15.5.15
- **Frontend:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Deployment:** Cloudflare Workers
- **Authentication:** Roblox OAuth

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run preview` - Preview Cloudflare deployment
- `npm run deploy` - Deploy to Cloudflare Workers

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Roblox OAuth
ROBLOX_CLIENT_ID=your_roblox_client_id
ROBLOX_CLIENT_SECRET=your_roblox_client_secret

# Discord
DISCORD_BOT_TOKEN=your_discord_bot_token
```

## Contributing

1. Run type checking before committing: `npm run type-check`
2. Run linting: `npm run lint`
3. Ensure all tests pass

## Troubleshooting

See `TROUBLESHOOTING_REPORT.md` for detailed information about issues that were resolved during development.