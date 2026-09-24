# PaaniWala App 💧 (Supabase ke saath)

PaaniWala water delivery mobile app — Next.js + Supabase. Tagline: **Ghar Ghar Shuddh Paani**

## Database setup (pehle ye karo)
1. supabase.com → New Project → naam `paaniwala`
2. **SQL Editor** me `supabase.sql` file ka poora code paste karke **RUN** dabao
3. **Settings → API** se 2 keys copy karo:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vercel → Project → **Settings → Environment Variables** me dono keys dalo → **Redeploy**

## GitHub par dalne ke steps
1. github.com → New repository → naam `paaniwala-app` → Create
2. **uploading an existing file** → saari files drag-drop → Commit
3. vercel.com → Add New → Project → repo select → Deploy

## Tables
- `profiles` — naam, mobile, address
- `orders` — order_id, item_type, qty, price, discount, total, delivery_slot, status
- `bills` — month, amount, paid

## Marketplace Model
- Buyer: /sellers -> dukkan kholo -> product order karo (har order par platform commission auto-cut)
- Seller: /seller/register -> admin approval -> /seller login -> dashboard/orders/products
- Admin: /admin/sellers -> approve/reject, har seller ka commission % set karo (default 5%)
- SQL: pehle supabase.sql, phir supabase_marketplace.sql chalao
