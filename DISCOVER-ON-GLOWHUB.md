# Discover on Glow Hub

This branch develops Glow Hub into two connected experiences: **Discover on Glow Hub** for customers and **Run on Glow Hub** for businesses.

## Customer experience

- Customer-first Glow Hub home with service, location, date and category discovery.
- Public results are built only from real published, bookable Glow Hub businesses.
- Real services, prices, ratings, work and opening hours only; no invented marketplace scale.
- Date filtering respects saved business working days; final slot availability remains enforced by the booking engine.
- Public profiles keep a familiar customer hierarchy: business identity, photos, services/prices, reviews, About/opening hours, WhatsApp and booking.

## Storefront identity

Glow Hub keeps the customer journey predictable but **does not make every business use the same website design**. Customize My Website selects a true template architecture:

- **Clean white / minimal** — restrained business header, crisp sans-serif hierarchy, clean collage, dense service clarity and generous white space.
- **Warm & soft / soft-luxe** — split editorial hero, rounded imagery, softer serif hierarchy, portfolio-led storytelling and card-based services.
- **Dark & bold / editorial** — cinematic full-bleed hero, heavy typography, hard-edged gallery, numbered service rows and high-contrast surfaces.

Accent colour, logo, cover photo and portfolio further individualise each template. Booking rules, availability and customer data remain shared underneath.

## Business experience

The private owner app remains separate from discovery: Today, Bookings, Clients, Growth and My Business. Meta authorization remains token-free for business owners.

## Deployment migration

AppDeploy production remains on the previously verified v31 release because that account reached its lifetime deployment limit (125/125). The approved direction is to migrate Glow Hub to a real Vercel production deployment with a portable backend before this branch is merged to `main`.
