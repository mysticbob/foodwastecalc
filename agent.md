# Project Overview

- **Name**: `ovie-calculator`
- **Stack**: Vite + React 18 + TypeScript + Chakra UI (custom theme), Vercel analytics.
- **Primary Feature**: Household food waste & cost modelling with email-gated results.
- **Key Modules (post-refactor)**:
  - `src/components/CalorieCalculator.tsx`: lightweight presentation layer composed of reusable sections.
  - `src/hooks/useHouseholdCalculator.ts`: centralised state + side-effect orchestration (inputs, derived results, email workflow).
  - `src/utils/calculator.ts` / `src/utils/people.ts` / `src/utils/region.ts`: pure utilities for calculation logic, default person generation, and location multipliers.
  - `src/constants/calculator.ts` & `src/types/calculator.ts`: shared domain constants/types.
  - `src/utils/costAdjustment.ts`: placeholder for server-backed CPI adjustments (now proxy-aware).

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

# Dependency Outlook

- **React 19 / React DOM 19**: available; upgrade requires Chakra UI 3 or migration to React 19-compatible component libraries.
- **Chakra UI 3.x**: major upgrade path with design tokens & component API adjustments; plan migration alongside React upgrade.
- **Vite 7 / `@vitejs/plugin-react` 5**: introduces improved dev server & SWC defaults; compatible once React upgrade path chosen.
- **Framer Motion 12**: optional upgrade; verify Chakra UI animation integration first.

# Pending / Follow-up Work

- Implement secure email submission (API or serverless function) with opt-in tracking + rate limiting.
- Add automated testing (unit coverage for calculator utilities, integration tests for email flow).
- Evaluate and schedule the React 19 + Chakra UI 3 migration; align with design/token updates.
- Consider analytics/privacy review once backend capture is introduced.
