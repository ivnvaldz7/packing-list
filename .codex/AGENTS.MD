# Flujo de trabajo con subagentes

## Objetivo

Usar subagentes únicamente cuando aporten valor real.

El agente principal debe:

* clasificar la tarea;
* seleccionar el flujo adecuado;
* delegar objetivos concretos;
* limitar el contexto de cada subagente;
* consolidar los resultados;
* decidir si la tarea puede cerrarse.

No ejecutar todos los subagentes por defecto.

---

## Clasificación de tareas

Antes de delegar, clasificar la tarea como `small`, `medium` o `large`.

### Small

Usar cuando se cumplan la mayoría de estas condiciones:

* afecta entre uno y tres archivos;
* pertenece a un solo módulo;
* no modifica arquitectura;
* no introduce migraciones;
* no cambia contratos públicos;
* no afecta autenticación, permisos, pagos o seguridad;
* tiene una solución directa y verificable.

Flujo:

1. El agente principal inspecciona el alcance.
2. Usar `builder` para implementar.
3. Ejecutar lint, typecheck y pruebas relacionadas.
4. Usar `reviewer` solamente si existe riesgo técnico evidente.

No usar `planner` ni `tester` por defecto.

---

### Medium

Usar cuando se cumpla alguna de estas condiciones:

* afecta varios archivos dentro de un mismo módulo;
* incorpora una feature acotada;
* modifica contratos internos;
* requiere decisiones técnicas menores;
* presenta riesgo moderado de regresión;
* necesita pruebas nuevas o actualizadas.

Flujo:

1. Usar `planner` para inspeccionar el alcance y producir un plan breve.
2. Esperar el resultado del planner.
3. Usar `builder` para implementar únicamente el plan aprobado.
4. Ejecutar las pruebas relacionadas.
5. Usar `reviewer` para revisar el diff y los criterios de aceptación.
6. Usar `tester` solamente si:

   * faltan pruebas;
   * existe lógica crítica;
   * el reviewer detecta cobertura insuficiente;
   * los criterios de aceptación requieren casos límite específicos.

---

### Large

Usar cuando se cumpla alguna de estas condiciones:

* afecta varios módulos;
* modifica arquitectura;
* introduce migraciones o cambios de base de datos;
* cambia contratos públicos o APIs;
* afecta autenticación, autorización, permisos, pagos o seguridad;
* tiene alto riesgo de regresión;
* requiere decisiones técnicas importantes;
* necesita una implementación dividida en varias tareas.

Flujo:

1. Usar `planner` para analizar el repositorio y crear un plan detallado.
2. Dividir la implementación en tareas pequeñas y verificables.
3. Esperar el resultado del planner.
4. Usar `builder` para implementar una tarea por vez.
5. Usar `tester` para validar criterios de aceptación, regresiones y casos límite.
6. Usar `reviewer` para revisar:

   * el diff;
   * los contratos modificados;
   * las pruebas;
   * los criterios de aceptación.
7. Resolver todos los hallazgos bloqueantes.
8. Repetir testing y revisión cuando existan correcciones importantes.
9. El agente principal consolida los resultados y determina el cierre.

---

## Política de contexto

Cada subagente debe recibir únicamente el contexto necesario para su tarea.

La delegación debe incluir:

* objetivo concreto;
* alcance permitido;
* archivos o módulos relevantes;
* criterios de aceptación;
* restricciones;
* formato esperado de respuesta.

No pasar el historial completo de la conversación salvo que sea indispensable.

No pedir a cada agente que vuelva a explorar todo el repositorio.

No copiar archivos completos en los handoffs.

Usar referencias a rutas, símbolos, tareas y decisiones concretas.

Cuando exista un plan previo, `builder`, `tester` y `reviewer` deben trabajar sobre ese plan en lugar de reconstruirlo.

---

## Planner

Usar `planner` cuando la solución no sea directa o exista riesgo técnico.

Responsabilidades:

* inspeccionar el código existente;
* identificar archivos y módulos afectados;
* detectar dependencias y restricciones;
* proponer un plan ordenado;
* definir criterios de aceptación;
* identificar riesgos;
* dividir tareas grandes en unidades pequeñas.

Restricciones:

* no modificar archivos;
* no implementar código;
* no ampliar el alcance;
* no realizar una auditoría general innecesaria;
* no copiar grandes bloques de código.

La salida debe ser breve y accionable.

Formato esperado:

1. Contexto encontrado.
2. Alcance.
3. Plan.
4. Archivos involucrados.
5. Criterios de aceptación.
6. Pruebas necesarias.
7. Riesgos y dudas abiertas.

---

## Builder

Usar `builder` para implementar un plan o una tarea concreta.

Responsabilidades:

* validar el plan contra el repositorio;
* implementar únicamente el alcance delegado;
* respetar arquitectura y convenciones existentes;
* evitar dependencias nuevas innecesarias;
* actualizar pruebas directamente relacionadas cuando corresponda;
* ejecutar las validaciones disponibles;
* informar desviaciones o bloqueos.

Restricciones:

* no rediseñar la arquitectura sin autorización;
* no ampliar el alcance;
* no corregir problemas ajenos a la tarea;
* no ocultar pruebas fallidas;
* no marcar como terminado algo no validado.

Formato esperado:

1. Archivos modificados.
2. Cambios realizados.
3. Decisiones o desviaciones.
4. Comandos ejecutados.
5. Pruebas pasadas y fallidas.
6. Problemas pendientes.

---

## Tester

Usar `tester` cuando se necesite validar comportamiento, cobertura o regresiones.

Responsabilidades:

* revisar los criterios de aceptación;
* identificar casos normales, límites y errores;
* crear o actualizar pruebas;
* ejecutar las pruebas relevantes;
* verificar regresiones;
* comprobar que las pruebas detecten el comportamiento incorrecto.

Restricciones:

* no modificar código productivo;
* no redefinir los requisitos;
* no realizar una auditoría general del repositorio;
* trabajar prioritariamente sobre los archivos modificados y sus dependencias directas.

Formato esperado:

1. Casos cubiertos.
2. Pruebas creadas o modificadas.
3. Resultados.
4. Fallos encontrados.
5. Cobertura pendiente.
6. Veredicto.

---

## Reviewer

Usar `reviewer` para realizar una revisión independiente.

Debe revisar prioritariamente:

1. criterios de aceptación;
2. `git diff`;
3. archivos modificados;
4. contratos afectados;
5. pruebas relacionadas;
6. manejo de errores;
7. seguridad y regresiones.

Restricciones:

* no modificar archivos;
* no repetir el resumen de implementación;
* no auditar todo el repositorio salvo que el cambio lo requiera;
* no reportar preferencias personales como defectos;
* no bloquear por cuestiones exclusivamente estilísticas ya cubiertas por herramientas automáticas.

Clasificación de hallazgos:

* `Bloqueante`: puede causar fallos, corrupción, vulnerabilidades o incumplimiento funcional.
* `Importante`: genera riesgo real de regresión, mantenimiento o comportamiento incorrecto.
* `Menor`: mejora válida, pero no impide cerrar la tarea.

Para cada hallazgo indicar:

* severidad;
* archivo y ubicación;
* problema concreto;
* consecuencia;
* corrección recomendada.

El reviewer debe terminar con uno de estos veredictos:

* `Aprobado`
* `Aprobado con observaciones`
* `Requiere correcciones`

---

## Paralelización

Usar agentes en paralelo únicamente cuando las tareas sean independientes.

Ejemplos válidos:

* revisar seguridad y cobertura de pruebas por separado;
* explorar módulos sin dependencias entre ellos;
* investigar alternativas técnicas independientes.

No paralelizar:

* planificación e implementación;
* implementación y revisión del mismo cambio;
* tareas que modifiquen los mismos archivos;
* etapas que dependan del resultado anterior.

---

## Criterios de cierre

Una tarea puede cerrarse solamente cuando:

* se cumplieron los criterios de aceptación;
* no existen hallazgos bloqueantes;
* lint y typecheck pasan, si están disponibles;
* las pruebas relacionadas pasan;
* los fallos no relacionados están documentados;
* el alcance implementado coincide con el aprobado;
* el agente principal consolidó los resultados.

No exigir ausencia total de observaciones menores para cerrar una tarea.

---

## Regla de eficiencia

Elegir siempre el flujo más pequeño que permita validar correctamente el cambio.

Prioridad:

1. resolver correctamente;
2. limitar el contexto;
3. evitar trabajo duplicado;
4. reducir llamadas innecesarias a subagentes;
5. mantener una revisión independiente en cambios de riesgo.

Más agentes no implica automáticamente mayor calidad.
