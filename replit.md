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
- 2026-02-07: Interactive forecast builder UI redesign
  - Replaced spreadsheet grid with interactive product cards (stepper +/- controls)
  - KPI summary cards at top (Revenue, Units, Gross Profit, Blended Margin)
  - Tabbed analysis navigation (Revenue, Components, Profit & Margin, Pipeline, Channels)
  - Recharts bar charts for monthly revenue and pie charts for component/channel breakdowns
  - Modern card grid on forecast list page with mini sparklines and KPI stats
  - Gradient hero section for creating new forecasts
  - Dropdown action menus (rename, duplicate, delete)
  - lucide-react icons throughout
  - Pipeline Summary by Month table restored in Pipeline tab
- 2026-02-07: Build Forecast feature (multiple named forecasts)
  - SavedForecast type with id, name, timestamps, quantities map
  - Separate localStorage persistence (forecast-app-saved-forecasts)
  - SavedForecastsProvider context for CRUD operations
  - /forecast list page: create, rename, duplicate, delete forecasts
  - /forecast/[id] detail page with interactive quantity input + 5 analysis tabs
  - Navigation updated to "Build Forecast"
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
