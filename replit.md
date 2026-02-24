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
- 2026-02-24: Variant-level forecast builder
  - Expandable product rows in forecast builder showing S/M/L variant sub-rows
  - Each variant has individual quantity inputs per month
  - Top-line product row shows aggregated total across all variants (read-only)
  - Revenue calculations use per-variant pricing (different prices/component splits per variant)
  - Added variantForecastKey() to types.ts for variant-specific quantity storage
  - Added setVariantQty() to saved-forecasts-context for variant-aware quantity setting
  - Pipeline data aggregates variant quantities for deals/opps/prospects calculations
  - MCP Hub S variant shows N/A (non-inputtable), variant prices shown as badges
- 2026-02-24: Product schema redesign
  - Replaced gross_unit_price/default_discount_pct with gross_annual_price
  - Added fields: generally_available, platform_support_services_pct, pss_pct, user_count
  - Added variant system (has_variants, selected_variant, variants map with S/M/L VariantPricing)
  - Removed component_mix_mode (all percentages now)
  - All 8 products now have S/M/L variants
  - MCP Hub: S is N/A (no small variant), default selected_variant is "medium", GA: July (Q3)
  - AI Insights: All variants $0 (bundled with AI Gateway)
  - Developer Portal: All variants $0 (TBD pricing)
  - AI Services (PS): S=$10K, M=$25K, L=$50K (100% Prof Services)
  - Fast Shift Migration: S=$25K, M=$50K, L=$100K (100% Prof Services)
  - Revenue component mix now has 5 columns: Platform Support, Prof Services, Software Resale, Cloud Consumption, PSS
  - Updated seed data, revenue calculations, products page UI, tests, and CSV export
- 2026-02-07: Performance Tracker page
  - New /performance page with pipeline coverage, channel performance, and monthly trends
  - KPI summary cards (Annual Revenue, Deals Required, Prospects Needed, Top Channel)
  - Pipeline Coverage tab with coverage gauges and health assessment
  - Channel Performance tab with pie/bar charts, ranking table, and insights
  - Monthly Trends tab with revenue bar chart, pipeline line chart, and data table
  - Forecast selector dropdown to switch between default and saved forecasts
  - Added to main navigation
- 2026-02-07: Partner Referral pipeline channel
  - Added partner_referral to PipelineContribution type (5 channels total)
  - Migration guard for existing saved states
- 2026-02-07: Product status and readiness tracking
  - ProductStatus (live/in_development) and ProductReadiness types
  - Status badges on product cards, toggle in edit mode
  - Conditional readiness checklist for In Development products
  - Migration guard defaults existing products to "live"
- 2026-02-07: Label updates
  - Sales Motions → RevOps Performance Metrics
  - Product list moved to Manual Overrides section
  - Prospect to Opp → Prospect to Closure
- 2026-02-07: Interactive forecast builder UI redesign
  - Grid layout: months across top, products down left column, stepper +/- controls in each cell
  - KPI summary cards at top (Revenue, Units, Gross Profit, Blended Margin)
  - Tabbed analysis navigation (Revenue, Components, Profit & Margin, Pipeline, Channels)
  - Recharts bar charts for monthly revenue and pie charts for component/channel breakdowns
  - Modern card grid on forecast list page with mini sparklines and KPI stats
  - Gradient hero section for creating new forecasts
  - Dropdown action menus (rename, duplicate, delete)
  - lucide-react icons throughout
  - Pipeline Summary by Month table in Pipeline tab
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
