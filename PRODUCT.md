# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Gründer (primary).** People in Schwalmstadt and the Schwalm-Eder region turning a business idea into a company. They need someone to guide them from idea through business plan, financing, legal form and registration, then stay with them. Their job on the site: judge whether this Kanzlei is the right long-term partner and make first contact (phone, contact form, chat).
2. **Bewerber.** Steuerfachangestellte, career changers and Azubis evaluating the Kanzlei as an employer via the Karriere page.
3. **Bestandsmandanten.** Existing clients looking up phone, opening hours, address or their Ansprechpartner.

## Product Purpose

Website of Kanzlei Karsten Walz, Steuerberater in Schwalmstadt. It replaces the legacy WordPress/Divi site kanzlei-karstenwalz.de. Success: new Mandanten (especially Gründer) get in touch, applicants apply, existing clients find contact details without calling around.

## Positioning

- **Long-tenured team.** Staff with the Kanzlei since 1981, 1996, 2003, 2006. Mandanten keep the same people for years.
- **Personal and local.** Owner-led since 2000 (sole owner since 2004), on site in Schwalmstadt.
- **Gründung as a core focus.** Existenzgründungsberatung and Coaching go beyond tax: long-term guidance toward business success, not only filings.

## Operating Context

- Client project, going live; Karsten Walz (Kanzlei) approves design.
- Visitors mostly local, often on mobile, often older or non-technical Mandanten.
- Contact runs via phone (06691 4271), contact page, and an AI chat assistant (Gemini via `src/pages/api/chat.ts`) that answers general questions and routes individual tax questions to an appointment.
- Address: Ziegenhainer Str. 3, 34613 Schwalmstadt. Opening hours: Mo–Do 8–17, Fr 8–13:30.

## Capabilities and Constraints

- Stack: Astro 5, Tailwind 4, GSAP + Lenis, deployed on Vercel. Pages: Start, Kanzlei, Leistungen (8 services from `src/data/services.json`), Team (`src/data/team.json`), Karriere, Kontakt, Impressum, Datenschutz.
- **Binding client decision (2026-06-12):** existing UX concept and look-and-feel stay unchanged (card layouts, rounded corners, shadows, original typography and buttons). No eyebrow labels, no chapter numbers on the landing page. An earlier editorial redesign was rolled back at the client's request. Improvements ship as an invisible layer: motion, polish, accessibility. See `docs/design-spec-awwwards.md`, `docs/styleguide-legacy.md`.
- Client asked for faster animations; motion must read as polish, never as loading state.
- Chat assistant must not give binding tax or legal advice.
- **Open, not a claim:** "digital and modern Kanzlei" is the site owner's (Martini Labs) vision; the Kanzlei has not adopted it yet. Do not present digital processes as current fact.

## Brand Commitments

- Name: Kanzlei Karsten Walz, Steuerberater. Logo: `public/images/brand/logo.png`.
- Brand identity inherited from the legacy site (`docs/styleguide-legacy.md` is source of truth).
- Voice: warm, professional, formal "Sie", German.
- Karsten Walz's motto: "Zusammenkunft ist ein Anfang, Zusammenhalt ist ein Fortschritt, Zusammenarbeit ist ein Erfolg."

## Evidence on Hand

- Real team photos: `public/images/team/` (owner and staff portraits, office header).
- Real team data with tenure dates: `src/data/team.json`.
- Service descriptions: `src/data/services.json`.
- No AI-generated imagery in use (unused set removed 2026-10-29). If any is added, never present it as real photos of the Kanzlei.
- No testimonials, client logos, case studies, ratings or awards exist. Do not fabricate them. Staff count "13+" comes from the chat prompt; verify before using as a headline claim.

## Product Principles

1. Continuity over novelty: the people and their tenure are the proof; show real faces and real years.
2. Gründer first: the path from idea to company is the lead story; tax services support it.
3. Reaching a person is the goal: phone, address and contact stay one step away on every page.
4. Respect the client's approved look: improve through motion, polish and accessibility, not restyling.
5. Claim only what is true today.

## Accessibility & Inclusion

- Audience includes older, non-technical local Mandanten: readable text, clear contact paths, generous touch targets.
- `prefers-reduced-motion` must disable motion (already implemented in `src/scripts/motion.ts`).
