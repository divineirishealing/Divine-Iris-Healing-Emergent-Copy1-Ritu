# Divine Iris Healing - Product Requirements Document

## Original Problem Statement
Build a pixel-perfect clone of https://divineirishealing.com/ with comprehensive admin panel, robust enrollment system with anti-fraud India-gating, custom duration tiers, promotions/coupon system, geo-currency detection, and multi-program cart system.

## Architecture
- **Frontend**: React + TailwindCSS + shadcn/ui
- **Backend**: FastAPI + Pydantic + Motor (async MongoDB)
- **Database**: MongoDB
- **Payments**: Stripe (TEST MODE) via emergentintegrations
- **Email**: Resend (configured, pending domain verification)
- **Fonts**: Cinzel (hero), Lato (section titles, labels), Cormorant Garamond (body text), via Google Fonts

## What's Been Implemented

### About Page (COMPLETED - Mar 12, 2026)
- [x] `/about` page with hero, logo, Meet the Healer, Philosophy, Impact, Mission & Vision
- [x] Admin About tab: Image upload for photo, Philosophy, Impact, Mission, Vision textareas
- [x] "Read Full Bio" → `/about`, ABOUT nav link → `/about`

### Program Detail Page (COMPLETED - Mar 12, 2026)
- [x] Hero with Cinzel small-caps title
- [x] 4 default section types: The Journey, Who It Is For?, Your Experience (dark #1a1a1a bg), Why You Need This Now?
- [x] Section titles in **Lato Bold** (fontWeight 700)
- [x] Section type dropdown: journey, who_for, experience, why_now, cta, custom
- [x] Image upload per section (ImageUploader)
- [x] Font styling per section: title/subtitle/body with bold, italic, font family, size, color
- [x] CTA "When you are seeking" + Enroll Now / Express Interest
- [x] Testimonials carousel

### Social Media + Legal Pages (COMPLETED - Mar 12, 2026)
- [x] 10 platforms with toggle: Facebook, Instagram, YouTube, LinkedIn, Spotify, Pinterest, TikTok, Twitter/X, Apple Music, SoundCloud
- [x] `/terms` and `/privacy` pages with admin editors
- [x] Sender email config per purpose
- [x] Gold icons for email/phone in footer

### Stats Font Styling (COMPLETED - Mar 12, 2026)
- [x] Icon field, value style, label style controls

### Previous Features (All COMPLETED)
- Per-program mode toggles (Online, Offline, In-Person)
- Discounts & Loyalty system
- UID generation system
- Multi-program cart + checkout
- Geo-currency detection
- Duration tier selectors
- Multi-person enrollment with anti-fraud India-gating
- Promotions & coupons
- 14-tab admin panel
- Stripe payments (TEST MODE)
- Resend email integration
- Post-payment links (WhatsApp, Zoom, Custom)
- First-time attendee + referral tracking

## Key Pages
| Page | Route |
|------|-------|
| Homepage | `/` |
| About | `/about` |
| Program Detail | `/program/:id` |
| Enrollment | `/enroll/program/:id?tier=X` |
| Cart | `/cart` |
| Cart Checkout | `/cart/checkout` |
| Contact/Quote | `/contact` |
| Terms | `/terms` |
| Privacy | `/privacy` |
| Admin | `/admin` |

## Prioritized Backlog

### P0 - High Priority
- [ ] Testimonials System (text-based, program-specific, searchable, merge into Transformations)
- [ ] Global Site Search (keyword search across all content)

### P1 - Medium Priority
- [ ] User login & subscriber dashboard
- [ ] Replace mock phone OTP
- [ ] Mobile responsiveness audit
- [ ] Verify Resend domain

### P2 - Low Priority
- [ ] Advanced anti-fraud geo-pricing
- [ ] SEO meta tags
- [ ] Admin analytics dashboard
- [ ] Bulk export enrollments
- [ ] Quote request management

## Admin Credentials
- URL: /admin | Username: admin | Password: divineadmin2024

## Test Data
- 6 programs (IDs 1-6), all flagship with 3 tiers
- Annual tier: price=0 → "Contact for Pricing"
- Promo codes: EARLY50 (fixed), NY2026 (15% off)
- Phone OTP: MOCKED | Stripe: TEST MODE
