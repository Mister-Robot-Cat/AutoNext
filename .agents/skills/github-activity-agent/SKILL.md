---
name: github-activity-agent
description: Autonomous repository evolution agent that drives continuous organic growth, feature implementations, and test coverage on GitHub for Mister-Robot-Cat.
---

# GitHub Activity & Evolution Workflow

This skill equips the agent to autonomously drive meaningful repository activity.

## Daily Evolution Runbook

1. **Repository Audit**:
   - Check `git log -n 5 --oneline` to review recent activity.
   - Read `ROADMAP.md` to identify pending features or refactors.

2. **Task Selection Criteria**:
   Rotate across 4 core engineering domains to keep the commit profile diverse and natural:
   - **Domain A: Core Features** (e.g. 360° exterior viewer, interactive finance charts, advanced filter pills)
   - **Domain B: Test Coverage** (e.g. Vitest unit tests for domain models, filters, currency converters)
   - **Domain C: Architecture & Refactoring** (e.g. extracting custom React hooks `useVehicleFilter`, `useWatchlist`, `useLoanCalculator`)
   - **Domain D: Performance & Polish** (e.g. image lazy loading, responsive micro-interactions, dark theme accents)

3. **Execution & Verification**:
   - Implement the selected code cleanly with TypeScript typing.
   - Execute verification:
     ```bash
     npm test
     npm run build
     ```

4. **Semantic Git Commit & Push**:
   - Craft a descriptive commit message following Conventional Commits.
   - Push directly to `origin main`.
