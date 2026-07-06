# PRD - Sistema de Packing Lists para Laboratorios Ale-Bet

## 1. Resumen

Sistema web para gestionar packing lists de exportación de productos veterinarios a 6 países de Latinoamérica, incluyendo generación automática de carteles para pallets.

## 2. Problema

El proceso actual de generación de carteles y packing lists es manual, propenso a errores de tipeo, y consume tiempo en tareas repetitivas como:
- Escribir datos de remitente por cada cartel
- Mantener numeración de pallets (01/03, 02/03, etc.)
- Generar documentos de transporte

## 3. Objetivo de negocio

- Eliminar errores en datos de carteles y packing lists
- Reducir tiempo de preparación de envíos
- Mantener historial de exportaciones por país
- Interfaz simple para operarios de depósito

## 4. Usuarios

### Operador de depósito
- Persona que prepara los envíos
- Define países, cantidades de pallets, y contenido
- Necesita workflow claro y rápido

## 5. Alcance MVP

### Gestión de países
- 6 presets de país preconfigurados: Panamá, Colombia, Paraguay (2 presets), Bolivia, Ecuador
- Datos de remitente autocompletados según selección

### Carteles para pallets
- Selector de cantidad de carteles (n/X)
- Preview en formato A4 landscape
- Impresión independiente (solo carteles)
- Datos: título, remitente, destinatario, fecha, numeración

### Packing list
- Header: país, número de factura, tipo de transporte
- Múltiples pallets con items
- Items: producto, lote, producción, cantidad, peso
- Totales: peso neto, peso bruto, cantidad de cajas

### Workflow de documentos
1. **Carteles** - Generar carteles antes de cargar
2. **Preparación** - Definir estructura del documento y pallets
3. **Carga** - Completar lotes y cantidades reales
4. **Finalizada** - Documento cerrado para impresión

### Exportación
- Exportación a XLSX implementada como utilidad adicional

### Persistencia
- IndexedDB para guardar documentos localmente
- Historial de documentos guardados
- Estados: preparacion, carga, finalizada

## 6. Fuera de alcance por ahora

- Múltiples usuarios y permisos
- Integración con sistemas de transporte
- Facturación electrónica

## 7. Requisitos no funcionales

- Interfaz simple y rápida
- Persistencia local robusta
- Impresión profesional de documentos
- Responsive para tablets

## 8. Datos de cada país

### Destinatario fijo (todos los envíos)
LABORATORIOS ALE-BET SRL
CONDARCO 3073, CIUDAD DE BUENOS AIRES, ARGENTINA

### Remitentes por país
| Código | Nombre | Dirección |
|--------|--------|-----------|
| PANAMA | IMPORTACIONES UNIVERSO ZONA LIBRE S.A | FREE ZONE, COLON - PANAMA |
| COLOMBIA | LABORATORIOS AUROFARMA SAS | KM 13 VIA OCCIDENTE FUNZA BODEGAS ITALCOL, CUNDINAMARCA-COLOMBIA |
| PARAGUAY | AGRO VETERINARIA TOTAL SRL | LUIS ALBERTO HERRERA 477, ASUNCION-PARAGUAY |
| PARAGUAY_GENETYX | GENETYX | BERNARDINO CABALLERO 1515, MARIANO ROQUE ALONSO-PARAGUAY |
| BOLIVIA | VETERQUIMICA BOLIVIANA SRL | AVENIDA PIRAY 493, SANTA CRUZ DE LA SIERRA - BOLIVIA |
| ECUADOR | QUIMICA SUIZA INDUSTRIAL DEL ECUADOR | AV. GALO PLAZA LASSO 10640 Y MANUEL ZAMBRANO, QUITO-ECUADOR |

## 9. Formato de carteles

```
MERCADERÍA DE EXPORTACIÓN

[REMITENTE DEL PAÍS SELECCIONADO]
[DIRECCIÓN DEL REMITENTE]

———————————————————————————

LABORATORIOS ALE-BET SRL
CONDARCO 3073 CIUDAD DE BUENOS AIRES, ARGENTINA

[DD/MM/AAAA]    [01/03]
```

## 10. Riesgos

- Uso intensivo desde una sola PC
- Sin backups remotos (solo IndexedDB local)

## 11. Fases

### Fase 1 - MVP operativo
- Carteles con selector de cantidad
- Packing list completo
- Workflow de 4 etapas
- Persistencia local

### Fase 2 - Mejoras
- Exportación a PDF
- Más países si se agregan rutas
- Mejoras de UI

### Fase 3 - Expansión
- Múltiples usuarios
- Reporting
- Integraciones