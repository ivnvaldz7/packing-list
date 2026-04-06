# Decision log

## D001 - Arranque como PWA

### Estado

Aceptada

### Motivo

Permite salir mas rapido, operar en PC y celular, y evitar el costo inicial de apps nativas o instalacion local compleja.

### Consecuencia

- priorizar arquitectura web
- preparar instalacion como app
- mantener abierta la opcion de version local mas adelante

## D002 - Offline prudente, no offline total

### Estado

Aceptada

### Motivo

El offline total con varios dispositivos agrega mucho riesgo. El objetivo es tolerar cortes y seguir operando sin vender una promesa dificil de mantener.

### Consecuencia

- usar IndexedDB local
- sincronizacion diferida
- estados de conexion visibles
- evitar multi dispositivo offline en MVP

## D003 - Un solo usuario en la primera etapa

### Estado

Aceptada

### Motivo

Reduce complejidad y acelera salida a produccion.

### Consecuencia

- no se implementan roles ni permisos en MVP
- dejar espacio para auditoria futura

## D004 - Scanner USB como entrada principal de POS y stock

### Estado

Aceptada

### Motivo

Ya existe hardware en el local y el flujo de lectura por scanner es central para venta y ajustes.

### Consecuencia

- asumir comportamiento de teclado
- optimizar foco y captura de input
- reutilizar scanner tanto en cobro como en stock

## D005 - Arquitectura recomendada

### Estado

Propuesta

### Motivo

Hace falta balancear velocidad de desarrollo, costo mensual y crecimiento futuro.

### Decision propuesta

- frontend: React + TypeScript + Vite PWA
- almacenamiento local: IndexedDB
- backend: Supabase o stack equivalente con Postgres
- autenticacion: simple, un solo usuario inicialmente
- hosting: Vercel o Netlify para frontend
- base de datos y sync: backend administrado

### Consecuencia

- salida rapida para MVP
- costo mensual controlado
- camino razonable para reportes, sync y crecimiento

## D006 - Modelo comercial con setup + mensual

### Estado

Propuesta

### Motivo

Solo un fee mensual puede dejar afuera esfuerzo real de relevamiento, migracion y puesta en marcha.

### Consecuencia

- setup inicial separado
- fee mensual por soporte, hosting y mejoras menores

## D007 - Catalogo incremental desde el scanner

### Estado

Aceptada

### Motivo

El comercio necesita operar sin cargar todo el catalogo por adelantado. El sistema debe aprender productos mientras se usa.

### Consecuencia

- si el scanner lee un codigo inexistente, abrir alta rapida
- pedir al menos nombre y precio
- guardar el producto en la base para futuras ventas
- permitir que el mismo codigo se reutilice en stock y POS
