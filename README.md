This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# 🚀 ChurnGuard - AI-Powered Customer Retention Platform

ChurnGuard is a comprehensive SaaS application that uses AI to predict customer churn, automate retention campaigns, and provide actionable insights.

## 🎯 Features

- **AI Churn Prediction**: Gemini AI analyzes customer behavior to predict churn risk
- **Semantic Search**: Pinecone vector database for intelligent customer search
- **AI Chatbot**: RAG-powered chatbot for customer insights
- **Automated Campaigns**: Personalized email/SMS retention campaigns
- **Image Analysis**: Gemini Vision analyzes store/office images
- **AI Reports**: Automated analytical reports with recommendations
- **Real-time Dashboard**: Looker Studio integration for analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Turso (libSQL)
- **ORM**: Drizzle ORM
- **AI**: Google Gemini (text, vision, embeddings)
- **Vector DB**: Pinecone
- **Auth**: NextAuth.js
- **Email**: Resend
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Create `.env.local`:
```bash
# Copy from the provided .env file
```

### 3. Create Database Tables
```bash
npm run db:setup
```

### 4. Verify Database
```bash
npm run db:test
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm run start
```

## 📂 Project Structure
```
churnguard/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard components
│   ├── customers/        # Customer components
│   ├── chat/             # Chat components
│   └── upload/           # Upload components
├── lib/                   # Utility libraries
│   ├── db/               # Database (Turso + Drizzle)
│   ├── ai/               # AI integrations (Gemini + Pinecone)
│   ├── auth/             # Authentication
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript types
└── scripts/              # Setup scripts
```

## 🎯 Usage Guide

### 1. Register Account
- Visit http://localhost:3000/register
- Create your account

### 2. Upload Customer Data
- Go to Dashboard → Upload Data
- Upload CSV with customer information
- Click "Analyze Churn Risk with AI"

### 3. View Customers
- Navigate to Customers page
- View churn scores and risk levels
- Filter by risk level

### 4. Use AI Chatbot
- Go to AI Chat page
- Ask questions about your customers
- Get AI-powered insights

### 5. Create Campaigns
- Navigate to Campaigns → Create Campaign
- Set target audience
- Write message template
- AI personalizes for each customer
- Send campaign

### 6. Analyze Images
- Go to Images page
- Upload store/office photos
- Get AI analysis of customer activity

### 7. Generate Reports
- Go to Reports page
- Click "Generate Report"
- AI creates comprehensive report
- Receives email with report

## 🔑 Key Features Explained

### Churn Prediction
- Gemini analyzes customer data
- Assigns churn score (0-100)
- Categorizes risk level
- Provides risk factors
- Suggests retention actions

### Semantic Search (RAG)
- Customer data vectorized with Gemini embeddings
- Stored in Pinecone with user namespaces
- Chatbot searches for relevant customers
- Provides context-aware responses

### Campaign Automation
- AI personalizes messages per customer
- Sends via Resend (email) or Twilio (SMS)
- Tracks delivery, opens, clicks
- Shows campaign performance

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npm run db:test

# Recreate tables
npm run db:setup
```

### API Rate Limits
- Gemini: 15 requests/minute, 1500/day
- Pinecone: 1M queries/month
- Resend: 100 emails/day (free tier)

### Environment Variables
- Ensure all keys in `.env.local` are correct
- Restart dev server after changing env vars

## 📊 Free Tier Limits

- **Turso**: 5GB storage, 500M reads/month
- **Pinecone**: 2GB storage, 1M queries/month
- **Gemini**: 1,500 requests/day
- **Resend**: 100 emails/day
- **Vercel**: 100GB bandwidth/month

## 🚢 Deployment

### Deploy to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Deploy on Vercel
# 1. Import project from GitHub
# 2. Add environment variables
# 3. Deploy
```

## 📝 License

MIT License - feel free to use for your projects!

## 🙏 Credits

Built with:
- Next.js
- Google Gemini AI
- Pinecone
- Turso
- shadcn/ui