# Estado tecnico del proyecto

Ultima revision: 2026-07-06

## Estado actual

El proyecto es una aplicacion React + TypeScript + Vite para gestionar packing lists de exportacion de Laboratorios Ale-Bet. El flujo principal cubre carteles, preparacion, carga final, documentos finalizados, persistencia local con IndexedDB y exportacion a PDF/XLSX.

El build productivo esta funcional, pero el proyecto no esta listo para deploy hasta resolver los bloqueantes de calidad.

Resultados verificados:

- `npm run build`: pasa.
- `npm run test:e2e`: pasa, 8 smoke tests en Chromium.
- `npm run lint`: falla.
- `npm run format`: falla.
- `npm test -- --run`: falla.

Estado del worktree al momento de la revision:

- Cambios modificados: `package.json`, `package-lock.json`, `src/App.tsx`, `src/components/DocumentLibrary.tsx`, `tsconfig.json`.
- Archivo nuevo: `src/utils/animations.ts`.
- Directorio no trackeado: `.netlify/`.

## Bloqueantes pre-deploy

Antes de desplegar, deben pasar estos comandos:

```bash
npm run lint
npm run format
npm test -- --run
npm run test:e2e
npm run build
```

Bloqueantes detectados:

- `lint` falla por reglas de React Hooks:
  - `src/App.tsx`: `setActiveStage` dentro de `useEffect`, lectura/escritura de refs durante render y `stageDirectionRef` sin uso.
  - `src/components/PalletLabel.tsx`: `setCurrentIndex` dentro de `useEffect`.
  - `src/hooks/useShipmentDocument.ts`: `setIsSaving(true)` dentro de `useEffect`.
- `lint` tambien falla por `any` explicitos en tests y por imports/variables sin uso.
- `format` falla en 45 archivos bajo `src/`; correr Prettier debe ser un paso separado y revisado.
- `npm test -- --run` mezcla Vitest con Playwright porque Vitest esta recogiendo `e2e/smoke.spec.ts`.
- Los tests React fallan por configuracion incompleta de Vitest: falta entorno `jsdom` y carga de `src/test/setup.ts`.
- `tsconfig.json` excluye tests del typecheck; definir si es una decision temporal o corregirlo para cubrir tests.

## Bugs y deuda tecnica

- Documentos finalizados no quedan completamente bloqueados. En `PalletCard`, el peso de tarima y el nombre interno siguen editables aunque el documento este en `workflowStatus: "finalizada"`.
- El flujo de etapa en `App.tsx` mezcla estado derivado, efectos y refs para animaciones. Simplificar para evitar renders en cascada y cumplir React Hooks.
- La documentacion esta desfasada:
  - `context.md` menciona `decision.md`, pero el archivo no existe.
  - `PRD.md` dice que Excel esta fuera de alcance, pero el codigo ya exporta XLSX.
  - `context.md` y `PRD.md` documentan 5 remitentes originales, pero `src/data/countries.ts` ya incluye `PARAGUAY_GENETYX`.
- El checklist `npm run check` no es confiable mientras `npm test` mezcle unitarios/e2e y Vitest no tenga entorno DOM.
- Hay deuda de tipado en handlers de `App.tsx`, donde se usa `value as never` para adaptar `updateItem`.
- La estrategia IndexedDB es offline-first, pero no hay una prueba e2e explicita de persistencia entre recargas ni de recuperacion/migracion.
- La impresion/PDF/XLSX requiere verificacion visual con documentos reales antes de deploy, especialmente para pallets multiples, textos largos y lotes divididos.

## Guidelines para proximas actualizaciones

- No desplegar si falla cualquiera de los comandos del checklist pre-deploy.
- Mantener separados los runners:
  - Vitest solo para unit/component tests.
  - Playwright solo para e2e.
- Configurar Vitest desde `vite.config.ts` o un config dedicado con:
  - entorno `jsdom`;
  - `setupFiles: "src/test/setup.ts"`;
  - exclusion explicita de `e2e/**`.
- Toda feature que cambie `preparacion`, `carga` o `finalizada` debe validar:
  - permisos de edicion;
  - validacion de cantidades planeadas vs reales;
  - impresion/exportacion;
  - persistencia luego de recargar.
- Todo cambio de datos maestros debe actualizar codigo y documentacion juntos:
  - paises/remitentes;
  - catalogo de productos;
  - prefijos de lote;
  - pesos y unidades por caja.
- Evitar migraciones destructivas de IndexedDB sin plan de recuperacion. Si se sube version de DB, agregar prueba o procedimiento manual de validacion.
- Para PDF, XLSX e impresion, probar un caso minimo y uno realista:
  - una paleta con un producto;
  - varias paletas;
  - lotes divididos;
  - nombres largos de producto/remitente;
  - documento finalizado.
- Antes de commitear, revisar `git diff` y separar cambios por intencion: configuracion, fixes de calidad, bugfixes funcionales y documentacion.

## Orden recomendado de trabajo

1. Arreglar configuracion de Vitest y separar unitarios de e2e.
2. Correr Prettier y revisar el diff resultante.
3. Corregir errores de lint sin desactivar reglas globalmente.
4. Corregir bloqueo de edicion en documentos finalizados.
5. Eliminar casts innecesarios como `value as never` con tipos de handlers mas precisos.
6. Actualizar `context.md`, `PRD.md` y, si aplica, crear `decision.md`.
7. Agregar pruebas de persistencia IndexedDB y de read-only en documentos finalizados.
8. Repetir checklist pre-deploy completo.

## Checklist de deploy

- [ ] `npm run lint`
- [ ] `npm run format`
- [ ] `npm test -- --run`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Verificacion manual de impresion de carteles.
- [ ] Verificacion manual de PDF.
- [ ] Verificacion manual de XLSX.
- [ ] Verificacion de persistencia local luego de recargar.
- [ ] Revision final de `git status` para evitar subir archivos temporales o cambios no relacionados.
