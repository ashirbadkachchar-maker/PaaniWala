PaaniWala App 💧 — Ghar Ghar Shuddh Paani
Next.js 14 + Supabase + PWA — Live water delivery marketplace for Jodhpur (and any city)
Live Demo: https://your-vercel-url.vercel.app ← Vercel URL yahan paste karo
🚀 Kya hai isme? (Final Features - Green Build)
Buyer Flow
Login: OTP se (4 digit UI) + Password se (4-digit password pehle order ke baad auto banta hai)
Home: 4 categories — 20L Bottle, Camper, Tanker, Bisleri
Sellers: ?type= filter, Haversine distance se nazdeek se door tak sort (m / km badge), SVG rating stars (computer par bhi sahi dikhega)
Shop/[id]: Seller ka business name, area, us type ke products (Rs X /can/bottle/tanker)
Order/[pid]: Qty +/-, Delivery Slot (Aaj Subah 8, Shaam 5, Kal Subah 8), FREE delivery, platform fee (5% default)
Checkout: Pehla order → profiles me 4-digit password auto-generate → screenshot bolo, dobara nahi dikhega
Orders: Mere Orders list, Track Karo, Phir Se Order Karo
Track: /track (last order via localStorage) + /track/[oid] (PW-xxxx or id) → status timeline Naya → Confirm → Raste Me Hai → Pahuncha
Rating: Pahuncha hote hi ⭐ 1-5 + review → ratings table me save, seller ki rating update hoti hai
Seller Flow
/seller/register → admin approval tak status = pending (buyer ko nahi dikhega)
/seller/login → localStorage pw_seller_id
/seller/dashboard → Aaj ke orders count, Products count, Aaj ki kamai (seller_earning sum)
/seller/products → list, /seller/products/add → naya product
/seller/orders → tabs Sab/Naya/Confirm/Raste Me Hai/Pahuncha, naya order ka red badge
/seller/orders/[oid] → Order detail (Order ID, Qty, Kul Price, Platform Fee, Aapki Kamai), Buyer mobile, Slot, Address → Status buttons: Confirm Karo → Raste Me Bhejo → Pahuncha Complete
Admin Flow
/admin → Dashboard (components/AdminNav)
/admin/sellers → approve/reject + commission % set (default 5%)
/admin/orders → saare orders
/admin/bills, /admin/customers, /admin/settlement → legacy admin (AdminNav se linked)
PWA
components/PwaRegister.tsx → /sw.js register karta hai, mobile par Add to Home Screen
🛠 Tech Stack
Framework: Next.js 14.2.5 (App Router)
DB & Auth: Supabase (Postgres)
Styling: Tailwind + gold-card / gold-btn / chip-on/off (globals.css)
Icons: SVG stars, emoji fallback nahi
Location: Browser geolocation + Haversine formula (km)
PWA: service worker
📦 Database Setup (Sabse pehle ye karo)
supabase.com → New Project → naam paaniwala
SQL Editor me ye 3 files order wise RUN karo:
sql

-- 1. supabase.sql (base tables: profiles, sellers, products, orders, bills)
-- 2. supabase_marketplace.sql (commission_rate, seller_earning, status enums)
-- 3. supabase_ratings.sql (ratings table) — agar nahi hai to niche wala code chalao:
```sql
create table if not exists ratings (
id uuid primary key default gen_random_uuid(),
order_id text not null,
seller_id uuid not null,
buyer_mobile text,
rating int check (rating >=1 and rating <=5),
review text,
created_at timestamp default now()
);
-- profiles me password column add (agar nahi hai)
alter table profiles add column if not exists password text;
-- sellers me lat/lng/rating
alter table sellers add column if not exists lat float;
alter table sellers add column if not exists lng float;
alter table sellers add column if not exists rating float default 4.5;
alter table sellers add column if not exists commission_rate int default 5;
-- orders me fields
alter table orders add column if not exists order_id text unique;
alter table orders add column if not exists commission int default 0;
alter table orders add column if not exists seller_earning int default 0;
alter table orders add column if not exists delivery_slot text;
Settings → API se copy karo:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
Vercel → Project → Settings → Environment Variables → dono keys paste → Redeploy
🔑 Tables (Final Schema)
profiles — id, mobile (unique), name, address, password (4-digit, first order ke baad banta hai)
sellers — id, business_name, area, address, lat, lng, camper_rate, tanker_rate, rating, status (pending/approved), commission_rate
products — id, seller_id, item_type (bottle20/camper/tanker/bisleri), item_name, price
orders — id, order_id (PW-xxxx), mobile, seller_id, item_type, item_name, qty, price, commission, seller_earning, delivery_slot, address, status (Naya/Confirm/Raste Me Hai/Pahuncha/Cancel), created_at
ratings — id, order_id, seller_id, buyer_mobile, rating, review, created_at
bills — legacy (month, amount, paid) — optional
🧮 Commission Logic
Seller ka commission_rate default 5%
Order pe: price = product.price * qty
commission = round(price * rate / 100)
seller_earning = price - commission
Seller dashboard me Aaj ki kamai = aaj ke seller_earning ka sum
📁 Folder Structure (Green Build)
app/
  home/ (landing with categories)
  login/ (OTP + Password tabs)
  sellers/ (type filter + distance + rating)
  shop/[id]/ (seller products)
  order/[pid]/ (checkout + password generate)
  orders/ (mere orders)
  track/ (last order)
  track/[oid]/ (specific order + rating)
  success/ (order ho gaya)
  seller/
    register/, login/, dashboard/, products/, products/add/, orders/, orders/[oid]/
  admin/ (Dashboard, bills, customers, settlement, sellers, orders)
  layout.tsx (root + PwaRegister)
  globals.css (gold-card, gold-btn, input-gold, chip)
components/
  Header.tsx, BottomNav.tsx, AdminNav.tsx, PwaRegister.tsx
lib/
  supabase.ts (supabase client + getMobile() + makeOrderId() => PW-xxxx)
public/
  pagdi.png, sw.js, manifest.json
🚀 GitHub + Vercel Deploy
github.com → New repo PaaniWala → Create
Upload all files (drag-drop) → Commit
vercel.com → Add New Project → repo select → Env vars add → Deploy
Agar Module not found: @/components/... aaye → components/ me 4 files hain check karo: Header, BottomNav, AdminNav, PwaRegister
🧪 Test Credentials
Buyer: 90000000001 + password 3310 (ya OTP se login, pehla order karo to password milega)
Seller: /seller/login → jo register kiya uska mobile
Admin: /admin (agar auth lagaya hai to)
Flow test:
Buyer login (OTP) → Sellers → Dukkan Kholo → Order Karo → Password screenshot lo
Seller login → Orders Dekho → Confirm → Raste Me Bhejo → Pahuncha
Buyer → Orders → Track Karo → ⭐ rating do
🔮 Next Improvements
Supabase Auth OTP real SMS (Twilio)
Google Maps distance + seller lat/lng auto from address
UPI payment + COD toggle
Admin settlement report (seller_earning payout)
Push notification for Naya order (OneSignal)
📄 License
MIT — Jodhpur ke liye banaya, kahin bhi use kar sakte ho 💧
