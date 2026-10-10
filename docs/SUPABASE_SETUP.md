# Supabase Setup Guide for Campus Pulse

## 1. Create your Supabase Project
1. Log in to [supabase.com](https://supabase.com) (or navigate directly to [database.new](https://database.new)).
2. Click **New Project**.
3. Choose an Organization, enter:
   - **Name**: `campus-pulse`
   - **Database Password**: (Save this somewhere secure)
   - **Region**: Choose the closest region to you.
4. Click **Create new project** (takes ~1-2 minutes to spin up).

---

## 2. Obtain Your 2 API Credentials
In your Supabase project dashboard:
1. Click the **Settings (gear icon)** at the bottom of the left sidebar.
2. Select **API** (under Configuration).
3. Find and copy these two values:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API Keys** ➔ **`anon` `public`** key (starts with `ey...`)

*(Never use or expose the `service_role` secret key in frontend web applications).*

---

## 3. Configure `.env` in Campus Pulse
In the project root `c:\projects\DT_project\Campus Pulse`:
1. Create a file named `.env` (or copy from `.env.example`).
2. Paste your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 4. Run the Database Schema
1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **+ New query**.
3. Open the file [`supabase/schema.sql`](file:///c:/projects/DT_project/Campus%20Pulse/supabase/schema.sql) in this repo, copy all of its content, and paste it into the Supabase SQL editor.
4. Click **Run** (or press `Ctrl` + `Enter`).
5. You should see `Success. No rows returned`. All tables, triggers, and Row Level Security policies are now created.

---

## 5. (Optional) Create Storage Bucket for Photos
1. In your Supabase dashboard, click **Storage** in the left sidebar.
2. Click **New bucket**.
3. Enter Bucket name: `issue-evidence`
4. Toggle **Public bucket** to **ON** (allows displaying uploaded before/after photos).
5. Click **Save**.
