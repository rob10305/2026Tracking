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
  api/db/        - Database API routes (state, products, settings, forecasts, etc.)
  api/forecasts/ - Legacy REST API (unused)
  forecast/      - Forecast detail page
  forecasts/     - Forecast list and creation pages
  cfo/           - CFO View (executive financial dashboard)
  settings/      - Settings page (password-protected)
  settings/gtm/  - GTM Readiness (go-to-market workback analysis)
  summary/       - Summary/dashboard page
  workback/      - Product Launch Readiness page
components/      - React components (forms, grids, charts, navigation)
lib/             - Core logic
  calc/          - Calculation engine (revenue, scenarios, time periods, CSV)
  models/        - TypeScript type definitions
  store/         - State management (React context, DB-backed persistence, seeding)
  db.ts          - Prisma client singleton
prisma/          - Prisma schema (PostgreSQL)
__tests__/       - Vitest test files
```

## Key Configuration
- **Port**: Frontend runs on port 5000 (0.0.0.0)
- **Database**: PostgreSQL via DATABASE_URL environment variable (dev and production are SEPARATE databases)
- **Dev Origins**: Configured to allow *.replit.dev origins
- **12 Product IDs**: prod-mcp-server, prod-ai-gateway, prod-mcp-hub, prod-ai-insights, prod-managed-plane, prod-ai-services-ps, prod-developer-portal, prod-fastshift-migration, prod-o58uo345, prod-au7eawfw, prod-flrp41e5, prod-ncbjy80t

## Recent Changes
- 2026-02-26: Launch Readiness dependency tracking
  - Added `dependency` field to LaunchRequirement type and database schema
  - Each activity row now has a "Depends On" dropdown to select any other activity (across all pillars) as a dependency
  - Items with downstream dependants show an amber "BLOCKER" badge next to their name
  - Dependency data persists to database alongside other launch requirement fields
- 2026-02-25: GTM Readiness page moved under Settings
  - Moved from /gtm to /settings/gtm (password-protected behind Settings gate)
  - Removed from main navigation bar; accessible via Settings page card
  - Forecast selector dropdown to switch between saved forecasts
  - 4 KPI cards: Total Deals Forecasted, Opportunities Required, Prospects Required, Products with Deals
  - Product GTM Workback list showing all 12 products sorted by GA date
  - Expandable product cards with: pipeline requirements table, timeline visualization, launch dependencies checklist
  - Pipeline workback: calculates opps/prospects needed per close month using sales motion data
  - Timeline: visual Gantt-style bars showing Prospecting → Pipeline → Closing phases with GA marker
  - Launch Dependencies: 5-pillar readiness checklist (Product, Marketing, Sales, Delivery, Support & Ops) with 14 standard deliverables
  - Pillar completion indicators on collapsed product rows
  - Expand All/Collapse All controls
  - Navigation: GTM Readiness removed from nav bar, now under Settings
- 2026-02-25: Dev/Production database sync
  - Production DB had diverged from dev (different product IDs, updated data, new products)
  - Synced all 12 products from production to dev (was 11, now includes Archera)
  - Product IDs updated: prod-devops-forge→prod-o58uo345, prod-devops-ps→prod-au7eawfw, prod-ams-forge→prod-flrp41e5
  - New product: prod-ncbjy80t "Archera (margins)" — S:$12K/M:$15K/L:$20K, 100% Software Resale
  - Synced 3 saved forecasts: Mike's Forecast, 2026 - All Up (Agressive), Daoud's CS Forecast
  - Updated seed.ts to match production data exactly
  - Note: Dev and production have SEPARATE databases; manual sync needed when editing products in production UI
- 2026-02-25: CFO View dashboard
  - New /cfo page with executive financial overview
  - Forecast selector dropdown to switch between saved forecasts
  - 6 KPI cards: Gross Revenue, Net Revenue, One-Time Revenue (PS), Recurring Revenue (PSS+Cloud), Total Deals, Gross Margin
  - Revenue Categories: One-Time (Professional Services), Recurring (PSS + Cloud), Software Resale
  - Monthly revenue trend (area chart), revenue by category (stacked bar), deals by month
  - Revenue category pie chart, component mix pie chart
  - Quarterly summary table (Gross Rev, Net Rev, One-Time, Recurring, Deals)
  - Product revenue ranking with % of total bars
  - Margin analysis cards (Gross, Net, One-Time, Recurring)
  - Navigation: CFO View added as first nav item
- 2026-02-25: RevOps metrics merged into Products page
  - Sales Cycle, Win Rate, Prospect to Closure, Lead Time to Close now shown under each product
  - Editable in product edit mode with "Use Industry Averages" toggle
  - Removed standalone RevOps Performance Metrics page (/settings/sales-motions)
  - Settings page now shows 3 cards: Products, Margins, Opportunity Impact Factors
- 2026-02-25: Settings password protection
  - Settings pages require password "itmethods" to access
  - Session-based unlock (persists until browser tab closed)
  - Layout-level gate covers all /settings/* routes
- 2026-02-25: Database backend migration
  - Migrated all app state from localStorage to PostgreSQL database
  - New Prisma schema: Product, SalesMotion, AppSettings, ForecastEntry, SavedForecast, SavedForecastEntry, LaunchRequirement
  - API routes: GET /api/db/state (full state), PUT /api/db/products, PUT /api/db/settings, PUT /api/db/sales-motion, PUT /api/db/forecast-entry, PUT /api/db/launch-requirements, POST /api/db/reset
  - Saved forecasts API: GET/POST/PUT/DELETE /api/db/saved-forecasts, PUT /api/db/saved-forecasts/quantity, POST /api/db/saved-forecasts/duplicate
  - Context uses optimistic updates (instant local state + background API calls)
  - Removed localStorage dependencies (persistence.ts now only has export/download utilities)
  - Database seeded via prisma/seed.ts
  - Data shared between dev and production environments
- 2026-02-25: Product Launch Readiness page
  - Replaced Workback page with Product Launch Readiness tracker
  - Each product has 14 standard deliverables (Product, Marketing, Sales, Delivery, Support categories)
  - Columns: Dependencies/Deliverables, Owner, Critical Path to $$, Timeline, Content
  - All fields inline-editable (click to edit, Enter to save, Escape to cancel)
  - Progress tracking per product (done/total) and overall completion percentage
  - Expand/Collapse All controls, per-product expand/collapse with chevron
  - LaunchRequirement type added to AppState, persisted in database
  - Default owners seeded per product (Paul, Phi, Rob, Virgil based on chart)
  - Navigation renamed from "Workback" to "Launch Readiness"
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
