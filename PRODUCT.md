# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

*(Inferred from site content and navigation; not confirmed by interview.)* Private/retail investors in Uzbekistan considering the stock market for the first time, alongside corporate, institutional, and international investors who already trade securities of Uzbek issuers. Secondary audience: listed (АО/АТБ) companies needing depositary/registrar and underwriting services. The site includes a dedicated "Новичкам" (beginners) and "Как стать инвестором" path, indicating first-time retail investors are a deliberate, not incidental, audience.

## Product Purpose

*(Inferred.)* Birinchi Banklararo Depozitariy (BBD) is a licensed Uzbek securities-market intermediary offering brokerage, depositary/custody, investment consulting, underwriting, and asset-management services. The site's job is to establish credibility as a serious, licensed financial institution and convert visitors into brokerage/depositary clients or listed-company partners.

## Positioning

*(Inferred.)* One of the oldest fully private and independent investment-financial firms on the Uzbek stock market (founded 1998 under the Association of Banks of Uzbekistan), offering the full stack of services (broker + depositary + consulting + underwriting + asset management) rather than a single narrow service — positioned as an established, licensed, all-in-one capital-markets partner rather than a fintech startup.

## Operating Context

Russian-language site (also EN/UZ locales) for a Central-Asian securities market (Uzbekistan Republican Stock Exchange / UZSE, NAPP regulator references in nav). Content includes live-ish market data: guarantee fund balances, CBU currency rates, today's listed trades, top listing-company rankings, and company news — this is a regulated financial institution's public-facing site, not a marketing microsite, so factual/numeric content must stay accurate and unaltered.

## Capabilities and Constraints

- Static HTML site (scraped/exported; no build tooling, no framework, no package.json).
- Styling stack: `css/styles.min.css` (original template, minified, must not be edited) + `css/modern-design.css` (a separate, hand-authored override sheet that is the safe place for all new design work) + Google Fonts (Montserrat).
- Uses Slick carousel (jQuery) for the hero image slider and several ticker/carousel widgets further down the page — any hero redesign must keep working with the existing Slick markup/classes (`.slick-slider`, `.slick-dots`, `.slick-active`, etc.) since the JS wiring is out of scope to rewrite.
- Real numeric facts (client count, trade volume, founding year, etc.) come from the existing markup and must be preserved verbatim; do not invent new stats or claims.

## Brand Commitments

- Name: Birinchi Banklararo Depozitariy / Первый Межбанковский Депозитарий (BBD).
- Existing logo assets: `images/logo-blue.svg`, `images/logo-white.svg` — full wordmark + monogram, must be reused as-is (not redrawn).
- Existing primary palette in use site-wide: deep blue `#273B89` and cyan/azure accent `#00a2e0` — these are the institution's established brand colors and should anchor any new visual direction rather than being replaced outright.

## Evidence on Hand

- Real stat figures already in the markup: 31,737 clients, 3.5 trln UZS securities under management, 1.8 trln UZS client assets, 5.1 trln UZS trade volume, founded 1998.
- Real service list (from nav): Брокерские услуги, Депозитарные услуги, Консалтинговые услуги, Андерайтинговые услуги, Управление активами.
- Hero currently uses generic third-party stock photography (unrelated NYC skyline) with quote-style slider copy (Buffett/Usmanov/Allen quotes) — this is stand-in content, not confirmed brand evidence, and is a reasonable target for replacement.
- No customer testimonials, press logos, or case studies present — do not fabricate any.

## Product Principles

*(Inferred from the above; not confirmed by interview.)*
1. Credibility over hype — this is a licensed financial institution; the design should read as established and trustworthy, not like a startup pitching hype.
2. Preserve real numbers and services; never invent stats, testimonials, or claims.
3. Keep the institution's existing blue/cyan brand palette and wordmark as the anchor for any new visual direction.
4. Serve two distinct audiences at once (first-time retail investors and institutional/corporate ones) — copy and hierarchy should not alienate either.
5. Don't break the existing Slick-carousel wiring or the live market-data sections further down the page.

## Accessibility & Inclusion

No product-specific accessibility requirement was confirmed, but the existing site ships a visible accessibility toolbar (`.js-eye` — font size, contrast/B&W modes, screen-reader font) that must keep working; do not remove or visually break it.
