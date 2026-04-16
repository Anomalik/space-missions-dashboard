# Space Missions Dashboard

Interactive dashboard for visualizing and analyzing historical space mission data from 1957 to 2022. Built with a Python/FastAPI backend and a React/TypeScript frontend.

**Live Demo:** [space-missions-dashboard-4kd1-rll9bwkm3.vercel.app](https://space-missions-dashboard-4kd1-rll9bwkm3.vercel.app/)

**Repository:** [github.com/Anomalik/space-missions-dashboard](https://github.com/Anomalik/space-missions-dashboard)

## Tech Stack

- **Backend:** Python 3.13, FastAPI, Pandas
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts
- **UI Components:** shadcn/ui
- **Deployment:** Vercel (frontend), Render (backend API)

## Features

- **5 interactive visualizations:** missions over time (area chart), mission status breakdown (donut), top companies (bar chart), launches by decade with country composition (stacked bar), and success rate by company
- **Cross-filtering:** company selector with search, mission status multi-select, date range picker with decade presets. All filters affect every chart, card, and table simultaneously
- **Data table:** sortable on all columns, full-text search with debounced input, paginated (15/25/50/100 rows)
- **Summary statistics:** total missions, overall success rate, active rocket count, and top company KPIs
- **Fleet status cards:** mission outcome distribution with percentages and progress bars
- **Dark/light themes** with consistent color language across all components
- **Live backend health indicator** (pings `/api/health` every 30 seconds)

## Project Structure

```
space-missions-dashboard/
├── space_missions.py           # 8 required analysis functions
├── space_missions.csv          # Dataset (4,630 missions)
├── test_space_missions.py      # 89 tests (data-independent)
├── backend/
│   └── main.py                 # FastAPI REST API (12 endpoints)
├── frontend/
│   └── src/
│       ├── components/         # Charts, cards, filters, table, layout
│       ├── hooks/              # Data fetching, filter state management
│       ├── lib/                # API client, utilities
│       └── types/              # TypeScript interfaces
├── vercel.json                 # Frontend deployment config
└── render.yaml                 # Backend deployment config
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
pip install -r requirements.txt
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and expects the API at `http://localhost:8000` by default. Set `VITE_API_URL` in `frontend/.env` to override.

### Tests

```bash
pytest test_space_missions.py -v
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/missions` | Paginated missions with filtering and sorting |
| `GET /api/summary` | Summary statistics (filtered) |
| `GET /api/charts/missions-over-time` | Missions per year |
| `GET /api/charts/success-over-time` | Success rate per year |
| `GET /api/charts/top-companies` | Top N companies by mission count |
| `GET /api/charts/success-by-company` | Success rate per company |
| `GET /api/charts/status-breakdown` | Mission status distribution |
| `GET /api/charts/launches-by-country` | Launches by country |
| `GET /api/charts/launches-by-decade` | Launches per decade by country |
| `GET /api/companies` | Company list (for filter dropdown) |
| `GET /api/statuses` | Status list (for filter multi-select) |

All chart and summary endpoints accept optional filter parameters: `company`, `statuses`, `start_date`, `end_date`, `search`.

## Required Functions

All 8 functions are in `space_missions.py` with exact signatures matching the spec:

```python
getMissionCountByCompany(companyName: str) -> int
getSuccessRate(companyName: str) -> float
getMissionsByDateRange(startDate: str, endDate: str) -> list
getTopCompaniesByMissionCount(n: int) -> list
getMissionStatusCount() -> dict
getMissionsByYear(year: int) -> int
getMostUsedRocket() -> str
getAverageMissionsPerYear(startYear: int, endYear: int) -> float
```

Each function includes input validation, type coercion for edge cases, and try/except wrappers returning safe defaults.
