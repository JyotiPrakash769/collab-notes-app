# Deployment Instructions for Netlify

Your app is configured to act as a **Progressive Web App (PWA)** and is ready for Next.js deployment. However, because this is a **collaborative** app that saves data, you cannot use the local `dev.db` file on Netlify. You must use a cloud database.

## Step 1: Get a Free Database
1.  Go to **[Neon.tech](https://neon.tech)** or **[Supabase](https://supabase.com)** and create a free account.
2.  Create a new project.
3.  Copy the **Connection String** (it looks like `postgres://user:password@host/neondb...`).

## Step 2: Configure Netlify
1.  Push your code to **GitHub**.
2.  Log in to **Netlify** and "Import from Git".
3.  Select your repository.
4.  In the Netlify configuration screen, look for **Environment Variables**.
5.  Add a new variable:
    *   Key: `DATABASE_URL`
    *   Value: *(Paste your connection string from Step 1)*

## Step 3: Update Code for Production (CRITICAL)
Before you push to GitHub, you need to switch your app to use PostgreSQL instead of SQLite.

1.  Open `prisma/schema.prisma`.
2.  Change `provider = "sqlite"` to `provider = "postgresql"`.
3.  Ensure `url` is `env("DATABASE_URL")`.

**Note:** Once you do this, your local app will stop working unless you also add that `DATABASE_URL` to your local `.env` file.
