# Discover on Glow Hub

This branch contains the customer-discovery landing page and profile-first storefront milestone requested after reviewing Fresha.

## Scope

- Customer-first Glow Hub home with service, location, date and category discovery.
- Public discovery results built only from already-published, bookable storefront projections.
- Real services, prices, ratings and imagery only; no invented marketplace scale.
- Date filtering uses saved business working days. Final slot availability remains enforced by the existing booking engine.
- Profile-first storefront with business summary, gallery, service booking actions, real reviews, About, saved opening hours and WhatsApp.
- Existing storefront look/accent choices remain as subtle brand skins rather than separate page architectures.
- Owner app and Meta configuration remain separate from public discovery.

## Deployment state

Production is still on the previously verified AppDeploy v31 release. AppDeploy rejected the attempted release because the account reached its lifetime deploy limit (125/125), before any production changes were applied.

Do not merge this branch into production until it can be built and acceptance-tested in a deployment environment.
