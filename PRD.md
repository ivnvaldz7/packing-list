# PRD - Sistema de minimercado

## 1. Resumen

Este producto busca reemplazar un sistema viejo de gestion manual para un minimercado de barrio.

La primera version debe cubrir:

- ventas en mostrador
- control de stock
- ingresos y egresos
- lectura de codigo de barras con scanner USB
- carga manual de productos sin codigo
- metricas operativas y de negocio
- uso desde PC del local y, si es posible, desde celular mediante PWA

## 2. Problema

El cliente hoy depende de un software viejo y de procesos manuales para cargar movimientos, actualizar stock y cobrar. Eso genera friccion operativa, errores de stock y baja visibilidad sobre caja, ventas y rotacion.

## 3. Objetivo de negocio

- reducir tiempo de cobro y carga de movimientos
- mejorar la calidad del stock
- tener metricas utiles para tomar decisiones
- dejar una base que luego pueda crecer hacia facturacion fiscal

## 4. Usuarios

### Operador principal

Una sola cuenta operativa para la primera etapa. Aunque atienden tres personas, no se implementaran roles ni permisos en el MVP.

## 5. Alcance MVP

### Catalogo e inventario

- alta, baja y edicion de productos
- productos con codigo de barras
- productos manuales o con codigo interno
- alta rapida desde scanner si el codigo no existe
- carga de precio en el mismo flujo de alta
- stock actual por producto
- stock minimo y alertas simples
- ajustes de stock

### Ventas

- busqueda por nombre
- lectura por scanner USB
- armado de carrito
- cobro rapido
- descuento automatico de stock al confirmar venta
- ticket interno no fiscal
- agregado directo al carrito si el codigo ya existe
- alta rapida del producto si el codigo aun no existe

### Caja y movimientos

- apertura y cierre de caja
- registro de ingresos
- registro de egresos
- historial de movimientos

### Reportes y metricas

- ventas por dia, semana y mes
- productos mas vendidos
- rotacion de inventario
- stock critico
- resumen de caja
- ingresos y egresos por periodo

### Operacion desde dispositivos

- uso principal en PC del local
- acceso complementario desde celular via PWA

## 6. Fuera de alcance por ahora

- integracion fiscal AFIP/ARCA
- multiples usuarios y permisos
- multiples sucursales
- e-commerce
- integracion con balanzas
- integracion con medios de pago o POS bancario

## 7. Requisitos no funcionales

- interfaz rapida y clara para mostrador
- persistencia local para tolerar cortes breves
- sincronizacion segura cuando haya internet
- instalable como PWA
- respaldo y exportacion de datos

## 8. Requisitos de offline

El offline no debe prometer mas de lo que podamos sostener bien.

Estrategia recomendada para MVP:

- permitir consulta de catalogo, stock reciente y ventas en modo local
- persistir datos en el dispositivo con IndexedDB
- sincronizar contra backend cuando vuelva la conexion
- mostrar estado de sincronizacion y conflictos

Limite recomendado:

- offline soportado para cortes breves o intermitencia
- no vender "offline total multi dispositivo" en la primera version

## 9. Scanner de codigo de barras

El scanner USB se tratara como dispositivo tipo teclado.

Debe permitir:

- buscar producto al cobrar
- abrir pantalla de ajuste rapido de stock
- completar recepcion o reposicion de inventario
- detectar productos no registrados
- disparar el alta rapida de producto
- reutilizar el mismo codigo para futuras ventas y movimientos

## 10. Automatizaciones para productos manuales

Los productos sin codigo de barras deben soportar:

- codigo interno autogenerado
- SKU autogenerado
- categorias y unidades simples
- carga rapida desde formulario

## 10.1 Base de productos operativa

El sistema debe construir y mantener una base de productos reutilizable a partir de la operacion diaria.

Cada producto deberia guardar como minimo:

- codigo de barras o codigo interno
- nombre
- precio de venta
- categoria
- stock actual
- estado activo

Flujo esperado:

1. se escanea un codigo
2. si el producto existe, se agrega a venta o ajuste
3. si no existe, se abre alta rapida con el codigo precargado
4. se completa al menos nombre y precio
5. el producto se guarda para futuras operaciones

## 11. Migracion

El cliente tiene archivos del sistema viejo. La primera fase debe incluir analisis de esos archivos para:

- identificar formato de exportacion
- mapear productos y stock
- estimar limpieza de datos
- definir una importacion asistida

## 12. Modelo comercial

Rango objetivo conversado:

- entre USD 120 y USD 150 mensuales

Recomendacion comercial:

- cobrar setup inicial por relevamiento, migracion, configuracion y salida a produccion
- cobrar fee mensual por hosting, soporte, backups y mejoras menores

## 13. Riesgos

- datos inconsistentes del sistema viejo
- stock inicial mal migrado
- expectativa demasiado alta sobre offline
- necesidad futura de facturacion fiscal
- uso intensivo desde una sola PC con hardware viejo

## 14. Fases sugeridas

### Fase 1 - MVP operativo

- catalogo
- stock
- ventas
- caja
- reportes base
- scanner
- PWA instalable

### Fase 2 - Robustez operativa

- importacion masiva
- mejor sincronizacion offline
- auditoria
- reglas de reposicion
- compras a proveedor

### Fase 3 - Expansion

- usuarios y permisos
- integracion fiscal
- multi local
- tableros avanzados
