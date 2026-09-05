# Discover on Glow Hub

Glow Hub now has two connected experiences: **Discover on Glow Hub** for customers and **Run on Glow Hub** for businesses.

## Customer experience

- Customer-first home with service, location, date and category discovery.
- Results come only from real published, bookable Glow Hub businesses.
- Real services, prices, ratings, work and opening hours only; no invented marketplace scale.
- Date filtering respects saved working days; final slot availability remains enforced by the booking engine.
- Public profiles keep a familiar customer hierarchy: business identity, photos, services/prices, reviews, About/opening hours, WhatsApp and booking.

## Storefront identity

The customer journey stays understandable, but **businesses do not share one generic website design**. Customize My Website selects a full template architecture:

- **Clean white / minimal** — restrained business header, crisp sans-serif hierarchy, clean collage, dense service clarity and generous white space.
- **Warm & soft / soft-luxe** — split editorial hero, rounded imagery, softer serif hierarchy, portfolio-led storytelling and card-based services.
- **Dark & bold / editorial** — cinematic full-bleed hero, heavy typography, hard-edged gallery, numbered service rows and high-contrast surfaces.

Accent colour, logo, cover photo and portfolio further individualise each design. The owner phone preview changes composition before saving. Switching designs never loses services, work, reviews, availability or booking data.

## Business experience

The private owner product remains: Today, Bookings, Clients, Growth and My Business. Meta authorization remains token-free for business owners.

## Production migration

The previous AppDeploy deployment remains as the last verified legacy runtime because that account reached its lifetime deployment limit. The approved production destination is **Vercel with a portable backend/auth/storage layer**.

**Merge gate:** provision the portable production backend, run the five acceptance journeys against Vercel, then merge this branch into `main` and make Vercel the actual Glow Hub production deployment.
