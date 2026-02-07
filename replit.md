# FY2026 Forecast App

## Overview
A Next.js financial forecasting application that allows users to create, manage, and compare forecast scenarios. Built with Next.js 15, Prisma ORM, PostgreSQL, Tailwind CSS, and Recharts for data visualization.

## Project Architecture
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Replit-managed) via Prisma ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Spreadsheet**: Handsontable
- **Testing**: Vitest

## Project Structure
```
app/             - Next.js app router pages and API routes
  api/forecasts/ - REST API for forecasts, scenarios, time periods, line items
  forecast/      - Forecast detail page
  forecasts/     - Forecast list and creation pages
  settings/      - Settings page
  summary/       - Summary/dashboard page
  workback/      - Workback schedule page
components/      - React components (forms, grids, charts, navigation)
lib/             - Core logic
  calc/          - Calculation engine (revenue, scenarios, time periods, CSV)
  models/        - TypeScript type definitions
  store/         - State management (React context, persistence, seeding)
  db.ts          - Prisma client singleton
prisma/          - Prisma schema (PostgreSQL)
__tests__/       - Vitest test files
```

## Key Configuration
- **Port**: Frontend runs on port 5000 (0.0.0.0)
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Dev Origins**: Configured to allow *.replit.dev origins

## Recent Changes
- 2026-02-07: Forecast Model page redesign
  - Replaced simple forecast grid with comprehensive Forecast Model page
  - Unit Quantity grid (Handsontable) at top for entering monthly product counts
  - Auto-calculated Revenue by Product table (monthly + annual, gross/net toggle)
  - Revenue Component Breakdown table (PS, Software Resale, Cloud, EPS)
  - Gross Profit & Margin table with per-component GP and blended margin %
  - Collapsible sections for each detail table
  - Updated navigation label from "Forecast Grid" to "Forecast Model"
- 2026-02-07: Added Pipeline Contribution to Industry Averages
  - New `PipelineContribution` type with mode (pct/num) and 4 channels
  - New `pipelineContribution` field in AppState
  - Pipeline Contribution section on /settings/industry-averages with %/# toggle
  - Migration guard for existing saved states without pipelineContribution
- 2026-02-07: Added Industry Averages feature
  - New `industryAverages` field in AppState (SalesMotion type)
  - New settings page at /settings/industry-averages
  - "Use Industry Averages" toggle on Sales Motions edit view
  - Migration guard for existing saved states without industryAverages
- 2026-02-07: Removed buffer_months from SalesMotion
  - Removed from type, UI, calculations, seed data, and tests
  - Pipeline month now calculated as close_month - sales_cycle_months only
- 2026-02-07: Initial Replit setup
  - Switched Prisma from SQLite to PostgreSQL
  - Configured Next.js allowedDevOrigins for Replit proxy
  - Added cache control headers
  - Set up deployment configuration
