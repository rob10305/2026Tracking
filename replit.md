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
- 2026-02-07: Initial Replit setup
  - Switched Prisma from SQLite to PostgreSQL
  - Configured Next.js allowedDevOrigins for Replit proxy
  - Added cache control headers
  - Set up deployment configuration
