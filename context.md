# Contexto del proyecto

## Estado actual

- estamos en fase planning
- el cliente es un minimercado de barrio
- existe un software viejo con procesos manuales
- el objetivo es evaluar viabilidad, stack, arquitectura y modelo comercial

## Datos confirmados con el usuario

- inicio como PWA
- el cliente tiene una PC en el local
- puede necesitar uso complementario desde celular
- el scanner actual se conecta por USB
- la mayoria de productos usan codigo de barras
- tambien habra productos manuales
- el scanner debe servir para dar de alta productos nuevos
- el alta rapida debe permitir cargar precio en el mismo flujo
- el scanner debe agregar items a la cuenta para cobrarlos
- al confirmar venta, el stock debe descontarse automaticamente
- el sistema debe construir una base persistente de productos
- solo se necesita un usuario en el MVP
- las metricas son importantes
- el sistema sera solo para un local
- precio objetivo mensual: USD 120 a USD 150

## Preocupaciones del usuario

- offline da miedo si no se puede hacer bien
- quiere evitar problemas operativos
- quiere dejar abierta la opcion de una version local si el cliente la pide
- quiere sostener un hilo documental claro con PRD, contexto, diseno y decisiones

## Estado del repositorio

- proyecto existente en React + TypeScript + Vite
- existe persistencia local basica con IndexedDB
- esto sugiere una buena base para una PWA orientada a formularios y sincronizacion

## Memoria del proyecto

Engram esta instalado en la PC como:

- `C:\Users\Usuario\go\bin\engram.exe`

Uso recomendado en este proyecto:

- guardar decisiones importantes
- guardar hallazgos del relevamiento con cliente
- guardar cambios de alcance y riesgos

## Supuestos vigentes

- no hay requerimiento fiscal inmediato
- el scanner funciona como teclado
- el MVP debe privilegiar simplicidad operativa sobre complejidad tecnica
- la PC del local sera el dispositivo principal

## Preguntas abiertas

- formato real de los archivos exportados del sistema viejo
- volumen total de productos
- necesidad de ticket impreso
- frecuencia real de cortes de internet
- si habra cierre de caja por turno o solo por dia
- si habra precio mayorista o listas multiples

## Principios de trabajo

- no sobredisenar offline
- priorizar flujo de caja y venta rapida
- mantener arquitectura extensible para fiscalizacion futura
- documentar decisiones a medida que aparezcan
