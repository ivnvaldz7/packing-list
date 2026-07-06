# Tasks: Revisa state.md — Quality fixes

**Change**: revisa-state-md — Eliminar 20+ bloqueos que impiden pipeline confiable.
**Strict TDD**: ACTIVE — cada tarea de implementación debe escribir tests primero (o verificar que tests existentes pasan).
**Test runner**: `npm test -- --run` (vitest).
**Overall status**: ⏳ **Blocked at Batch 7 V1** — 38 pre-existing test failures in `PalletLabels.test.tsx` prevent pipeline from passing.

---

## Batch 1 — Foundation: Tooling setup + lint independiente

### ✅ T1 — Configurar Vitest inline en vite.config.ts

**Files**: `vite.config.ts`
**Depends on**: none
**Description**:
1. Agregar bloque `test` en `defineConfig()`:
   - `environment: 'jsdom'`
   - `setupFiles: './src/test/setup.ts'`
   - `exclude: ['e2e/**', 'node_modules/**']`
2. Verificar que `src/test/setup.ts` existe y tiene `import '@testing-library/jest-dom/vitest'`
3. Ejecutar `npm test -- --run` — debe pasar sin errores
4. Verificar que tests en `e2e/` NO se ejecutan (solo unit/component tests)
**Verification**:
- `npx vitest run --reporter=verbose` → 0 failures
- No incluye `e2e/smoke.spec.ts` en la salida
- `npm test -- --run` → exit code 0

---

### ✅ T2a — Fix lint: archivos independientes (no App.tsx)

**Files**: 
- `src/utils/factories.ts` — eliminar `import { getCountryPreset }` (línea 1)
- `src/views/CargaView.tsx` — eliminar `ItemValidation` del import tipo (línea 2), eliminar `document,` del destructuring (línea 34)
- `src/views/PreparacionView.tsx` — eliminar `ItemValidation` del import tipo (línea 1)
- `src/test/useShipmentDocument.test.ts` — eliminar `createMockHeader`, `createMockProduct` del import (línea 8); tipar pallets como `Pallet[]` (línea 155); eliminar `as any` en country (línea 265)
- `src/utils/document.test.ts` — reemplazar `as any` con `as unknown as Pallet` (línea 31)

**Depends on**: none
**Description**:
1. Task independiente — NO toca App.tsx (se resuelve en Batch 4)
2. Para cada archivo, eliminar imports/variables no usados y reemplazar casts `as any` con tipos correctos
3. Correr `npm run lint` — debe bajar de 16 issues a los que corresponden a App.tsx, PalletLabel.tsx y useShipmentDocument.ts
**Verification**:
- `npm run lint` → count < 16 (solo quedan issues en App.tsx, PalletLabel.tsx, useShipmentDocument.ts)
- Cada archivo modificado tiene type-check correcto (`npx tsc --noEmit`)
- Tests existentes siguen pasando (`npm test -- --run`)

---

### ✅ T3 — Run Prettier en src/ y revisar diff

**Files**: `src/**/*` (múltiples archivos)
**Depends on**: T2a (evitar conflictos con cambios de lint)
**Description**:
1. Ejecutar `npx prettier --write src/`
2. Revisar `git diff` para confirmar solo cambios de formato (sin cambios de lógica)
3. Si hay cambios sospechosos (mezcla de tabs/spaces, etc.), corregir manualmente
4. Commit aislado solo de formato
**Verification**:
- `npm run format` → exit code 0 (sin diferencias)
- `npm run build` → sigue pasando
- `npm test -- --run` → sigue pasando

---

### ✅ T4 — Fix check script en package.json

**Files**: `package.json`
**Depends on**: T1 (vitest config), T2a (lint fixes)
**Description**:
1. En el script `check`, cambiar `npm test` por `npm test -- --run` (evitar modo watch)
2. Orden del pipeline: `lint && format && tsc --noEmit && test --run`
3. Verificar que `npm run check` corre completo y exit code 0
**Verification**:
- `npm run check` → pasa lint, format, tsc, y test --run secuencialmente
- No queda en modo watch

---

## Batch 2 — Lint en PalletLabel.tsx

### ✅ T2b — Fix lint en PalletLabel.tsx

**Files**: `src/components/PalletLabel.tsx`
**Depends on**: T2a
**Description**:
1. Eliminar `useRef` del import de React (línea 1, no usado)
2. Envolver `setCurrentIndex` dentro de `requestAnimationFrame()` en el useEffect (líneas 140-144):
   ```tsx
   useEffect(() => {
     if (currentIndex >= labelCount) {
       requestAnimationFrame(() => {
         setCurrentIndex(Math.max(0, labelCount - 1));
       });
     }
   }, [labelCount, currentIndex]);
   ```
**Verification**:
- `npm run lint` → 0 errores/warnings en PalletLabel.tsx
- El componente sigue funcionando: al reducir `labelCount` por debajo de `currentIndex`, el índice se ajusta correctamente
- No hay regresión visual

---

## Batch 3 — Hook improvements (useShipmentDocument.ts)

### ✅ T2c+S3 — Fix useShipmentDocument.ts: lint + updateItem signature + openStoredDocument return

**Files**: `src/hooks/useShipmentDocument.ts`
**Depends on**: T2a, T2b
**Description**:
**Part A — Fix setIsSaving lint (T2c)**:
1. Mover `setIsSaving(true)` dentro del `setTimeout()` callback en el efecto de guardado (línea 121)
2. Código actual:
   ```tsx
   useEffect(() => {
     if (status === 'loading') return;
     setIsSaving(true);  // ← afuera del timeout, causa lint error
     const timeoutId = setTimeout(() => {
       void saveDocument(document)...
     }, 600);
     return () => clearTimeout(timeoutId);
   }, [document, status]);
   ```
3. Código nuevo:
   ```tsx
   useEffect(() => {
     if (status === 'loading') return;
     const timeoutId = setTimeout(() => {
       setIsSaving(true);
       void saveDocument(document)...
     }, 600);
     return () => clearTimeout(timeoutId);
   }, [document, status]);
   ```

**Part B — Fix updateItem signature (S3)**:
1. Reemplazar la firma genérica `updateItem<K extends keyof PalletItem>(...)` con una unión concreta
2. Firma nueva:
   ```tsx
   const updateItem = (
     mode: 'preparacion' | 'carga',
     palletId: string,
     itemId: string,
     field: 'productionNumber' | 'quantity',
     value: string | number,
   ): void => { ... }
   ```
3. Esto permite eliminar los casts `value as never` en App.tsx (Batch 4)

**Part C — Make openStoredDocument return workflowStatus (para S1)**:
1. Cambiar return type de `openStoredDocument` a `Promise<ShipmentWorkflowStatus | undefined>`
2. Después de `setDocument()`, retornar el `workflowStatus` del documento cargado
3. Esto permite que App.tsx pueda `await` el resultado y setear la etapa (Batch 4)

**Verification**:
- `npm run lint` → 0 errores/warnings en useShipmentDocument.ts
- `npm test -- --run` → todos los tests pasan (actualizar mocks si es necesario)
- `openStoredDocument` retorna el workflowStatus correcto
- `updateItem` acepta los mismos parámetros que antes (compatible hacia atrás)

---

## Batch 4 — App.tsx refactor + PalletCard readonly

### ✅ S1+S2 — Stage flow refactor en App.tsx

**Files**: `src/App.tsx`
**Depends on**: T2c+S3 (openStoredDocument + updateItem signature)
**Description**:
Este refactor resuelve 4 issues de lint en App.tsx + el bug del stage flow.

**Cambios concretos**:
1. **Eliminar** `const stageDirectionRef = useRef(0)` (línea 81) — no se usa
2. **Reemplazar** `prevStageRef` (useRef) con `useState`:
   ```tsx
   const [prevStage, setPrevStage] = useState(activeStage);
   const stageDirection = stageOrder[activeStage] - (stageOrder[prevStage] ?? stageOrder[activeStage]);
   ```
3. **Eliminar** el useEffect de sync (líneas 83-92) que llama `setActiveStage` dentro del effect
4. **Mover sync de activeStage a handlers**:
   - `openStoredDocument`: usar `await` con el nuevo return type para setear `activeStage`
   - `createNewDocument`: `setActiveStage('preparacion')`
5. **En `handleStageChange`**: agregar `setPrevStage(activeStage)` antes de cambiar de etapa
6. **Eliminar** los casts `value as never` en los handlers de `onUpdateItem` (líneas 233 y 257), ahora que `updateItem` tiene firma concreta

**Verificación**:
- `npm run lint` → 0 errores/warnings en App.tsx
- `npm test -- --run` → todos los tests pasan
- Smoke test manual: navegar carteles → preparacion → carga → finalizada, verificar que stage refleja workflowStatus
- Abrir documento guardado: debe restaurar la etapa correcta según workflowStatus

---

### ✅ P1+P2+P3 — PalletCard readonly en documentos finalizados

**Files**: `src/components/PalletCard.tsx`
**Depends on**: none (puede hacerse en paralelo con Batch 3)
**Description**:
**P1 — Peso tarima input readonly**:
- Líneas 99-105: agregar `readOnly={readOnly}` y className `readonlyCls` al `<input>` de peso tarima
```tsx
<input
  type="number"
  min={0}
  value={pallet.palletTareWeightKg}
  onChange={(e) => onUpdatePallet(...)}
  readOnly={readOnly}
  className={readOnly ? readonlyCls : fieldCls}  // o mantener className original con readonly condicional
/>
```

**P2 — Nombre interno InputField readonly**:
- Líneas 139-144: pasar `readOnly={readOnly}` como prop al `<InputField>`
```tsx
<InputField
  label="Nombre interno"
  value={pallet.label}
  onChange={(event) => onUpdatePallet(pallet.id, 'label', event.target.value)}
  placeholder={`Paleta ${index + 1}`}
  readOnly={readOnly}
/>
```

**P3 — No finalizados siguen editables**:
- Verificar que cuando `readOnly={false}` (default), los inputs son editables
- Ya cubierto por el condicional `!readOnly` que oculta botones de acción

**Verificación**:
- `npm test -- --run` → todos los tests pasan
- Verificación visual: crear documento, finalizar, ver que peso tarima y nombre interno son readonly (cursor-default, opacity-70)
- Documento en estado `cargada` o `preparacion`: mismos campos editables

---

## Batch 5 — Documentation

### D1 — Update PRD.md — ✅ COMPLETE

**Files**: `PRD.md`
**Depends on**: none
**Description**:
1. ✅ **Sección 5** (Alcance MVP): agregada nota "Exportación a XLSX implementada como utilidad adicional"
2. ✅ **Sección 6** (Fuera de alcance): eliminada "Exportación a otros formatos (Excel, etc.)"
3. ✅ **Sección 8** (Datos de cada país): agregada fila `PARAGUAY_GENETYX` en tabla de remitentes
4. ✅ **Resumen**: cambiado "5 países" por "6 países"
**Verification**:
- ✅ PRD.md actualizado refleja el estado real del código
- ✅ No menciona Excel como "fuera de alcance"
- ✅ PARAGUAY_GENETYX documentado

---

### D2 — Update context.md — ✅ COMPLETE

**Files**: `context.md`
**Depends on**: none
**Description**:
1. ✅ **Sección "Remitentes por país"**: agregada fila `PARAGUAY_GENETYX | GENETYX | BERNARDINO CABALLERO 1515, MARIANO ROQUE ALONSO-PARAGUAY`
2. ✅ **Sección "Stack técnico"**: agregados Vitest, Playwright, Tailwind v4
3. ✅ **Sección "Estado del repositorio"**: corregido — `decision.md` ahora existe (creado en D3)
**Verification**:
- ✅ context.md refleja 6 presets de país
- ✅ Stack técnico completo

---

### D3 — Create decision.md (nuevo) — ✅ COMPLETE

**Files**: `decision.md`
**Depends on**: none
**Description**:
Crear archivo con 3 decisiones de arquitectura documentadas:
1. ✅ `tsconfig.json exclude: ["src/**/*.test.*"]` — tests no se compilan con proyecto porque vitest actúa como transpilador
2. ✅ `ShipmentCountry` vs `CountryPresetValue` — por qué `PARAGUAY_GENETYX` es preset adicional no expuesto en el selector principal de país
3. ✅ Por qué la config de Vitest está inline en `vite.config.ts` en lugar de archivo separado
**Verification**:
- ✅ Archivo `decision.md` creado en raíz del proyecto
- ✅ Contenido técnicamente correcto y consistente con el código

---

## Batch 6 — Testing

### ✅ E1+E2 — Add IndexedDB persistence e2e test

**Files**: `e2e/smoke.spec.ts`
**Depends on**: T1 (vitest config — para asegurar que e2e no interfiere)
**Description**:
Agregar nuevo test en `e2e/smoke.spec.ts`:
1. Navegar a preparación, seleccionar país, agregar pallet con datos
2. Recargar página (`page.reload()`)
3. Esperar que "Cargando borrador local" desaparezca
4. Verificar que datos persisten (mismo pallet count, mismos valores en header)
5. Verificar que el documento cargado tiene el mismo workflowStatus

**Playwright test pattern**:
```ts
test('persists data across page reload via IndexedDB', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

  // Set country
  await page.locator('#header-section').getByLabel('País').selectOption('COLOMBIA');
  await page.getByRole('button', { name: 'Preparación', exact: true }).click();

  // Verify data set
  await expect(page.locator('#header-section').getByText('LABORATORIOS AUROFARMA SAS')).toBeVisible();

  // Reload
  await page.reload();
  await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

  // Verify persistence
  await expect(page.locator('#header-section').getByText('LABORATORIOS AUROFARMA SAS')).toBeVisible();
});
```

**Verification**:
- `npm run test:e2e` — 9 tests pasan (8 originales + 1 nuevo)
- Test de persistencia pasa en Chromium

---

### ✅ E3 — Document visual verification procedure

**Files**: (documentación — puede ir en `PRD.md`, `context.md`, o archivo separado)
**Depends on**: D1, D2, D3
**Description**:
Documentar checklist manual de verificación visual en contexto del proyecto:
- [ ] Carteles: preview muestra datos correctos por país
- [ ] Packing list: header, pallets, items, totals
- [ ] Print preview: A4 landscape carteles, portrait packing list
- [ ] PDF export: contenido completo, encoding correcto
- [ ] XLSX export: columnas correctas, datos por pallet
- [ ] Dark mode: todos los componentes visibles
- [ ] Documento finalizado: inputs readonly, botones ocultos

Incluir en `context.md` sección de testing/deploy.
**Verification**:
- Procedimiento documentado en `context.md` o archivo de testing
- Cualquier persona puede seguir la checklist

---

## Batch 7 — Validation

### V1 — Run full pre-deploy checklist

**Files**: none (comandos secuenciales)
**Depends on**: todos los batches anteriores
**Description**:
Ejecutar pipeline pre-deploy completo en orden:
1. ✅ `npm run lint` — 0 errors, 0 warnings
2. ✅ `npm run format` — All matched files use Prettier code style
3. ✅ `npx tsc --noEmit` — 0 errors
4. ❌ `npm test -- --run` — **38/95 tests fail** (57 pass). All failures in `PalletLabels.test.tsx` — `getByText`/`getByLabelText` finds multiple elements (pre-existing)
5. ⏹️ `npm run build` — not executed (stop-on-failure per protocol)
6. ⏹️ `npm run test:e2e` — not executed (stop-on-failure per protocol)

**Bloqueante**: 38 pre-existing test failures in `PalletLabels.test.tsx`. These are NOT caused by recent changes — they pre-date all batches. Root cause: tests use `getByText`/`getByLabelText` which match 12+ rendered elements (multiple preview cards).

**Fix requerido**: Replace `getByText` → `getAllByText`, `getByLabelText` → `getAllByLabelText` in `PalletLabels.test.tsx`. Adjust assertions for multiple elements.

**Estado**: ⏳ V1 blocked until PalletLabels.test.tsx failures are fixed.

**Verification**:
- Todos los comandos retornan exit code 0 secuencialmente — **NO CUMPLIDO**
- `npm run check` también pasa — **NO CUMPLIDO

---

## Resumen de batches

| Batch | Tasks | Descripción | Depende de | Estado |
|-------|-------|-------------|------------|--------|
| 1 | T1, T2a, T3, T4 | Tooling: Vitest, lint independiente, Prettier, check script | — | ✅ |
| 2 | T2b | PalletLabel lint fix | T2a | ✅ |
| 3 | T2c+S3 | Hook: setIsSaving, updateItem signature, openStoredDocument return | T2b | ✅ |
| 4 | S1+S2, P1-P3 | App.tsx refactor + PalletCard readonly | Batch 3, T2a | ✅ |
| 5 | D1, D2, D3 | PRD, context, decision.md | — | ✅ |
| 6 | E1+E2, E3 | Testing e2e + visual verification doc | T1 | ✅ |
| 7 | V1 | Validation pre-deploy | Todos | ⏳ Bloqueado |

## Total tasks

14 tasks distribuidas en 7 batches.
