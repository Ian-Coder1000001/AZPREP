# AZPREP (unofficial AZ-900 study tool)
Not affiliated with or endorsed by Microsoft. All practice questions are original.

Features: Smart Quiz (instant explanations), Flashcard Coach (Leitner spaced repetition), Study Planner, AI Study Buddy (DeepSeek, African examples, local languages), Readiness Tracker. Login saves progress in MongoDB.

## Run
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill `DEEPSEEK_API_KEY`, `MONGODB_URI`, `AUTH_SECRET`
3. `npm run dev`

## Deploy
Push to GitHub, import in Vercel, add the same three environment variables, deploy.

## Roadmap
Cloudinary profile photos, more questions per topic, other Microsoft certifications.
