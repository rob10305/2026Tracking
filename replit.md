# FY2026 Forecast App

## Overview
The FY2026 Forecast App is a Next.js financial forecasting application designed to empower users to create, manage, and compare various forecast scenarios. It aims to provide comprehensive financial insights, including revenue projections, pipeline analysis, and product launch readiness tracking. The application supports detailed scenario planning, GTM workback analysis, and executive financial dashboards to facilitate strategic decision-making and optimize financial performance.

## User Preferences
I prefer clear and concise summaries. For complex features, I appreciate detailed explanations. I want iterative development with regular updates. Ask before making major architectural changes or introducing new dependencies. Ensure code is well-documented and follows modern JavaScript best practices.

## System Architecture
The application is built on Next.js 15 (App Router) using a PostgreSQL database managed by Replit, accessed via Prisma ORM. Styling is handled by Tailwind CSS, and data visualizations are powered by Recharts. Handsontable is used for spreadsheet-like interfaces.

**UI/UX Decisions:**
- Modern card-grid layouts for lists with mini sparklines and KPI stats.
- Interactive forecast builder with grid layout, stepper controls, and KPI summary cards.
- Tabbed analysis navigation (Revenue, Components, Profit & Margin, Pipeline, Channels).
- Visual flowcharts for dependency mapping with status badges.
- Color-coded metrics for quick assessment (e.g., T-Minus to GA).
- Password protection for sensitive settings pages.

**Technical Implementations:**
- **Forecast Management:** Supports multiple named forecasts, including creation, renaming, duplication, and deletion.
- **Data Persistence:** All application state is stored in PostgreSQL via Prisma, replacing previous localStorage persistence.
- **Calculation Engine:** Core logic handles revenue, scenario modeling, time periods, and CSV exports.
- **Product & Variant Management:** Products support S/M/L variants with individual quantity inputs and variant-specific pricing and component splits.
- **Launch Readiness:** Tracks 5-pillar activity tables (Product, Marketing, Sales, Delivery, Support & Ops) with inline editing, dependency tracking, and progress indicators. Flash card summaries with 7 metrics: Outstanding Actions, T-Minus to GA, Next Due, Deps to Pipeline, Deps to Deals, FY Revenue, and Total Deals. Forecast selector dropdown integrates saved forecast data for revenue/deal metrics per product (variant-aware pricing).
- **GTM Readiness:** Features pipeline requirements, timeline visualizations, and launch dependencies checklists, accessible under password-protected settings.
- **CFO View:** Provides an executive dashboard with key financial KPIs, monthly revenue trends, category breakdowns, and product revenue rankings.
- **Dependency Mapping:** Interactive React Flow diagram visualizing launch dependency chains with custom node types, color-coded animated edges, minimap, legend panel, and blocker highlights. Supports all-products and single-product view modes with filters.
- **Industry Averages:** Allows configuration and application of industry average sales motion metrics.
- **State Management:** Uses React context with optimistic updates for a responsive user experience. `lib/store/context.tsx` manages all app state (products, margins, sales motions, forecast entries, launch requirements). `lib/store/saved-forecasts-context.tsx` manages named forecast models. Both load from the database on mount and persist every mutation via API calls — no localStorage anywhere.
- **API Routes:** All database operations go through `/api/db/` routes: `state` (full app state load + auto-seed), `products`, `settings`, `sales-motion`, `forecast-entry`, `launch-requirements`, `saved-forecasts` (CRUD + duplicate + lock), `reset`, `contribution`.
- **Security:** Settings pages are password-protected.

**Feature Specifications:**
- **Interactive Forecast Builder:** Allows quantity input per month, per product variant, with real-time KPI updates.
- **Analysis Tabs:** Revenue, Components, Profit & Margin, Pipeline, Channels, providing detailed breakdowns.
- **Launch Readiness Tracker:** Monitors 14 standard deliverables across 5 pillars, supporting custom activities and dependency tracking.
- **GTM Workback Analysis:** Calculates opportunities and prospects required based on sales motion data and visualizes timelines.
- **CFO Dashboard:** Displays gross/net revenue, one-time/recurring revenue, total deals, gross margin, and various financial charts.
- **Dependency Map:** Visualizes and manages launch dependencies, identifying blockers and products at risk.
- **Monthly Scorecard:** Tracks business health against a selected forecast model with 3 metric sections (Lead Generation, Pipeline, Portfolio). Shows target vs actual values with risk indicators derived from workback engine lead times. Actuals data sources to be connected later.
- **Contribution Tracker:** Individual goals tracker (April–December) for 5 contributors across CS, Sales, and Partner teams. Tracks 6 metrics: BETA Customer/PoC, Monthly Pipeline Added ($), Monthly Pipeline Added (# Opps), New Logo Pipeline ($), Reference Customers, and Multi-Year Customers. Each person has a personal edit page (`/contribution/edit/[id]`) to log their monthly actuals. Attainment % is shown when actuals are present. Goal data is sourced from the 2026 Goals spreadsheet. Stored in PostgreSQL via `ContributorActual` model.
- **Product Management:** Includes configuration for 12 core products with variant pricing, component mix, and readiness status.
- **Forecast Locking:** Forecasts can be locked/unlocked (password-protected) to prevent accidental edits. Locked forecasts show disabled inputs and a lock badge.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Prisma ORM**: Used for database access and management.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Recharts**: JavaScript charting library for data visualization.
- **Handsontable**: Spreadsheet component for interactive data input.
- **Vitest**: Testing framework.
- **lucide-react**: Icon library.
- **@xyflow/react**: React Flow library for interactive node-based diagrams (dependency map).