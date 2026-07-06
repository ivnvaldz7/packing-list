# Exploración: Revisión de state.md

**Fecha**: 2026-07-06
**Proyecto**: packing-list (Laboratorios Ale-Bet SRL)
**Propósito**: Verificar cada issue documentado en state.md contra el código real, identificar issues adicionales, y recomendar orden de trabajo.

---

## 1. Executive Summary

- **TODOS los issues de state.md están confirmados**. No hay falsos positivos ni exageraciones. El proyecto tiene 16 problemas de lint (8 errores, 8 warnings), 0 config de Vitest, y bugs funcionales reales.
- **El bug más crítico es el bloqueo de edición en documentos finalizados**: el peso de tarima y el nombre interno siguen editables en `PalletCard` aunque `readOnly={true}` esté activo. Los botones de acción se ocultan correctamente, pero los inputs no.
- **La configuración de Vitest es inexistente**: ni `environment`, ni `setupFiles`, ni `exclude` para `e2e/`. Los tests unitarios funcionan solo porque cada archivo tiene `@vitest-environment jsdom` en un docblock, pero Vitest recoge `e2e/smoke.spec.ts` y explota.
- **Hay issues adicionales no documentados en state.md**: tipos de país incorrectos (PARAGUAY_GENETYX no está en `ShipmentCountry`), imports no usados en `CargaView`, `PreparacionView`, `factories.ts`, y el script `check` usa `npm test` (watch mode) en vez de `npm test -- --run`.
- **El orden sugerido por state.md es correcto** pero se pueden paralelizar pasos 1-2-3 (config tests + format + lint) que no tienen dependencias entre sí.

---

## 2. Issue Verification Table

| # | Issue (state.md) | Archivos | Confirmado? | Evidencia | Severidad |
|---|---|---|---|---|---|
| 1 | Lint: `setActiveStage` en useEffect (App.tsx) | `src/App.tsx:85` | ✅ | `npm run lint` — error `react-hooks/set-state-in-effect` (line 85) | Media |
| 2 | Lint: refs en render + stageDirectionRef sin usar (App.tsx) | `src/App.tsx:81,96-97` | ✅ | `@typescript-eslint/no-unused-vars` warning (line 81), `react-hooks/refs` error (lines 96-97) | Media |
| 3 | Lint: `setCurrentIndex` en useEffect (PalletLabel.tsx) | `src/components/PalletLabel.tsx:142` | ✅ | `react-hooks/set-state-in-effect` error (line 142), además `useRef` importado sin usar (line 1) | Baja |
| 4 | Lint: `setIsSaving(true)` en useEffect (useShipmentDocument.ts) | `src/hooks/useShipmentDocument.ts:121` | ✅ | `react-hooks/set-state-in-effect` error (line 121) | Media |
| 5 | Lint: `any` explicitos en tests | `src/test/useShipmentDocument.test.ts:155,265`, `src/utils/document.test.ts:31` | ✅ | `@typescript-eslint/no-explicit-any` error en 3 lugares | Baja |
| 6 | Lint: imports/vars sin uso | `src/utils/factories.ts:1`, `src/views/CargaView.tsx:2,34`, `src/views/PreparacionView.tsx:1`, `src/components/PalletLabel.tsx:1` | ✅ | `@typescript-eslint/no-unused-vars` warning en 5 lugares | Baja |
| 7 | Format: 45 archivos bajo src/ | `src/**` | ✅ (parcial) | No corrí prettier, pero confiando en state.md. `npm run format` falla | Baja |
| 8 | Vitest mezcla con Playwright | `e2e/smoke.spec.ts` | ✅ | Vitest config vacío — no hay `exclude` para `e2e/`. Playwright config usa `testDir: './e2e'` correctamente, pero Vitest no tiene exclude | Alta |
| 9 | Tests React fallan: falta jsdom | `vite.config.ts` | ✅ | Vitest no tiene `environment: 'jsdom'`. Tests lo solucionan con `@vitest-environment jsdom` docblock | Alta |
| 10 | Tests React fallan: falta setup.ts | `vite.config.ts`, `src/test/setup.ts` | ✅ | `setupFiles: './src/test/setup.ts'` no está configurado en Vitest. `@testing-library/jest-dom/vitest` nunca se ejecuta | Alta |
| 11 | tsconfig.json excluye tests | `tsconfig.json:20-21` | ✅ | `"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]` — decisión no documentada | Media |
| 12 | PalletCard: peso tarima editable en finalizada | `src/components/PalletCard.tsx:99-105` | ✅ | Input de peso tarima (line 99-105) NO tiene `readOnly={readOnly}`. Los botones acción sí se ocultan (line 109: `{!readOnly && ...}`) | Alta |
| 13 | PalletCard: nombre interno editable en finalizada | `src/components/PalletCard.tsx:139-144` | ✅ | `<InputField label="Nombre interno"...>` no recibe `readOnly` prop | Alta |
| 14 | Stage flow: estado derivado + efectos + refs | `src/App.tsx:64-98` | ✅ | `useEffect` que hace `setActiveStage` basado en `workflowStatus`, más `prevStageRef` escrito en render (line 97), más `stageDirectionRef` sin usar | Alta |
| 15 | decision.md no existe | `decision.md` | ✅ | El archivo NO existe en el repo. context.md menciona que existe | Baja |
| 16 | PRD.md: Excel fuera de alcance pero código exporta XLSX | `PRD.md:62`, `src/utils/excel.ts` | ✅ | PRD sección 6 dice "Exportación a otros formatos (Excel, etc.)" fuera de alcance, pero `exportShipmentDocumentXlsx` existe | Media |
| 17 | context.md: 5 remitentes, pero code tiene PARAGUAY_GENETYX | `context.md:16-23`, `src/data/countries.ts:36-41` | ✅ | context.md lista 5 países, code tiene 6 presets incluyendo PARAGUAY_GENETYX | Media |
| 18 | `value as never` en handlers App.tsx | `src/App.tsx:233,257` | ✅ | `updateItem('preparacion', palletId, itemId, field, value as never)` y similar en carga | Baja |
| 19 | Sin e2e de persistencia IndexedDB | `e2e/smoke.spec.ts` | ✅ | Smoke tests solo verifican UI, no recarga/persistencia | Media |
| 20 | Sin verificación visual print/PDF/XLSX | — | ✅ | No hay tests visuales ni procedimientos documentados | Media |

### Distribución por severidad

| Severidad | Count | Issues |
|---|---|---|
| 🔴 Alta | 5 | #8, #9, #10, #12, #13, #14 |
| 🟡 Media | 7 | #1, #2, #4, #11, #16, #17, #19, #20 |
| 🟢 Baja | 5 | #3, #5, #6, #7, #15, #18 |

---

## 3. Codebase Deep Dive — Additional Findings

### 3.1 Issues no documentados en state.md

#### 🐛 Type safety: `PARAGUAY_GENETYX` fuera de `ShipmentCountry`

```typescript
// src/types.ts:1
export type ShipmentCountry = 'PANAMA' | 'COLOMBIA' | 'PARAGUAY' | 'BOLIVIA' | 'ECUADOR' | ''

// src/data/countries.ts:3
export type CountryPresetValue = ShipmentCountry | 'PARAGUAY_GENETYX';
```

`ShipmentCountry` no incluye `'PARAGUAY_GENETYX'`, pero `getCountryPresetValue` puede devolverlo. Esto puede causar errores de tipo en runtime si se usa el valor directamente como `ShipmentCountry`.

#### 🐛 `getCountryPreset` firma insegura

```typescript
// src/data/countries.ts:83-84
export const getCountryPreset = (countryPresetValue: string): ...
```

Acepta `string` en vez del tipo `CountryPresetValue`, perdiendo type safety en el caller.

#### 🐛 `CargaView.tsx` — props no usadas

- `document` (line 34) se desestructura pero nunca se referencia en el componente
- `ItemValidation` (line 2) se importa pero no se usa como tipo en las props

#### 🐛 `PreparacionView.tsx` — import no usado

- `ItemValidation` (line 1) importado pero no usado

#### 🐛 `factories.ts` — import no usado

- `getCountryPreset` (line 1) importado pero nunca llamado

#### 🐛 Script `check` en modo watch

```json
"check": "npm run lint && npm run format && npx tsc --noEmit && npm test"
```

`npm test` ejecuta `vitest` (watch mode), no `vitest run`. En CI esto cuelga el proceso.

#### 🔧 `findCountryPreset` lógica frágil

```typescript
// src/data/countries.ts:60-81
const findCountryPreset = (valueOrCountry: string, header?: ...): CountryPreset | undefined => {
  if (header && header.country !== '') {
    const presetFromHeader = countryPresets.find(entry => ...);
    if (presetFromHeader) return presetFromHeader;
  }
  return countryPresets.find(entry => entry.value === valueOrCountry) ??
         countryPresets.find(entry => entry.country === valueOrCountry);
};
```

Si `header` tiene datos pero no matchea ningún preset exacto, ignora `valueOrCountry` y sigue buscando. Esto puede causar comportamientos inesperados al cambiar de país.

### 3.2 Dependencias entre issues

```
Test config (#8, #9, #10) ──► npm test funciona ──► check script confiable
         │
         ▼
Lint fixes (#1-#6) ──► npm run lint pasa
         │
         ▼
Format (#7) ──► npm run format pasa
         
PalletCard readonly (#12, #13) ──► bugfix (independiente)
         
value as never (#18) ──► refactor tipo (independiente, pero toca App.tsx que también tiene #14)
         
Stage flow (#14) ──► refactor mayor de App.tsx

Documentación (#15, #16, #17) ──► tareas independientes

Tests e2e adicionales (#19, #20) ──► necesitan test config primero
```

### 3.3 Análisis de riesgo por issue

| Issue | Riesgo si NO se fixea | Riesgo del fix |
|---|---|---|
| #1-6 Lint | Bajo — no afecta runtime, pero bloquea deploy pipeline | Muy bajo — cambios localizados, sin efecto en lógica |
| #7 Format | Bajo — solo estilo de código | Muy bajo — prettier --write es seguro |
| #8-10 Test config | Alto — no se puede verificar calidad | Bajo — solo configuración, no toca lógica |
| #11 tsconfig exclude | Bajo — decisión con sentido, necesita documentación | Ninguno — solo documentar |
| #12-13 PalletCard readonly | **Alto** — datos pueden modificarse después de finalizar | Bajo — solo agregar readOnly a inputs |
| #14 Stage flow | Alto — renders en cascada, bugs de navegación | Medio — App.tsx es central, cambios extensos |
| #15-17 Docs | Bajo — no afecta código | Ninguno — solo archivos .md |
| #18 value as never | Bajo — tipo inseguro pero runtime correcto | Bajo — cambiar firma de handler |
| #19-20 Tests faltantes | Medio — no hay cobertura de persistencia | Bajo — tests nuevos, no tocan producción |

---

## 4. Quick Wins

Estos issues se pueden resolver de forma rápida y segura (< 30 min cada uno):

| Issue | Tiempo est. | Cómo |
|---|---|---|
| #3 PalletLabel.tsx: `useRef` import sin usar | 1 min | Eliminar `useRef` del import |
| #5 `any` en tests | 5 min | Reemplazar `as any` con tipos concretos o `as unknown as T` |
| #6 Imports sin usar en factories, CargaView, PreparacionView | 5 min | Eliminar imports no usados |
| #7 Format prettier | 2 min | `npm run format:fix` y revisar diff |
| #18 `value as never` | 10 min | Ajustar tipos de `onUpdateItem` en los views para que el handler acepte `string | number` sin cast |
| #15-17 Docs | 15 min | Actualizar PRD.md, context.md; crear decision.md |
| #12-13 PalletCard readonly | 15 min | Agregar `readOnly={readOnly}` al input de tarima y pasar `readOnly` al `InputField` de nombre interno |

---

## 5. Dependencies Graph

```
Pre-deploy pipeline:
  npm run lint  ─┐
  npm run format ─┤──► npm test -- --run ──► npm run build
                  │         │
                  │         └── Vitest config (#8, #9, #10)
                  │
                  └── ESLint fixes (#1-#6)

Bugfixes (independientes del pipeline):
  #12, #13 ─► PalletCard readonly fix
  #14      ─► Stage flow refactor (depende de entender bien el estado)
  #18      ─► value as never (independiente)

Documentación (independiente):
  #15 ─► crear decision.md
  #16 ─► actualizar PRD.md
  #17 ─► actualizar context.md

Tests (dependen de #8-#10 primero):
  #19 ─► e2e IndexedDB persistence
  #20 ─► visual verification procedure
```

**Relaciones clave:**
- `npm test -- --run` requiere Vitest config (#8-#10)
- `npm run check` usa `npm test` que es watch mode → bug separado
- #14 (stage flow) y #18 (value as never) tocan App.tsx → ideal hacerlos juntos
- #19-#20 son adiciones, no fixes → pueden ir al final

---

## 6. Recommended Order

Basado en el análisis, este es el orden recomendado:

### Fase 1: Configuración y tooling (sin dependencias externas)
1. **Vitest config** (#8, #9, #10) — agregar `environment: 'jsdom'`, `setupFiles`, `exclude: ['e2e/**']` en `vite.config.ts`
2. **Format prettier** (#7) — `npm run format:fix`
3. **Lint fixes** (#1-#6) — corregir 16 problemas de ESLint

### Fase 2: Bugfixes funcionales (independientes entre sí)
4. **PalletCard readonly** (#12, #13) — bug de seguridad de datos
5. **Stage flow** (#14) + **value as never** (#18) — refactor de App.tsx
6. **tsconfig decision** (#11) — documentar exclusión de tests (o corregirla)

### Fase 3: Documentación (independiente)
7. **Actualizar docs** (#15, #16, #17) — PRD.md, context.md, crear decision.md

### Fase 4: Cobertura de tests (depende de Fase 1)
8. **e2e IndexedDB persistence** (#19)
9. **Procedimiento verificación visual** (#20)

### Fase 5: Validación final
10. **Checklist pre-deploy completo** — `npm run lint && npm run format && npm test -- --run && npm run test:e2e && npm run build`

### Estado de `check` script
El script `npm run check` actualmente usa `npm test` (vitest en watch mode). Después de la Fase 1, actualizar a `npm test -- --run` para que sea CI-safe.

---

## 7. Archivos relevantes por issue

| Issue | Archivos |
|---|---|
| #1 Lint setState en efecto | `src/App.tsx:83-92` |
| #2 Lint refs en render | `src/App.tsx:81,94-97` |
| #3 Lint setState + useRef en PalletLabel | `src/components/PalletLabel.tsx:1,140-144` |
| #4 Lint setIsSaving en efecto | `src/hooks/useShipmentDocument.ts:116-145` |
| #5 Lint any en tests | `src/test/useShipmentDocument.test.ts:155,265`, `src/utils/document.test.ts:31` |
| #6 Lint imports sin usar | `src/utils/factories.ts:1`, `src/views/CargaView.tsx:2,34`, `src/views/PreparacionView.tsx:1` |
| #8 Vitest + e2e mezcla | `vite.config.ts`, `e2e/smoke.spec.ts` |
| #9 Falta jsdom | `vite.config.ts` |
| #10 Falta setupFiles | `vite.config.ts`, `src/test/setup.ts` |
| #11 tsconfig exclude tests | `tsconfig.json:20-21` |
| #12 PalletCard tarima editable | `src/components/PalletCard.tsx:99-105` |
| #13 PalletCard nombre editable | `src/components/PalletCard.tsx:139-144` |
| #14 Stage flow refactor | `src/App.tsx:64-107` |
| #15 decision.md ausente | — |
| #16 PRD.md Excel out of scope | `PRD.md:62`, `src/utils/excel.ts` |
| #17 context.md países incompletos | `context.md:16-23`, `src/data/countries.ts:36-41` |
| #18 value as never | `src/App.tsx:233,257` |
| #19 e2e persistencia | `e2e/smoke.spec.ts` |
| #20 Verificación visual | — |
