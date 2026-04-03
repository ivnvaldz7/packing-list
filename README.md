# Packing List Manager

Web application for preparing and completing export packing lists for pallet-based shipments in the veterinary laboratory industry.

This project was built from a real operational workflow: first the shipment is planned, and later the warehouse operator completes the final lot and quantity information for each pallet. The app turns that manual process into a structured digital flow with validation, automatic calculations, and print-ready output.

## Overview

The application is organized around two working stages:

1. `Preparación`
   Define the shipment header, create pallets, and assign the planned products and bottle quantities for each pallet.

2. `Carga final`
   Complete the real production lots and final quantities once the pallet has been assembled.

This split reflects the actual business process and avoids forcing users to enter information they do not have yet.

## Key Features

- Two-step workflow for shipment planning and final pallet completion
- Product catalog with predefined lot prefixes, units per box, and box weights
- Automatic calculation of:
  - boxes per item
  - net weight per item
  - net and gross weight per pallet
- Validation for closed boxes only
- Validation to ensure final lot quantities match planned quantities
- Duplicate pallet flow for repeated pallet structures
- Print-friendly A4 layout
- PDF export
- Light and dark mode
- Responsive interface optimized for operational use

## Business Logic Highlights

- `lot prefix` is fixed by product
- `production number` is editable
- `pallet tare weight` is fixed
- `weight per box` comes from the catalog and is not editable
- bottle quantities must match full box counts
- in final loading, split lots must add up to the originally planned quantity

## Tech Stack

- React 18
- TypeScript
- Vite
- jsPDF
- jspdf-autotable

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This project can be deployed easily on Netlify.

Recommended settings:

- Base directory: leave empty
- Build command: `npm run build`
- Publish directory: `dist`

## Use Case

The main goal of this project is not just to display tables, but to digitize a real logistics document workflow:

- reduce manual transcription errors
- improve control over pallet composition
- validate real shipment data before printing
- generate a cleaner, more professional packing list document

## Repository Goal

This repository is intended as a portfolio-ready example of:

- workflow-driven product design
- operational UI design
- business-rule validation
- document-oriented frontend development

