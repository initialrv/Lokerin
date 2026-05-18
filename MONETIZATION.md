# Monetization (low / zero ops cost)

This codebase ships **without** ads or billing wired in, so you keep $0 infra and avoid store policy surprises until you choose a path.

## Practical options (solo-friendly)

1. **Freemium + one-time “Pro” unlock (recommended first)**  
   - Free: unlimited local tracking, JSON export (already implemented).  
   - Pro (IAP): CSV export, email templates, custom statuses, themes, or encrypted backup file.  
   - **Cost:** Apple/Google revenue share only; use `expo-in-app-purchases` or RevenueCat free tier within limits.

2. **Ad-supported free tier**  
   - Add **AdMob** banner on list screen only; respect child-directed / sensitive employment context in copy and store listing.  
   - **Cost:** $0 unless you exceed free thresholds; watch UX impact.

3. **Paid cloud sync (later)**  
   - Optional Supabase free tier for auth + row-level sync; bill only power users.  
   - Keep SQLite as source of truth with background sync jobs.

4. **B2C light licensing**  
   - Sell a “Job search bundle” PDF + app combo on Gumroad / LemonSqueezy — marketing, not code.

## What *not* to do early

- Do not bolt on a custom server you must patch at 2 a.m.  
- Do not send résumés or employer notes to third-party LLMs without explicit consent UI and DPA review.

## Compliance reminders

- Disclose data locality (on-device) in App Store privacy answers.  
- If you add ads or analytics, update the privacy nutrition labels and in-app disclosure.
