# Contexto del proyecto

## Estado actual

- cliente: Laboratorios Ale-Bet SRL (Argentina)
- exporta productos veterinarios a 5 países: Panamá, Colombia, Paraguay, Bolivia, Ecuador
- proyecto de packing lists para exportaciones con cartelería automática
- fase de desarrollo activa

## Datos del negocio

### Destinatario fijo (en todos los carteles)
- LABORATORIOS ALE-BET SRL
- CONDARCO 3073, CIUDAD DE BUENOS AIRES, ARGENTINA

### Remitentes por país (ya configurados)
| País | Remitente | Dirección |
|------|-----------|------------|
| PANAMA | IMPORTACIONES UNIVERSO ZONA LIBRE S.A | FREE ZONE, COLON - PANAMA |
| COLOMBIA | LABORATORIOS AUROFARMA SAS | KM 13 VIA OCCIDENTE FUNZA BODEGAS ITALCOL, CUNDINAMARCA-COLOMBIA |
| PARAGUAY | AGRO VETERINARIA TOTAL SRL | LUIS ALBERTO HERRERA 477, ASUNCION-PARAGUAY |
| BOLIVIA | VETERQUIMICA BOLIVIANA SRL | AVENIDA PIRAY 493, SANTA CRUZ DE LA SIERRA - BOLIVIA |
| ECUADOR | QUIMICA SUIZA INDUSTRIAL DEL ECUADOR | AV. GALO PLAZA LASSO 10640 Y MANUEL ZAMBRANO, QUITO-ECUADOR |

## Features implementadas

### Carteles para pallets de exportación
- Nueva sección "Carteles" al inicio del workflow
- Selector de cantidad de carteles (n/X)
- Preview en formato A4 landscape
- Impresión separada del packing list
- Usa datos del país seleccionado en Preparación

### Packing list completo
- Header con país, factura, tipo de transporte
- Múltiples pallets con items
- Productos con código, nombre, lote, producción
- Workflow: Carteles → Preparación → Carga → Finalizada
- Impresión profesional del documento completo
- Persistencia local con IndexedDB

## Stack técnico

- React + TypeScript + Vite
- IndexedDB para persistencia local
- CSS con variables para theming (light/dark)
- Estructura de componentes limpia

## Estado del repositorio

- Git inicializado
- Documentación SDD: context.md, PRD.md, design.md, decision.md

## Objetivos del proyecto

1. Automatizar generación de carteles para pallets de exportación
2. Mantener registro de packing lists por shipment
3. Persistencia local para trabajar offline
4. Interfaz clara para operarios de depósito

## Principios de trabajo

- simplicidad operativa sobre complejidad técnica
- documentación actualizada del proyecto real
- workflow lineal: carteles → preparación → carga → finalized