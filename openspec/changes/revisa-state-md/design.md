# Design: Revisa state.md — Quality fixes

## Technical Approach

5 fases secuenciales con commits independientes. Cada fase resuelve issues de state.md con cambios mínimos, sin alterar lógica de negocio. Todas las fases preservan comportamiento existente — los tests existentes y el build son la verificación.

---

## Phase 1: Tooling

### Decision: Vitest config

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Vitest config inline en vite.config.ts | Un solo archivo de config | ✅ **Integrar en vite.config.ts** (sigue patrón existente) |
| vitest.config.ts separado | Más explícito pero duplica config | ❌ Rechazado |

**Archivo**: `vite.config.ts`
**Cambio**: Agregar bloque `test`:
```ts
export default defineConfig({
  plugins: [tailwindcss(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
```
**Verificación**: `npx vitest run --reporter=verbose` — 0 failures, no incluye `e2e/`.

### Decision: Prettier format

**Comando**: `npx prettier --write src/`
**Revisión**: `git diff` para confirmar solo cambios de formato (sin lógica). Commit aislado.

### Decision: Lint fixes (8 errors, 8 warnings)

| Archivo | Issue(s) | Fix exacto |
|---------|----------|------------|
| `src/App.tsx:81` | `stageDirectionRef` unused | Eliminar línea `const stageDirectionRef = useRef(0);` |
| `src/App.tsx:83-92` | `setActiveStage` en useEffect | Eliminar useEffect completo. Ver Fase 2 para manejo. |
| `src/App.tsx:94-97` | refs en render | Reemplazar `prevStageRef` con `useState`. Ver Fase 2. |
| `src/components/PalletLabel.tsx:1` | `useRef` import unused | Eliminar `useRef` del import |
| `src/components/PalletLabel.tsx:140-144` | `setCurrentIndex` en useEffect | Envolver en `requestAnimationFrame(() => setCurrentIndex(...))` |
| `src/hooks/useShipmentDocument.ts:121` | `setIsSaving` en useEffect | Mover `setIsSaving(true)` dentro del setTimeout |
| `src/utils/factories.ts:1` | `getCountryPreset` import unused | Eliminar línea 1 completa |
| `src/views/CargaView.tsx:2` | `ItemValidation` import unused | Eliminar `ItemValidation` del import tipo |
| `src/views/CargaView.tsx:34` | `document` destructured unused | Eliminar `document,` del destructuring |
| `src/views/PreparacionView.tsx:1` | `ItemValidation` import unused | Eliminar `ItemValidation` del import tipo |
| `src/test/useShipmentDocument.test.ts:8` | `createMockHeader`, `createMockProduct` unused | Eliminar ambos del import |
| `src/test/useShipmentDocument.test.ts:155` | `as any` in pallets | Tipar como `Pallet[]`: `as Pallet[]` |
| `src/test/useShipmentDocument.test.ts:265` | `as any` in country | Eliminar `as any` — `'COLOMBIA'` ya es `ShipmentCountry` |
| `src/utils/document.test.ts:31` | `as any` in pallet | Reemplazar con `as unknown as Pallet` |

**Riesgo**: Ninguno — cambios localizados, sin efecto en runtime.

---

## Phase 2: Bugfixes

### Decision: PalletCard readonly

| Input actual | Línea | readOnly actual | Fix |
|---|---|---|---|
| Peso tarima (kg) raw `<input>` | 99-105 | ❌ No tiene | Agregar `readOnly={readOnly}` y className `readonlyCls` |
| Nombre interno `<InputField>` | 139-144 | ❌ No pasa prop | Agregar `readOnly={readOnly}` al componente |

**Cambio en PalletCard.tsx**:
- Línea 99-105: agregar `readOnly={readOnly}` + className `readonlyCls` al input de tarima
- Línea 139-144: pasar `readOnly={readOnly}` como prop a `<InputField>`

**Visual**: `readonlyCls` ya existe y aplica `cursor-default opacity-70`.

### Decision: Stage flow refactor (App.tsx)

**Problema**: Estado derivado (`activeStage` derivado de `workflowStatus`) + efectos + refs en render.

**Arquitectura propuesta**:

```
Estado actual:
  activeStage ← useState('carteles')
  useEffect(sync desde workflowStatus) ← set-state-in-effect
  prevStageRef ← useRef + lectura/escritura en render ← refs error

Estado nuevo:
  activeStage ← useState('carteles') — solo UI stage
  prevStage   ← useState(activeStage) — sin refs
  sync stage  ← en handlers (openStoredDocument + createNewDocument)
```

**Cambios concretos**:

1. **Eliminar** `stageDirectionRef` (line 81)
2. **Reemplazar** `prevStageRef` con `useState`:
   ```tsx
   const [prevStage, setPrevStage] = useState(activeStage);
   const stageDirection = stageOrder[activeStage] - (stageOrder[prevStage] ?? stageOrder[activeStage]);
   ```
3. **Mover sync de activeStage a handlers**:
   - En `openStoredDocument` del hook: retornar `workflowStatus` → App.tsx usa `await` para setear etapa
   - En `createNewDocument` wrapper: `setActiveStage('preparacion')`
   - Eliminar el `useEffect` de sync (lines 83-92)
4. **En `handleStageChange`**: agregar `setPrevStage(activeStage)` antes de `setActiveStage(nextStage)`
5. **Mantener en `useShipmentDocument`**: `openStoredDocument` retorna `Promise<ShipmentWorkflowStatus>`

**Riesgo**: Medio — cambiar flujo de carga de documentos. Mitigación: commit aislado, smoke tests e2e antes/después.

### Decision: Fix `value as never`

**Cambio**: Simplificar firma de `updateItem` en el hook — eliminar genérico `K`, usar unión concreta:
```tsx
const updateItem = (
  mode: 'preparacion' | 'carga',
  palletId: string,
  itemId: string,
  field: 'productionNumber' | 'quantity',
  value: string | number,
): void => { ... }
```
**Archivos**: `src/hooks/useShipmentDocument.ts` (signature) + `src/App.tsx` (eliminar `as never`).

---

## Phase 3: Documentation

### PRD.md
- **Sección 5** (Alcance MVP): agregar nota — "Exportación a XLSX implementada como utilidad adicional"
- **Sección 6** (Fuera de alcance): eliminar "Exportación a otros formatos (Excel, etc.)" o mover a "Fase 2"
- **Sección 8**: agregar fila `PARAGUAY_GENETYX` en tabla de remitentes

### context.md
- **Sección "Remitentes por país"**: agregar fila `PARAGUAY_GENETYX | GENETYX | BERNARDINO CABALLERO 1515, MARIANO ROQUE ALONSO-PARAGUAY`
- **Sección "Stack técnico"**: agregar Vitest, Playwright, Tailwind v4

### decision.md (nuevo)
Documentar:
- `tsconfig.json exclude: ["src/**/*.test.*"]` — tests no se compilan con proyecto, usan `vitest` como transpilador
- `ShipmentCountry` vs `CountryPresetValue` — `PARAGUAY_GENETYX` es preset adicional no expuesto en selector principal
- Por qué `vite.config.ts` integra config de Vitest (no archivo separado)

---

## Phase 4: Testing

### E2E IndexedDB persistence

**Archivo**: `e2e/smoke.spec.ts`
**Nuevo test**:
1. Navegar a preparación, agregar pallet, completar datos
2. Recargar página (`page.reload()`)
3. Verificar que datos persisten (mismo pallet count, mismos valores)
4. Verificar que `Cargando borrador local` desaparece

### Visual verification procedure (documentado)

Checklist manual:
- [ ] Carteles: preview muestra datos correctos por país
- [ ] Packing list: header, pallets, items, totals
- [ ] Print preview: A4 landscape carteles, portrait packing list
- [ ] PDF export: contenido completo, encoding correcto
- [ ] XLSX export: columnas correctas, datos por pallet
- [ ] Dark mode: todos los componentes visibles
- [ ] Documento finalizado: inputs readonly, botones ocultos

---

## Phase 5: Validation

**Pre-deploy checklist** (orden actualizado):
1. ✅ `npm run lint` — 0 errors, 0 warnings
2. ✅ `npm run format:check` (antes `format`) — sin cambios
3. ✅ `npx tsc --noEmit` — 0 errors
4. ✅ `npm test -- --run` — todas las suites pasan
5. ✅ `npm run build` — build exitoso
6. ✅ `npm run test:e2e` — smoke tests + IndexedDB persistence
7. ✅ Verificación visual (checklist Phase 4)

**Script `check`**: Actualizar en `package.json`:
```json
"check": "npm run lint && npm run format && npx tsc --noEmit && npm test -- --run"
```
Cambio clave: `npm test` → `npm test -- --run` (vitest run, no watch).

---

## File Changes Summary

| File | Action | Phase |
|------|--------|-------|
| `vite.config.ts` | Modify | 1 — Agregar config test |
| `src/App.tsx` | Modify | 1+2 — Lint fixes + stage refactor |
| `src/components/PalletCard.tsx` | Modify | 2 — readOnly inputs |
| `src/components/PalletLabel.tsx` | Modify | 1 — Fix setState effect + unused import |
| `src/hooks/useShipmentDocument.ts` | Modify | 1+2 — Fix setIsSaving + updateItem signature |
| `src/utils/factories.ts` | Modify | 1 — Remove unused import |
| `src/views/CargaView.tsx` | Modify | 1 — Remove unused imports/var |
| `src/views/PreparacionView.tsx` | Modify | 1 — Remove unused import |
| `src/hooks/useShipmentDocument.ts` | Modify | 2 — return workflowStatus from openStoredDocument |
| `src/utils/document.test.ts` | Modify | 1 — Fix `as any` |
| `src/test/useShipmentDocument.test.ts` | Modify | 1 — Fix unused imports + `as any` |
| `package.json` | Modify | 1+5 — Fix check script |
| `e2e/smoke.spec.ts` | Modify | 4 — Add persistence test |
| `PRD.md` | Modify | 3 — Update scope + countries |
| `context.md` | Modify | 3 — Add country + stack |
| `decision.md` | Create | 3 — Architecture decisions |
