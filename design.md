# Design notes

## Herramienta de diseno

Este documento queda preparado para trabajar el diseno de pantallas y flujos. Si usamos Stitch en la etapa visual, este archivo debe ser la fuente de verdad de:

- flujos
- pantallas
- estados
- reglas UX

## Principios UX

- mostrador primero: pocas acciones, lectura rapida, foco en teclado y scanner
- tocar lo menos posible: optimizar busqueda, cobro y ajustes
- errores visibles: conflictos de stock, sin conexion y datos incompletos deben verse claro
- mobile companion: el celular acompana, pero no define el flujo principal

## Pantallas del MVP

### 1. Login simple

- una sola cuenta operativa
- acceso rapido

### 2. Dashboard

- ventas del dia
- caja actual
- alertas de stock bajo
- accesos rapidos

### 3. Punto de venta

- input principal con foco permanente
- lectura desde scanner
- busqueda manual por nombre
- carrito actual
- total
- confirmar venta
- descuento automatico de stock al confirmar
- si el codigo no existe, alta rapida en contexto

### 4. Catalogo

- listado de productos
- alta rapida
- edicion de precio, stock y categoria
- alta contextual desde codigo escaneado no registrado

### 5. Ajuste de stock

- entrada por scanner o busqueda
- sumar o restar stock
- motivo del ajuste

### 6. Caja

- apertura
- cierre
- ingresos
- egresos
- historial

### 7. Reportes

- ventas por periodo
- productos mas vendidos
- stock critico
- movimientos de caja

## Flujos clave

### Flujo de venta

1. operador abre POS
2. scanner lee codigo o se busca producto
3. si el producto existe, el sistema agrega item al carrito
4. si el producto no existe, el sistema abre alta rapida con codigo precargado
5. operador completa nombre y precio
6. el sistema guarda el producto y lo agrega al carrito
7. operador confirma medios y total
8. sistema registra venta y descuenta stock

### Flujo de alta rapida por scanner

1. operador escanea codigo no registrado
2. sistema abre alta rapida
3. deja el codigo precargado
4. operador completa nombre y precio
5. sistema guarda la ficha base del producto
6. sistema lo deja disponible para venta y stock

### Flujo de ajuste con scanner

1. operador abre ajuste rapido
2. scanner lee producto
3. sistema encuentra item
4. operador elige sumar o restar
5. sistema guarda movimiento y actualiza stock

### Flujo offline prudente

1. sistema detecta sin conexion
2. muestra modo local
3. permite registrar operaciones locales
4. marca cola de sincronizacion pendiente
5. al volver internet, sincroniza y reporta resultado

## Estados criticos

- sin conexion
- sincronizando
- conflicto de stock
- codigo no encontrado
- producto manual sin completar
- venta guardada localmente

## Reglas UI para scanner USB

- el campo de captura debe poder mantener foco
- enter final del scanner debe disparar busqueda o agregado
- si el codigo no existe, abrir alta rapida o sugerir ajuste manual
- el alta rapida debe pedir pocos campos para no frenar la atencion
- despues de guardar, el foco debe volver al input principal

## Criterio responsive

- desktop como experiencia principal
- mobile para consultas, ajustes simples y metricas
- no duplicar complejidad de escritorio en pantallas chicas durante el MVP
