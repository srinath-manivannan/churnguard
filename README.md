# 🚀 ChurnGuard - AI-Powered Customer Retention Platform

Complete step-by-step setup guide for new users cloning from GitHub.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone & Install](#clone--install)
3. [Get All Credentials](#get-all-credentials)
4. [Setup Environment Variables](#setup-environment-variables)
5. [Initialize Database](#initialize-database)
6. [Run the Application](#run-the-application)
7. [Looker Studio Setup](#looker-studio-setup)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Before starting, make sure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** installed ([Download](https://git-scm.com/))
- A **Google Account** (for various services)
- A **GitHub Account** (for deployment)

---

## 📦 Clone & Install

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/churnguard.git

# Navigate to project directory
cd churnguard
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Next.js, React, TypeScript
# - Drizzle ORM, Turso
# - Google Generative AI SDK
# - Pinecone, NextAuth, Resend
# - shadcn/ui components
```

### Step 3: Create Environment File

```bash
# Create .env.local file
touch .env.local

# Or on Windows:
# type nul > .env.local
```

---

## 🔑 Get All Credentials

Now we'll get credentials for each service. Follow these steps carefully!

---

### 1️⃣ Turso Database (SQLite Cloud)

**What it's for:** Stores all your customer data, campaigns, messages

**Steps:**

1. **Install Turso CLI:**
   ```bash
   # macOS/Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Windows (PowerShell)
   irm https://get.tur.so/install.ps1 | iex
   ```

2. **Sign up for Turso:**
   ```bash
   turso auth signup
   ```
   - Opens browser, sign in with GitHub
   - Returns to terminal when done

3. **Create Database:**
   ```bash
   turso db create churnguard
   ```

4. **Get Database URL:**
   ```bash
   turso db show churnguard
   ```
   - Copy the **URL** (starts with `libsql://`)
   - Example: `libsql://churnguard-yourname.turso.io`

5. **Create Auth Token:**
   ```bash
   turso db tokens create churnguard
   ```
   - Copy the token (long string starting with `eyJh...`)

**Save these:**
```
DATABASE_URL=libsql://churnguard-yourname.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

### 2️⃣ Google Gemini AI (Free)

**What it's for:** AI churn prediction, embeddings, vision analysis

**Steps:**

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Create API Key:**
   - Click **"Get API Key"** or **"Create API Key"**
   - Select **"Create API key in new project"**
   - Copy the API key (starts with `AIza...`)

**Save this:**
```
GOOGLE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuv
```

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- No credit card required ✅

---

### 3️⃣ Pinecone Vector Database (Free)

**What it's for:** Semantic search for AI chatbot (RAG system)

**Steps:**

1. **Sign Up:**
   - Visit: https://www.pinecone.io/
   - Click **"Start Free"**
   - Sign up with email or Google

2. **Create API Key:**
   - After login, go to **"API Keys"** in left sidebar
   - Click **"Create API Key"**
   - Name it: `churnguard`
   - Copy the API key (starts with `pcsk_...` or similar)

3. **Get Environment:**
   - In the same page, you'll see **"Environment"**
   - Example: `us-east-1-aws` or `gcp-starter`
   - Copy this value

4. **Create Index:**
   - Go to **"Indexes"** in left sidebar
   - Click **"Create Index"**
   - **Name:** `churnguard`
   - **Dimensions:** `768` (for Gemini embeddings)
   - **Metric:** `cosine`
   - **Region:** Choose closest to you
   - Click **"Create Index"**

**Save these:**
```
PINECONE_API_KEY=pcsk-1234567890abcdefghijklmnopqrstuv
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=churnguard
```

**Free Tier Limits:**
- 1 index
- 100,000 vectors
- 2GB storage
- No credit card required ✅

---

### 4️⃣ NextAuth Secret (Generate)

**What it's for:** Secure session management and authentication

**Steps:**

1. **Generate Secret:**
   ```bash
   # Using OpenSSL (macOS/Linux)
   openssl rand -base64 32
   
   # Using Node.js (All platforms)
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # Or visit: https://generate-secret.vercel.app/32
   ```

2. **Copy the output** (long random string)

**Save this:**
```
NEXTAUTH_SECRET=your-generated-secret-here-32-chars-minimum
```

---

### 5️⃣ NextAuth URL

**What it's for:** Base URL for authentication callbacks

**For Development:**
```
NEXTAUTH_URL=http://localhost:3000
```

**For Production (after deployment):**
```
NEXTAUTH_URL=https://your-app-name.vercel.app
```

---

### 6️⃣ Resend Email API (Free)

**What it's for:** Sending email campaigns and reports

**Steps:**

1. **Sign Up:**
   - Visit: https://resend.com/
   - Click **"Start Building"**
   - Sign up with email or Google

2. **Verify Email Domain (Optional but Recommended):**
   - Go to **"Domains"**
   - Click **"Add Domain"**
   - Add your domain (or use `resend.dev` for testing)
   - Add DNS records if using your domain

3. **Create API Key:**
   - Go to **"API Keys"**
   - Click **"Create API Key"**
   - Name it: `churnguard-production`
   - Copy the API key (starts with `re_...`)

4. **Set From Email:**
   - Use `onboarding@resend.dev` for testing
   - Or `your-name@your-domain.com` if verified

**Save these:**
```
RESEND_API_KEY=re_123456789_abcdefghijklmnopqrstuvwxyz
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month
- No credit card required ✅

---

### 7️⃣ Google Service Account (For Looker Studio Sync)

**What it's for:** Auto-sync customer data to Google Sheets for Looker Studio

**Steps:**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com

2. **Create New Project:**
   - Click dropdown at top (next to "Google Cloud")
   - Click **"NEW PROJECT"**
   - Name: `ChurnGuard`
   - Click **"CREATE"**

3. **Enable Google Sheets API:**
   - In search bar, type: `Google Sheets API`
   - Click on it
   - Click **"ENABLE"**

4. **Create Service Account:**
   - In left sidebar, go to **"IAM & Admin"** → **"Service Accounts"**
   - Click **"CREATE SERVICE ACCOUNT"**
   - **Name:** `churnguard-sync`
   - **Description:** `Auto-sync to Google Sheets`
   - Click **"CREATE AND CONTINUE"**
   - **Role:** Select **"Editor"**
   - Click **"CONTINUE"**
   - Click **"DONE"**

5. **Create Key:**
   - Click on the service account you just created
   - Go to **"KEYS"** tab
   - Click **"ADD KEY"** → **"Create new key"**
   - Choose **"JSON"**
   - Click **"CREATE"**
   - A JSON file will download

6. **Extract Credentials from JSON:**
   - Open the downloaded JSON file
   - Find `"client_email"` → Copy the email
   - Find `"private_key"` → Copy the entire key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

**Save these:**
```
GOOGLE_SERVICE_EMAIL=churnguard-sync@churnguard-123456.iam.gserviceaccount.com
GOOGLE_SERVICE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

**⚠️ Important:** Keep the `\n` characters in the private key!

---

### 8️⃣ Google Sheets Setup

**Steps:**

1. **Create Google Sheet:**
   - Go to: https://sheets.google.com
   - Click **"Blank"** to create new sheet
   - Name it: `ChurnGuard Customers`

2. **Share with Service Account:**
   - Click **"Share"** button (top right)
   - Paste your service account email
   - Set permission to **"Editor"**
   - Click **"Send"**
   - ⚠️ Ignore "couldn't find this email" warning - it will still work!

3. **Get Sheet ID:**
   - Look at the URL of your sheet:
   - `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy the `YOUR_SHEET_ID` part

**Save this:**
```
GOOGLE_SHEETS_ID=1uUuQvz8PzPTGWDssCjpklFqn83axsFqRt6aWDlXjbRA
```

---

### 9️⃣ Twilio SMS (Optional - Skip if not using SMS)

**What it's for:** Sending SMS campaigns

**Steps:**

1. **Sign Up:**
   - Visit: https://www.twilio.com/try-twilio
   - Sign up for free trial

2. **Verify Phone Number:**
   - Follow verification steps

3. **Get Credentials:**
   - Dashboard → Account Info
   - Copy **Account SID**
   - Copy **Auth Token**
   - Get your **Twilio Phone Number**

**Save these (if using SMS):**
```
TWILIO_ACCOUNT_SID=AC1234567890abcdefghijklmnopqrstuv
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Free Trial:**
- $15.50 credit
- Can send to verified numbers only
- Upgrade for production use

---

## ⚙️ Setup Environment Variables

Now that you have all credentials, create your `.env.local` file:

### Complete `.env.local` Template:

```bash
# ==========================================
# CHURNGUARD ENVIRONMENT VARIABLES
# ==========================================

# -------------------------------------------
# 1. DATABASE (Turso)
# -------------------------------------------
DATABASE_URL="libsql://churnguard-yourname.turso.io"
DATABASE_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."

# -------------------------------------------
# 2. AI & EMBEDDINGS (Google Gemini)
# -------------------------------------------
GOOGLE_API_KEY="AIzaSyC1234567890abcdefghijklmnopqrstuv"

# -------------------------------------------
# 3. VECTOR DATABASE (Pinecone)
# -------------------------------------------
PINECONE_API_KEY="pcsk-1234567890abcdefghijklmnopqrstuv"
PINECONE_ENVIRONMENT="us-east-1-aws"
PINECONE_INDEX="churnguard"

# -------------------------------------------
# 4. AUTHENTICATION (NextAuth)
# -------------------------------------------
NEXTAUTH_SECRET="your-generated-secret-here-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# -------------------------------------------
# 5. EMAIL (Resend)
# -------------------------------------------
RESEND_API_KEY="re_123456789_abcdefghijklmnopqrstuvwxyz"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# -------------------------------------------
# 6. GOOGLE SHEETS SYNC (Service Account)
# -------------------------------------------
GOOGLE_SERVICE_EMAIL="churnguard-sync@churnguard-123456.iam.gserviceaccount.com"
GOOGLE_SERVICE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_ID="1uUuQvz8PzPTGWDssCjpklFqn83axsFqRt6aWDlXjbRA"

# -------------------------------------------
# 7. LOOKER STUDIO (Optional - Add after setup)
# -------------------------------------------
NEXT_PUBLIC_LOOKER_STUDIO_URL="https://lookerstudio.google.com/embed/reporting/YOUR_REPORT_ID/page/YOUR_PAGE_ID"

# -------------------------------------------
# 8. SMS (Optional - Twilio)
# -------------------------------------------
# TWILIO_ACCOUNT_SID="AC1234567890abcdefghijklmnopqrstuv"
# TWILIO_AUTH_TOKEN="your_auth_token_here"
# TWILIO_PHONE_NUMBER="+1234567890"

# ==========================================
# END OF CONFIGURATION
# ==========================================
```

### 📝 Instructions:

1. **Copy the template above**
2. **Replace ALL placeholder values** with your actual credentials
3. **Save the file** as `.env.local` in the project root
4. **DO NOT commit** this file to Git (already in `.gitignore`)

---

## 🗄️ Initialize Database

Now we'll create all the database tables.

### Step 1: Create Database Schema

```bash
# This creates all tables in your Turso database
npm run db:setup
```

**What it creates:**
- ✅ `users` table (authentication)
- ✅ `customers` table (customer data)
- ✅ `campaigns` table (marketing campaigns)
- ✅ `campaign_messages` table (campaign messages)
- ✅ `images` table (image analysis)

### Step 2: Verify Database

```bash
# Test database connection
npm run db:test
```

**Expected output:**
```
✅ Database connection successful!
✅ Users table exists
✅ Customers table exists
✅ Campaigns table exists
📊 Database is ready!
```

---

## 🚀 Run the Application

### Development Mode

```bash
# Start development server
npm run dev
```

**Server will start at:**
- 🌐 Local: http://localhost:3000
- 🌐 Network: http://192.168.x.x:3000

### First-Time Setup:

1. **Visit:** http://localhost:3000
2. **Register Account:**
   - Click **"Register"**
   - Create your account
   - You'll be redirected to dashboard

3. **Test Features:**
   - Upload customer CSV
   - Analyze churn risk
   - Use AI chatbot
   - Create campaigns

---

## 📊 Looker Studio Setup (Optional but Recommended)

Follow these steps to connect Looker Studio for advanced analytics:

### Step 1: Sync Data to Google Sheets

```bash
# Visit this URL in browser
http://localhost:3000/api/looker/sync
```

**Expected response:**
```json
{
  "success": true,
  "recordCount": 329,
  "timestamp": "2024-12-09T..."
}
```

### Step 2: Verify Google Sheet

1. Open your Google Sheet
2. Should see customer data with columns:
   - ID, Name, Email, Phone, Company
   - Status, Last Activity Date, Total Revenue
   - Support Tickets, Churn Score, Risk Level

### Step 3: Create Looker Studio Report

1. **Go to:** https://lookerstudio.google.com
2. **Create Report:**
   - Click **"Create"** → **"Report"**
   - Choose **"Google Sheets"**
   - Select your ChurnGuard sheet
   - Click **"Add"**

3. **Design Dashboard:**
   - Add **Scorecards** for:
     - Total Customers (Record Count)
     - Total Revenue (SUM of totalRevenue)
     - High Risk Customers (Filter: riskLevel = 'high')
   - Add **Donut Chart** for Risk Distribution:
     - Dimension: riskLevel
     - Metric: Record Count
   - Add **Table** for Customer List:
     - Dimensions: name, email, riskLevel, status
     - Metrics: totalRevenue, churnScore

4. **Get Embed URL:**
   - Click **File** → **Embed report**
   - Check **"Enable embedding"**
   - Copy the iframe `src` URL
   - Should look like:
     ```
     https://lookerstudio.google.com/embed/reporting/REPORT_ID/page/PAGE_ID
     ```

5. **Add to Environment:**
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_LOOKER_STUDIO_URL="https://lookerstudio.google.com/embed/reporting/YOUR_REPORT_ID/page/YOUR_PAGE_ID"
     ```
   - Restart server: `npm run dev`

6. **View Dashboard:**
   - Visit: http://localhost:3000/dashboard/reports
   - Should see embedded Looker Studio! ✅

### Auto-Sync

The app automatically syncs data to Google Sheets every hour. You can also manually sync:

```bash
# Manual sync
curl -X POST http://localhost:3000/api/looker/sync
```

---

## 🐛 Troubleshooting

### Issue 1: Database Connection Failed

**Error:** `Failed to connect to database`

**Solution:**
```bash
# Test Turso CLI connection
turso db show churnguard

# Recreate auth token
turso db tokens create churnguard

# Update DATABASE_AUTH_TOKEN in .env.local
# Restart server
```

---

### Issue 2: Gemini API Error

**Error:** `429 Rate Limit Exceeded` or `Invalid API Key`

**Solution:**
1. **Verify API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Check key is active
   - Copy again if needed

2. **Rate Limits:**
   - Free tier: 60 requests/minute
   - Wait 1 minute and try again
   - Consider upgrading for production

---

### Issue 3: Pinecone Connection Failed

**Error:** `Failed to connect to Pinecone`

**Solution:**
1. **Check Index:**
   ```bash
   # Visit Pinecone console
   # Verify index "churnguard" exists
   # Verify dimensions = 768
   ```

2. **Check Environment:**
   - Must match your Pinecone region
   - Examples: `us-east-1-aws`, `gcp-starter`

3. **Recreate Index:**
   - Delete existing index
   - Create new with dimensions: 768
   - Update PINECONE_INDEX in `.env.local`

---

### Issue 4: Google Service Account Errors

**Error:** `Failed to sync to Google Sheets`

**Solution:**
1. **Verify Sharing:**
   - Open Google Sheet
   - Click "Share"
   - Ensure service account email has "Editor" access

2. **Check Private Key Format:**
   - Must include `\n` characters
   - Must be wrapped in quotes
   - Should look like:
     ```
     GOOGLE_SERVICE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
     ```

3. **Enable Google Sheets API:**
   - Visit: https://console.cloud.google.com
   - Search "Google Sheets API"
   - Click "Enable"

---

### Issue 5: Looker Studio Not Embedding

**Error:** `Can't access report` or blank iframe

**Solution:**
1. **Enable Embedding:**
   - In Looker Studio, click File → Embed report
   - Check "Enable embedding"
   - Click "Save"

2. **Verify URL Format:**
   - Must include `/embed/` in URL
   - ✅ Correct: `lookerstudio.google.com/embed/reporting/ID/page/PAGE_ID`
   - ❌ Wrong: `lookerstudio.google.com/reporting/ID`

3. **Check Sharing:**
   - Click "Share" in Looker Studio
   - Set to "Anyone with link can view"

---

### Issue 6: Environment Variables Not Loading

**Error:** Variables showing as `undefined`

**Solution:**
1. **Verify File Name:**
   - Must be exactly `.env.local` (note the dot!)
   - Must be in project root directory

2. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

3. **Check Syntax:**
   - No spaces around `=`
   - Values with spaces must be in quotes
   - Example: `KEY="value with spaces"`

---

### Issue 7: Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or on Windows:
# rmdir /s node_modules
# del package-lock.json
# npm install
```

---

## 📊 Free Tier Limits Summary

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Turso** | ✅ Free Forever | 9 GB storage, 500M rows read/month |
| **Gemini** | ✅ Free | 1,500 requests/day, 60/minute |
| **Pinecone** | ✅ Free | 1 index, 100K vectors, 2GB storage |
| **Resend** | ✅ Free | 100 emails/day, 3K emails/month |
| **Vercel** | ✅ Free | Unlimited deployments, 100GB bandwidth |
| **Google Sheets** | ✅ Free | 10M cells |
| **Looker Studio** | ✅ Free | Unlimited reports |

**Total Cost: $0/month for personal use!** 🎉

---

## 🚢 Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ChurnGuard setup"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/churnguard.git

# Push
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Visit:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New" → "Project"
4. **Import** your churnguard repository
5. **Configure:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add ALL variables from `.env.local`
   - ⚠️ Use production values for:
     - `NEXTAUTH_URL` → `https://your-app.vercel.app`
     - `RESEND_FROM_EMAIL` → verified domain

7. **Click:** "Deploy" 🚀

8. **Update URLs:**
   - After deployment, copy your Vercel URL
   - Update `NEXTAUTH_URL` in Vercel environment variables
   - Redeploy if needed

---

## 📖 Documentation Links

- **Next.js:** https://nextjs.org/docs
- **Turso:** https://docs.turso.tech
- **Gemini AI:** https://ai.google.dev/docs
- **Pinecone:** https://docs.pinecone.io
- **NextAuth:** https://next-auth.js.org/getting-started/introduction
- **Resend:** https://resend.com/docs/introduction
- **Looker Studio:** https://support.google.com/looker-studio

---

## 🆘 Need Help?

### Common Resources:

1. **Check Environment Variables:**
   ```bash
   # Print all env vars (be careful with secrets!)
   cat .env.local
   ```

2. **Check Logs:**
   ```bash
   # Server logs appear in terminal
   # Check for errors or warnings
   ```

3. **Test Individual Services:**
   ```bash
   # Test database
   npm run db:test
   
   # Test Looker sync
   curl http://localhost:3000/api/looker/sync
   ```

4. **GitHub Issues:**
   - Create an issue on GitHub repo
   - Include error message
   - Include steps to reproduce

---

## 📝 License

MIT License - Free to use for personal and commercial projects!

---

## 🎉 You're All Set!

Congratulations! You've successfully set up ChurnGuard. Here's what to do next:

1. ✅ Register your account
2. ✅ Upload customer data
3. ✅ Analyze churn risk with AI
4. ✅ Create retention campaigns
5. ✅ Use AI chatbot for insights
6. ✅ View analytics in Looker Studio

**Need help?** Check the Troubleshooting section or create a GitHub issue.

**Happy Churning!** 🚀💙