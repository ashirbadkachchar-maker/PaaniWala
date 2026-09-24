# PaaniWala App 💧 (Customer + Admin + Supabase)

PaaniWala water delivery app — Next.js + Supabase. Tagline: **Ghar Ghar Shuddh Paani**

## Customer App (11 screens)
`/` Splash → `/login` → `/home` → `/camper` → `/tanker` → `/track` → `/success` → `/bills` → `/plans` → `/profile` → `/address`

## Admin Panel
- `/admin` — Admin login (demo: **admin / admin123**)
- `/admin/dashboard` — Kul orders, pending, revenue, customers + taze orders
- `/admin/orders` — Saare orders, status badlo (Raste Me Hai → Pahunch Gaya → Cancel)
- `/admin/bills` — Naya bill banao, paid/bakaaya karo, delete karo
- `/admin/customers` — Customers ki list

## Database setup (pehle ye karo)
1. supabase.com → New Project → naam `paaniwala`
2. **SQL Editor** me `supabase.sql` ka poora code paste karke **RUN** dabao
3. **Settings → API** se 2 keys copy karo:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vercel → Project → **Settings → Environment Variables** me dono keys dalo → **Redeploy**

## GitHub par dalne ke steps
1. github.com → New repository → naam `paaniwala-app` → Create
2. **uploading an existing file** → saari files drag-drop → Commit
3. vercel.com → Add New → Project → repo select → Deploy
