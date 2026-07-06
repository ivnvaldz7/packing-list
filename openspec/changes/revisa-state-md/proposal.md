# Proposal: Revisa state.md — Quality fixes

## Intent

Eliminar los 20+ bloqueos de calidad del proyecto packing-list. Bugs funcionales (documentos finalizados editables), test config ausente, lint/format rotos, y docs desactualizadas. Sin estos fixes no hay deploy confiable ni pipeline que verifique calidad.

## Scope

### In Scope
- Vitest config: environment jsdom, setupFiles, exclude e2e/
- ESLint fixes: 16 issues (setState en efectos, imports sin usar, `any` en tests, refs en render)
- Prettier format en 45+ archivos src/
- PalletCard readonly bug (peso tarima + nombre interno editables en finalizada)
- Stage flow refactor App.tsx + fix `value as never`
- Documentación: crear `decision.md`, actualizar PRD.md, context.md
- `check` script: usar `vitest run` no watch
- e2e persistencia IndexedDB + procedimiento verificación visual

### Out of Scope
- Nuevas features o UI redesign
- Migración a otro state manager
- Tests unitarios nuevos (solo configurar existentes)
- Agregar países o funcionalidad nueva

## Capabilities

**New Capabilities**: None (pure technical debt / bugfixes)

**Modified Capabilities**: None (bugfixes corrigen comportamiento ya especificado)

## Approach

5 fases secuenciales. Fase 1 internamente paralelizable:

**Fase 1 — Tooling** (independientes):
- `vite.config.ts`: agregar `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`, `exclude: ['e2e/**']`
- `npm run format:fix`, revisar diff
- Fix 16 lint issues en 6 archivos. Sin cambios de lógica.

**Fase 2 — Bugfixes**:
- PalletCard: `readOnly={readOnly}` en input tarima + pasar readOnly a InputField nombre interno
- App.tsx: eliminar efectos derivados de stage, estado directo, refactor handlers sin `as never`

**Fase 3 — Docs**: crear `decision.md` (tsconfig exclude + country type rationale), actualizar PRD.md (Excel in scope), context.md (6 países)

**Fase 4 — Tests**: e2e IndexedDB (escribir → recargar → verificar), procedimiento verificación visual

**Fase 5 — Validación**: check script con `vitest run`, pipeline completo: lint → format → test —run → build

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `vite.config.ts` | Modified | Vitest config (jsdom, setupFiles, exclude) |
| `src/App.tsx` | Modified | Stage flow refactor + handler types |
| `src/components/PalletCard.tsx` | Modified | readOnly en tarima + nombre interno |
| `src/components/PalletLabel.tsx` | Modified | Remove unused import |
| `src/hooks/useShipmentDocument.ts` | Modified | Fix setIsSaving effect |
| `src/views/CargaView.tsx` | Modified | Remove unused imports |
| `src/views/PreparacionView.tsx` | Modified | Remove unused imports |
| `src/utils/factories.ts` | Modified | Remove unused import |
| `src/test/*.test.ts` | Modified | Replace `as any` con tipos concretos |
| `tsconfig.json` | Documented | Exclude tests rationale |
| `decision.md` | Created | Architecture decisions doc |
| `PRD.md` | Updated | Excel in scope clarification |
| `context.md` | Updated | Add PARAGUAY_GENETYX country |
| `package.json` | Modified | check script: `vitest run` |
| `e2e/smoke.spec.ts` | Modified | Add IndexedDB persistence test |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stage flow refactor rompe navegación | Medium | Smoke tests antes/después, commit aislado |
| PalletCard readonly rompe edición no-finalizada | Low | readOnly condicional `readOnly && finalized` |
| Prettier reformatea archivos sensibles | Low | Revisar diff por commit, commit separado |

## Rollback Plan

Cada fase en commit independiente. `git revert <commit>` por fase. Stage flow con tag `pre-stage-refactor`. PalletCard son 2 líneas, revertir directo.

## Dependencies

- Fase 1 → Fase 4 (tests necesitan Vitest config)
- Fases 1, 2, 3 independientes entre sí
- Fase 5 requiere Fases 1-4 completas

## Success Criteria

- [ ] `npm run lint` — 0 errors, 0 warnings
- [ ] `npm run format` — pasa sin cambios
- [ ] `npm test -- --run` — todos los tests pasan
- [ ] `npm run check` — no cuelga (usa `vitest run`)
- [ ] `npm run build` — pasa
- [ ] PalletCard inputs tarima + nombre NO editables en finalizada
- [ ] `decision.md` existe con rationale de tsconfig exclude + country type
- [ ] e2e test verifica persistencia IndexedDB entre recargas
