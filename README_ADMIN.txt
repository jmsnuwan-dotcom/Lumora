LUMORA BOT ADMIN UPDATE SYSTEM
================================

Files:
- admin/index.html        Admin login + upload/publish UI
- admin/config.js         Supabase URL + PUBLIC anon key
- admin/config.example.js Template
- supabase/schema.sql     Database + RLS + private storage setup
- index.html              Client website
- downloads/LumoraBot-Latest.zip  Current bundled client

SETUP:
1. Create/choose the Supabase project for this Lumora Bot website.
2. Run supabase/schema.sql in Supabase SQL Editor.
3. Create an admin user in Supabase Authentication (email/password).
4. Add that user's UUID to public.admin_users.
5. Copy admin/config.example.js to admin/config.js and enter the project's URL and PUBLIC anon key.
6. Open admin/index.html to test login and upload.
7. The client index.html still uses the bundled ZIP until its latest-release reader/download endpoint is connected.

IMPORTANT:
- Never put the Supabase service_role key in HTML/JS.
- The supplied 68 MB client remains bundled for the current offline download.
- The private storage bucket is intentionally used so the Bot file is not publicly listable.
