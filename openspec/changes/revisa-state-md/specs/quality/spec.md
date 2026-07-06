# Delta Spec: Quality Fixes

**Change**: revisa-state-md — Eliminar 20+ bloqueos que impiden pipeline confiable.

## Background

Tests rotos (sin config Vitest), lint/format fallando, bugs funcionales (docs finalizadas editables). 5 fases secuenciales.

---

## ADDED Requirements

### Tooling: Vitest, ESLint, Prettier, check script

| ID | Requirement | Strength |
|----|-------------|----------|
| T1 | Vitest config: `environment: 'jsdom'`, `setupFiles`, `exclude: ['e2e/**']` | MUST |
| T2 | ESLint: 0 errors, 0 warnings in `src/` | MUST |
| T3 | Prettier: zero diff after `format:fix` | MUST |
| T4 | `check` script: `vitest run`, no watch | MUST |

**Scenarios**:
- T1: GIVEN no Vitest config, WHEN `vitest run`, THEN unit tests pass without `@vitest-environment jsdom` docblocks
- T1: GIVEN `e2e/smoke.spec.ts` exists, WHEN `vitest run`, THEN e2e tests are NOT collected
- T2: GIVEN 16 lint issues, WHEN `npm run lint`, THEN 0 errors, 0 warnings
- T3: GIVEN 45+ unformatted files, WHEN `format:fix && npm run format`, THEN no diffs
- T4: GIVEN check uses `npm test` (watch), WHEN `npm run check`, THEN it exits with code 0

**AC**: T1-T4 pass: lint → format → test --run → build.

---

### Bugfix: PalletCard readonly en finalizada

| ID | Requirement | Strength |
|----|-------------|----------|
| P1 | Peso tarima input MUST be `readOnly` when `workflowStatus === "finalizada"` | MUST |
| P2 | Nombre interno InputField MUST receive `readOnly` prop when finalized | MUST |
| P3 | No finalizados MUST remain editable | MUST |

**Scenarios**:
- P1: GIVEN document finalized, WHEN viewing PalletCard, THEN tarima input has `readOnly`
- P2: GIVEN document finalized, WHEN viewing PalletCard, THEN nombre interno is not editable
- P3: GIVEN `workflowStatus: "cargada"`, WHEN viewing PalletCard, THEN both fields editable

**AC**: `<input>` has `readOnly={readOnly}`, InputField receives `readOnly`.

---

### Bugfix: Stage flow App.tsx

| ID | Requirement | Strength |
|----|-------------|----------|
| S1 | Stage MUST derive from `workflowStatus` directly, no derived `useEffect` | MUST |
| S2 | Unused refs MUST be removed | MUST |
| S3 | Handlers MUST avoid `value as never` cast | MUST |

**Scenarios**:
- S1: GIVEN effect calls `setActiveStage` from `workflowStatus`, WHEN refactored, THEN stage reflects status on every render
- S3: GIVEN handlers use `as never`, WHEN signatures corrected, THEN no `as never` remains

**AC**: No stage-sync `useEffect`, no unused refs, no `as never`.

---

### Documentation: PRD, context, decision.md

| ID | Requirement | Strength |
|----|-------------|----------|
| D1 | PRD.md MUST clarify Excel export IS in scope (implemented) | MUST |
| D2 | context.md MUST list all 6 country presets | MUST |
| D3 | decision.md MUST document tsconfig exclude + CountryPresetValue type | MUST |

**Scenarios**:
- D1: GIVEN PRD says Excel "out of scope", WHEN updated, THEN section 6 acknowledges implemented Excel export
- D2: GIVEN context.md lists 5 countries, WHEN updated, THEN PARAGUAY_GENETYX included
- D3: GIVEN decision.md absent, WHEN created, THEN it contains both rationales

**AC**: Three files updated/created with correct content.

---

### Testing: e2e persistencia + verificación visual

| ID | Requirement | Strength |
|----|-------------|----------|
| E1 | e2e MUST verify IndexedDB data persists across page reload | MUST |
| E2 | Reloaded data MUST match original input | MUST |
| E3 | Visual verification procedure SHOULD be documented | SHOULD |

**Scenarios**:
- E1: GIVEN user fills data, WHEN page reloads, THEN same data appears in UI
- E2: GIVEN specific fields filled, WHEN saved and reloaded, THEN all values match original

**AC**: `e2e/smoke.spec.ts` has IndexedDB persistence test; visual check procedure exists.

---

### Validation: Pre-deploy pipeline

| ID | Requirement | Strength |
|----|-------------|----------|
| V1 | Pipeline MUST pass: lint → format check → test --run → build | MUST |

**Scenario**:
- V1: GIVEN all Phase 1-4 fixes applied, WHEN sequential pipeline executes, THEN each step exits code 0

**AC**: All four commands succeed sequentially.
