# PaaniWala App 💧

PaaniWala water delivery mobile app — Next.js (mobile-first). Tagline: **Ghar Ghar Shuddh Paani**

## Screens (11)
1. `/` — Splash (2 sec me Home par jata hai)
2. `/login` — Login / OTP + Google login
3. `/home` — Home
4. `/camper` — Camper Order
5. `/tanker` — Tanker Booking
6. `/track` — Order Track
7. `/success` — Order Success
8. `/bills` — Bills + UPI payment
9. `/plans` — Plans
10. `/profile` — Profile
11. `/address` — Naya Address Jodo

## GitHub par dalne ke steps
1. github.com par **New repository** banao, naam: `paaniwala-app`
2. **uploading an existing file** par click karo, saari files/folders drag-drop karo, **Commit changes**
3. vercel.com → **Add New → Project** → repo select karo → **Deploy**
4. 2 minute me live URL mil jayega 🎉

## Note
- `public/pagdi.png` — official locked logo (header + splash me use hota hai)
- Design: safed background, sunehri border, royal Rajasthani theme

## Play Store par dalne ke steps
1. Vercel par deploy karo (PWA ready hai — manifest + icons + service worker included)
2. Laptop par: `npm i -g @bubblewrap/cli`
3. `bubblewrap init --manifest https://tumhara-vercel-url/manifest.json`
4. `bubblewrap build` — `.aab` file banegi
5. play.google.com/console → developer account ($25) → app banao → `.aab` upload karo
