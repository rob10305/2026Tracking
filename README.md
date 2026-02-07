# FY2026 Sales Forecast App

A spreadsheet-like bottoms-up sales forecast tool built with Next.js, TypeScript, and Handsontable. Optimized for fast data entry (copy/paste from Excel), CSV export, and simple deployment.

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
```

To build and run in production:

```bash
npm run build
npm start
```

## Pages

| Route | Description |
|-------|-------------|
| `/forecast` | Spreadsheet grid — enter unit quantities by SKU × month. Side panel shows revenue/GP breakdowns. |
| `/settings` | Product CRUD, margin configs, sales motion params. Import/export controls. |
| `/workback` | Auto-generated workback plan: deals → opps → prospects with timeline. |
| `/summary` | Monthly and product-level financial summaries with KPI cards. |

## How to Use Copy/Paste

The forecast grid uses **Handsontable**, which supports native clipboard operations:

- **Paste a row from Excel/Sheets**: Copy 12 cells (Jan–Dec) from a spreadsheet, click the first month cell in the grid, press `Ctrl+V`.
- **Paste multi-row blocks**: Copy a block of rows × columns, select the top-left target cell, `Ctrl+V`.
- **Copy from grid**: Select cells, `Ctrl+C`, paste into Excel/Sheets.
- **Fill down**: Use the drag handle (small square at bottom-right of selection) to fill values.
- **Undo/Redo**: `Ctrl+Z` / `Ctrl+Y` within the grid.

## Import / Export

### JSON (Full State)
- **Export**: Settings page → "Export JSON" downloads the entire app state (products, margins, sales config, forecast data).
- **Import**: Settings page → "Import JSON" restores from a previously exported file.

### CSV
Three CSV exports available from the Settings page:
1. **Forecast Quantities** — SKU × Month grid with totals
2. **Financial Summary** — Monthly gross/net revenue, GP$, margin%
3. **Workback Plan** — Product, close month, deals/opps/prospects needed, pipeline dates

All CSVs use clean headers and are immediately usable in Excel.

## Calculation Rules

### Revenue
- `gross_revenue = quantity × gross_unit_price`
- `net_unit_price = gross_unit_price × (1 - discount_pct/100)`
- `net_revenue = quantity × net_unit_price`

### Component Split
Each product's revenue is split into four components (must sum to 100%):
- Professional Services, Software Resale, Cloud Consumption, EPSS
- `component_revenue = total_revenue × component_pct / 100`

### Gross Profit
- `component_gp = component_revenue × component_margin_pct / 100`
- `total_gp = sum(all component GPs)`
- `margin_pct = total_gp / revenue × 100`

### Workback Plan
For each product/month with quantity > 0:
- `opps_needed = ceil(deals / (win_rate_pct / 100))`
- `pipeline_month = close_month - sales_cycle_months - buffer_months`
- `prospects_needed = ceil(opps_needed / (prospect_to_opp_pct / 100))`
- `prospecting_start = pipeline_month - prospecting_lead_time_months`

Dates before Jan 2026 are displayed as informational (e.g., "Nov 2025 (pre-FY)").

## Assumptions & Defaults

- Fiscal year is **calendar year 2026** (Jan–Dec).
- All quantities are **integer units** (rounded on input).
- Revenue component mix **must sum to 100%** — enforced in the Settings UI.
- Margins are based on **2025 historic data** — applied uniformly across all months.
- Workback rounding: `ceil()` is used for opps and prospects (conservative).
- Three seed products are included with realistic defaults. Use "Reset to Seed Data" to restore.

## Persistence

- State auto-saves to **localStorage** on every change.
- Use JSON import/export for backup and transfer between browsers.
- "Reset to Seed Data" button clears saved state and restores defaults.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript strict
- **Tailwind CSS** for styling
- **Handsontable Community** for spreadsheet grid
- **Vitest** for unit tests
- **localStorage** for persistence

## Project Structure

```
app/
  layout.tsx          # Root layout with nav + StoreProvider
  page.tsx            # Redirects to /forecast
  forecast/page.tsx   # Forecast grid page
  settings/page.tsx   # Product CRUD + import/export
  workback/page.tsx   # Workback plan table
  summary/page.tsx    # Financial summary dashboards
lib/
  models/types.ts     # TypeScript interfaces + month constants
  calc/revenue.ts     # Revenue, component split, GP calculations
  calc/workback.ts    # Workback plan calculations + month offset
  calc/csv.ts         # CSV export generators
  calc/index.ts       # Barrel export
  store/seed.ts       # Seed data (3 products)
  store/context.tsx   # React context + state management
  store/persistence.ts # localStorage + file I/O helpers
components/
  Navigation.tsx      # Top nav bar
  ForecastGrid.tsx    # Handsontable wrapper
  SidePanel.tsx       # Revenue/GP breakdown panel
__tests__/
  revenue.test.ts     # Revenue + margin calc tests
  workback.test.ts    # Workback + month offset tests
  csv.test.ts         # CSV export tests
```

## Running Tests

```bash
npm test           # Run once
npm run test:watch # Watch mode
```
