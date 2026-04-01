# ChurnGuard

AI-powered customer retention platform built with Next.js 14, featuring predictive churn modeling, smart segmentation, anomaly detection, and automated campaign management.

## Architecture

```
churnguard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login & registration pages
│   ├── api/                      # REST API routes
│   │   ├── analytics/            # Dashboard analytics, advanced ML, segments, health, anomalies, sentiment
│   │   ├── ai/metrics/           # AI pipeline observability
│   │   ├── chat/                 # RAG-powered conversational AI
│   │   ├── customers/            # CRUD + batch churn analysis
│   │   ├── campaigns/            # Campaign management & sending
│   │   ├── looker/               # Google Sheets sync & CSV export
│   │   └── reports/              # Report generation & email delivery
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── ai-insights/          # Predictions, health radar, anomaly charts, segments
│   │   ├── customers/            # Customer list + [id] detail (360 view)
│   │   ├── campaigns/            # Campaign table + new campaign wizard
│   │   ├── chat/                 # AI chat assistant
│   │   ├── settings/             # Profile, appearance, notifications, integrations, API keys
│   │   └── reports/              # Looker Studio embed + CSV export
│   └── page.tsx                  # Landing page
├── components/
│   ├── layout/                   # Sidebar, Navbar, DashboardShell, CommandPalette
│   ├── dashboard/                # StatsCard, RiskChart, RecentActivity, AdvancedInsightsPreview
│   ├── customers/                # CustomerTable, RiskBadge, CustomerCard
│   ├── chat/                     # ChatInterface, MessageBubble, SuggestedQuestions
│   ├── campaigns/                # CampaignBuilder, CampaignStats
│   ├── providers/                # SessionProvider, ThemeProvider
│   └── ui/                       # shadcn/ui primitives
├── lib/
│   ├── ai/                       # AI engines (see below)
│   ├── auth/                     # NextAuth config & session helpers
│   ├── db/                       # Drizzle ORM schema, queries, Turso client
│   ├── observability/            # Structured logger with trace IDs
│   ├── middleware/                # Rate limiter (sliding window)
│   ├── jobs/                     # Google Sheets hourly sync
│   └── email.ts                  # Nodemailer transport
└── types/                        # TypeScript interfaces
```

## AI Systems

| Engine | File | Description |
|--------|------|-------------|
| Churn Predictor | `lib/ai/churn-predictor.ts` | Multi-factor weighted scoring with temporal decay, cohort benchmarking, and recommended actions |
| Health Score | `lib/ai/health-score.ts` | Composite health across engagement, revenue, support, and retention dimensions |
| Anomaly Detection | `lib/ai/anomaly-detection.ts` | Z-score and IQR statistical analysis for behavioral shift detection |
| Segmentation | `lib/ai/segmentation.ts` | RFM analysis, behavioral clustering, and lifecycle stage classification |
| Sentiment Analysis | `lib/ai/sentiment.ts` | Hybrid lexicon-based + AI-powered text sentiment scoring |
| RAG Pipeline | `lib/ai/rag.ts` | Context chunking, relevance scoring, and prompt enrichment for the chat assistant |
| AI Orchestrator | `lib/ai/orchestrator.ts` | Provider failover with circuit breaker, retry logic, and latency tracking |
| Hybrid Router | `lib/ai/hybrid.ts` | Multi-provider routing (OpenAI, Gemini, Hugging Face) with automatic fallback |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript 5.9 |
| Database | Turso (LibSQL) with Drizzle ORM, local SQLite fallback |
| Auth | NextAuth.js v4 (Credentials, JWT sessions) |
| AI Providers | OpenAI, Google Gemini, Hugging Face, Replicate |
| Vector DB | Pinecone (semantic search for RAG) |
| UI | Tailwind CSS, shadcn/ui, Recharts, Lucide icons |
| Theming | next-themes (light/dark/system) |
| Email | Resend + Nodemailer |
| Analytics | Google Sheets sync, Looker Studio embed |
| Validation | Zod (env + forms) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/srinath-manivannan/churnguard.git
cd churnguard
npm install
```

### Environment Variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Service | How to Get |
|----------|---------|-----------|
| `TURSO_DATABASE_URL` | Turso | `turso db create churnguard && turso db show churnguard` |
| `TURSO_AUTH_TOKEN` | Turso | `turso db tokens create churnguard` |
| `NEXTAUTH_SECRET` | NextAuth | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | NextAuth | `http://localhost:3000` for development |

Optional (enable additional features):

| Variable | Service | Feature |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI | AI chat, report generation |
| `GEMINI_API_KEY` | Google AI Studio | Gemini AI provider |
| `PINECONE_API_KEY` | Pinecone | RAG semantic search |
| `PINECONE_INDEX_NAME` | Pinecone | Index name (default: `churn-customers`) |
| `RESEND_API_KEY` | Resend | Email campaigns & reports |
| `GOOGLE_SERVICE_EMAIL` | Google Cloud | Google Sheets auto-sync |
| `GOOGLE_SERVICE_PRIVATE_KEY` | Google Cloud | Google Sheets auto-sync |
| `GOOGLE_SHEETS_ID` | Google Sheets | Target spreadsheet for sync |
| `NEXT_PUBLIC_LOOKER_STUDIO_URL` | Looker Studio | Embedded analytics dashboard |

Without any optional variables, the app runs with local SQLite and rule-based AI fallbacks.

### Database Setup

```bash
npm run db:setup    # Create all tables
npm run db:test     # Verify connection
```

### Run

```bash
npm run dev         # Development server at http://localhost:3000
npm run build       # Production build
npm start           # Production server
```

### First Use

1. Open http://localhost:3000 and click **Get Started**
2. Register an account
3. Navigate to **Upload Data** and import a customer CSV
4. View AI predictions on the **Dashboard** and **AI Insights** pages
5. Use **AI Chat** to ask questions about your customer data

## Features

### Dashboard
- 6 metric cards (customers, risk, revenue, campaigns, retention, health)
- Interactive risk distribution chart (pie + trend toggle)
- Real-time activity feed from actual API data
- AI insights preview with health score, churn velocity, anomalies, segments

### AI Insights
- Churn risk predictions table with score bars and recommended actions
- Health radar chart (multi-dimensional analysis)
- Anomaly detection bar chart + recent anomalies feed
- Customer segmentation donut chart with revenue breakdown
- AI pipeline metrics and provider health status

### Customer 360
- Click any customer row to see their full profile
- Health score, revenue, churn risk, support ticket metrics
- Contact details, risk factor tags, segment classification
- Activity timeline with chronological events
- Quick actions: ask AI, create campaign, view history

### Campaigns
- Campaign table with status, recipients, and performance
- Multi-step campaign creation wizard
- Email delivery via Nodemailer with recipient tracking

### Settings
- Profile management
- Theme selection (light / dark / system)
- Notification preferences (churn alerts, anomaly detection, campaign reports)
- Integration status dashboard
- API key visibility controls

### UI / UX
- Dark mode with CSS variable theming
- Mobile-responsive sidebar with drawer overlay
- Command palette (`Cmd+K`) for quick navigation and customer search
- Breadcrumb navigation
- Skeleton loading states across all pages
- Staggered fade-in animations

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics` | Dashboard stats + advanced AI metrics |
| GET | `/api/analytics/advanced` | Full churn predictions, health, anomalies, segments |
| GET | `/api/analytics/health` | Health scores (single customer or cohort) |
| GET | `/api/analytics/anomalies` | Anomaly detection results |
| GET | `/api/analytics/segments` | Customer segmentation + RFM scores |
| POST | `/api/analytics/sentiment` | Text sentiment analysis |
| GET | `/api/ai/metrics` | AI pipeline observability metrics |
| POST | `/api/chat` | RAG-powered AI chat |
| GET/POST | `/api/customers` | List / create customers |
| GET/PUT/DELETE | `/api/customers/[id]` | Single customer CRUD |
| POST | `/api/customers/analyze` | Batch churn analysis (updates DB) |
| GET/POST | `/api/campaigns` | List / create campaigns |
| POST | `/api/campaigns/[id]/send` | Send campaign emails |
| POST | `/api/upload` | CSV customer import |
| POST | `/api/looker/sync` | Export to Google Sheets |
| GET | `/api/looker/export` | Download CSV export |
| POST | `/api/reports/generate` | AI-generated HTML report |
| POST | `/api/reports/send` | Email report to user |

## Scripts

```bash
npm run dev            # Start development server
npm run build          # Production build
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix lint issues
npm run format         # Prettier format
npm run type-check     # TypeScript type checking
npm run db:setup       # Create database tables
npm run db:test        # Test database connection
npm run db:studio      # Open Drizzle Studio
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `NEXTAUTH_URL` to your Vercel domain
5. Deploy

## License

MIT
