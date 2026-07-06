# Decisiones de Arquitectura

## D001 — Exclusión de tests de `tsconfig.json`

**Fecha**: 2026-07-06
**Contexto**: Al agregar Vitest al proyecto, los archivos `*.test.*` aparecían en la compilación de TypeScript (`tsc -b`), lo que causaba errores de tipo porque los tests usan tipos y APIs de Vitest que no forman parte del proyecto principal.

**Decisión**: Se excluyeron los archivos de test del `tsconfig.json` principal:

```json
{
  "exclude": ["node_modules", "src/**/*.test.*"]
}
```

**Alternativa considerada**: Configurar `tsconfig.json` con `references` para separar la compilación de tests y app. Se descartó por complejidad innecesaria dado que Vitest maneja su propia transpilación con `esbuild` y no requiere que TypeScript compile los archivos de test.

**Consecuencias**:
- El comando `tsc --noEmit` solo verifica el código de producción.
- Los tests se verifican exclusivamente con `vitest run`, que transpila cada archivo con `esbuild` antes de ejecutarlo.
- El build de producción (`tsc -b` o `vite build`) ignora los archivos de test, lo que evita falsos positivos.

---

## D002 — `CountryPresetValue` vs `ShipmentCountry`

**Fecha**: 2026-07-06
**Contexto**: Paraguay tiene dos destinatarios diferentes: `AGRO VETERINARIA TOTAL SRL` y `GENETYX`. Ambos operan en Paraguay pero son entidades distintas con direcciones diferentes. El tipo `ShipmentCountry` solo contempla los países (`'PANAMA' | 'COLOMBIA' | 'PARAGUAY' | 'BOLIVIA' | 'ECUADOR'`) mientras que `CountryPresetValue` es un superconjunto que permite presets adicionales.

**Decisión**: `PARAGUAY_GENETYX` existe como valor en `CountryPresetValue` pero no en `ShipmentCountry`. Se creó un tipo separado:

```typescript
export type CountryPresetValue = ShipmentCountry | 'PARAGUAY_GENETYX';
```

Esto permite:
- **UI**: El selector de país principal (`ShipmentCountry`) solo muestra los 5 países destino. PARAGUAY_GENETYX se selecciona mediante otro mecanismo (búsqueda por datos de remitente).
- **Lookup**: `getCountryPreset()` y `getCountryPresetValue()` pueden resolver cualquiera de los 6 presets, incluyendo GENETYX, usando datos del documento.
- **Persistencia**: Un documento guardado con `laboratoryName: 'GENETYX'` se resuelve correctamente al preset `PARAGUAY_GENETYX` al recargar.

**Alternativa considerada**: Agregar `PARAGUAY_GENETYX` como un `ShipmentCountry` más. Se descartó porque no es un país distinto — es un preset alternativo para Paraguay. Mezclar países con presets adicionales rompería la semántica del tipo.

---

## D003 — Configuración inline de Vitest en `vite.config.ts`

**Fecha**: 2026-07-06
**Contexto**: Vitest permite configurarse en un archivo `vitest.config.ts` separado o integrado en `vite.config.ts`. Se evaluó qué enfoque usar.

**Decisión**: Se configuró Vitest directamente en `vite.config.ts` importando `defineConfig` desde `vitest/config`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**'],
  },
});
```

**Razonamiento**:
1. **DRY**: Compartir configuración de Vite (plugins, resolve aliases, CSS modules) entre build y tests sin duplicación.
2. **Vite recommendation**: Vitest recomienda explícitamente usar `vitest/config` cuando se integra en `vite.config.ts` para compatibilidad de tipos.
3. **Simplicidad**: Un archivo menos que mantener en la raíz del proyecto.

**Riesgo**: Si en el futuro la configuración de test crece significativamente (múltiples proyectos, coverage, reporters complejos), podría justificarse un archivo separado. Por ahora la configuración es mínima y se beneficia de estar integrada.
