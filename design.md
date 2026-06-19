# Diseño del Sistema - Lista de Empaque (Packing List)

## Propósito y Contexto

Este sistema de Packing List offline-first está diseñado para **Laboratorios Ale-Bet SRL**. Permite al personal de depósito gestionar la preparación, validación, pesado y carga de mercadería de exportación en pallets (tarimas).

## Principios UX/UI

- **Depósito Primero**: Interfaz clara, de alto contraste, legible en ambientes industriales y adaptable a modo oscuro.
- **Validación Fuerte e Inmediata**: Los errores de carga (diferencias entre cantidades planificadas y cargadas, lotes faltantes, etc.) se muestran en tiempo real y bloquean de forma activa la finalización del documento.
- **Offline-First Absoluto**: Toda la operación se realiza y se persiste de manera local en el navegador mediante **IndexedDB**, garantizando inmunidad ante cortes de internet.
- **Precisión en Balanza**: Se calculan de forma automática los subtotales netos, pesos brutos y pesos de tarimas (tara editable) para evitar diferencias de aduana.

## Flujos Clave del Sistema

### 1. Impresión de Carteles (Etiquetas de Pallets)
- **Objetivo**: Generar rótulos identificatorios de exportación para pegar en cada paleta física antes de iniciar la carga.
- **UX**: Formato horizontal (Landscape) A4 optimizado para lectura rápida de datos de remitente, destinatario y número de paleta.
- **Aislamiento de Impresión**: Mediante estilos de medios físicos `@media print` controlados con clases dinámicas (`printing-labels-only`), se aíslan los carteles para evitar la impresión mezclada con el manifiesto.

### 2. Etapa de Preparación
- **Objetivo**: Configurar los productos planeados para cada paleta y especificar las cantidades estimadas de frascos.
- **Cálculo Automático**: A partir de la base de datos de productos (Frascos por caja, peso unitario, peso por caja), el sistema calcula el peso estimado.
- **Validación**: Comprobación de que cada fila tiene un producto seleccionado y cantidades válidas.

### 3. Etapa de Carga Final
- **Objetivo**: Registrar los números de lote reales asignados a cada paleta física en el camión y validar las cantidades reales.
- **Copiado Inteligente**: Permite duplicar estructuras de paletas completas para agilizar cargas repetitivas.
- **Decoupling de Split Lines**: Al asignar un producto a una nueva línea de pallet (incluso derivada de un split), se genera un identificador único `planId` para evitar errores de validación persistentes.
- **Control de Frascos**: Permite re-evaluar cajas y unidades reales, recalculando el peso bruto real de la paleta sumando el peso de tara ingresado.

## Pantallas y Secciones Principales

### 1. Barra Lateral (Sidebar)
- Selección y navegación rápida entre etapas de carga.
- Estado del flujo de trabajo (`workflowStatus`: 'preparacion', 'carga', 'finalizada').
- Control de bloqueo dinámico: Botón "Finalizar lista" deshabilitado si existen errores en el documento.

### 2. Encabezado del Manifiesto
- Información obligatoria de exportación: Nombre del laboratorio, factura N°, país de destino (requiere selección activa forzada con placeholder vacío), dirección y tipo de transporte.

### 3. Tarjetas de Pallet (`PalletCard`)
- Edición interactiva de nombre interno de la paleta y peso de tara de tarima.
- Tabla reactiva de items de acuerdo a la etapa actual (Preparación: Producto y Frascos / Cajas; Carga final: Producto, Prefijo lote, N° lote editable, Frascos cargados y Cajas autocalculadas).
- Resumen de pesos de la paleta (Neto, Bruto, Tara).

### 4. Generación de PDF
- Layout A4 Portrait de alta definición con un ancho de tabla exactamente reescalado a **182mm** (ajustado a márgenes de 14mm izquierdo/derecho) para evitar desbordes en papel y asegurar la perfecta legibilidad del manifiesto comercial de exportación.

## Persistencia y Almacenamiento

- **Base de datos**: IndexedDB local.
- **Manejo de Migraciones**: Proceso robusto de actualización de esquemas. Al iniciar, el sistema lee los borradores del esquema legacy en memoria, destruye la base vieja e inicializa la nueva versión de forma sincrónica durante el hook `onupgradeneeded`, previniendo errores de concurrencia y bloqueos en caliente.
