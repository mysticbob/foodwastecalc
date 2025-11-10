# Project Overview

- **Name**: `ovie-calculator`
- **Stack**: Vite 7 + React 18 + TypeScript 5.9 + Chakra UI (v2 custom theme), Vercel analytics.
- **Primary Feature**: Household food waste & cost modelling with email-gated results.
- **Key Modules (post-refactor)**:
  - `src/components/CalorieCalculator.tsx`: lightweight presentation layer composed of reusable sections.
  - `src/hooks/useHouseholdCalculator.ts`: centralised state + side-effect orchestration (inputs, derived results, email workflow).
  - `src/utils/calculator.ts` / `src/utils/people.ts` / `src/utils/region.ts`: pure utilities for calculation logic, default person generation, and location multipliers.
  - `src/constants/calculator.ts` & `src/types/calculator.ts`: shared domain constants/types.
- `src/utils/costAdjustment.ts`: placeholder for server-backed CPI adjustments (proxy-aware via Infisical-managed secrets).

# Architecture Notes

- Business logic moved out of the component tree into a typed hook and utility layer; React component tree now primarily declarative UI.
- Derived values computed via memoised helpers (no redundant `useEffect` loops) and rendered via presentational sections.
- Household configuration sanitises numeric input (ZIP filtered to digits, meals constrained) before recalculations.
- Default people generation synchronises with household changes via utility helpers to avoid duplication and random drift.
- Type system centralised in `src/types/calculator.ts`; the old duplicate defaults file has been removed.

# Security Notes

- Email capture now uses a shared validator with length, format and disposable-domain checks; console logging removed.
- `calculateCostAdjustment` no longer embeds a client-visible API key. It requires `VITE_BLS_PROXY_URL` to target a secure backend proxy before attempting CPI refreshes and skips the call otherwise.
- ZIP code input is numeric-only and trimmed to five characters. Household/meals inputs are clamped to safe ranges.
- No backend is yet wired for email submission; results gating is purely client-side. Rate limiting, CAPTCHA, and persistence remain future requirements.
- `npm audit --production` currently reports 0 vulnerabilities; dev-only advisories should still be monitored during dependency upgrades.
- Infisical CLI (`@infisical/cli`) added with `dev:secrets` / `build:secrets` scripts for populating `VITE_BLS_PROXY_URL` (and future secrets) at runtime.

# Secrets Management (Infisical)

- Configure `infisical.config.json` with your workspace project ID, environment slug, and secret paths.
- Authenticate locally (`npx @infisical/cli login`) and run `npm run dev:secrets` or `npm run build:secrets` to inject secrets into the Vite process.
- Expected secrets: `VITE_BLS_PROXY_URL` (optional) powering CPI proxy calls in `src/utils/costAdjustment.ts`; add more keys under `secrets` as needed.
- CI/CD: use `infisical run -- npm run build` or the new scripts with service tokens to inject env vars during deployment.

# Dependency Outlook

- **React 19 / React DOM 19**: blocked while Chakra UI v2 peers remain on React 18—upgrade after adopting Chakra UI 3.
- **Chakra UI 3.x**: major upgrade path with design tokens & component API adjustments; plan migration alongside React upgrade.
- **Vite 7 / `@vitejs/plugin-react` 5**: introduces improved dev server & SWC defaults; compatible once React upgrade path chosen.
- **Framer Motion 12**: optional upgrade; verify Chakra UI animation integration first.

# Pending / Follow-up Work

- Implement secure email submission (API or serverless function) with opt-in tracking + rate limiting.
- Add automated testing (unit coverage for calculator utilities, integration tests for email flow).
- Evaluate and schedule the React 19 + Chakra UI 3 migration; align with design/token updates once Chakra v2 → v3 migration is planned.
- Consider analytics/privacy review once backend capture is introduced.
- Configure Infisical project & secrets (`infisical.config.json`), and document environment-specific values for CI/CD.
