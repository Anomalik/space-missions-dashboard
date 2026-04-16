"""
FastAPI backend for the Space Missions Dashboard.

Serves REST endpoints for dashboard data, importing core analysis functions
from space_missions.py to avoid logic duplication.
"""

import sys
import os
import math
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path so we can import space_missions.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from space_missions import (
    _load_data,
    _parse_date,
    getMissionCountByCompany,
    getSuccessRate,
    getMissionsByDateRange,
    getTopCompaniesByMissionCount,
    getMissionStatusCount,
    getMissionsByYear,
    getMostUsedRocket,
    getAverageMissionsPerYear,
)

app = FastAPI(
    title="Space Missions Dashboard API",
    description="REST API for historical space mission data analysis",
    version="1.0.0",
)

# CORS — allow frontend origins (dev + production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",        # Vite dev server
        "http://localhost:4173",        # Vite preview
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Shared filtering helper
# ---------------------------------------------------------------------------

def _apply_filters(
    df,
    company: Optional[str] = None,
    statuses: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
):
    """
    Apply filter parameters to a DataFrame.

    Args:
        company: Company name (case-insensitive)
        statuses: Comma-separated mission statuses
        start_date: Start date string (multiple formats supported)
        end_date: End date string (multiple formats supported)
        search: Full-text search across all string columns
    """
    filtered = df.copy()

    if company:
        filtered = filtered[filtered["_company_lower"] == company.strip().lower()]

    if statuses:
        status_list = [s.strip() for s in statuses.split(",") if s.strip()]
        if status_list:
            filtered = filtered[filtered["MissionStatus"].isin(status_list)]

    if start_date:
        parsed_start = _parse_date(start_date)
        if parsed_start:
            filtered = filtered[filtered["_parsed_date"] >= parsed_start]

    if end_date:
        parsed_end = _parse_date(end_date)
        if parsed_end:
            filtered = filtered[filtered["_parsed_date"] <= parsed_end]

    if search:
        search_lower = search.strip().lower()
        if search_lower:
            string_cols = ["Company", "Location", "Rocket", "Mission", "RocketStatus", "MissionStatus"]
            mask = filtered[string_cols].apply(
                lambda col: col.str.lower().str.contains(search_lower, na=False)
            ).any(axis=1)
            filtered = filtered[mask]

    return filtered


def _public_columns(df):
    """Return DataFrame with only public columns (strip internal helper columns)."""
    public_cols = ["Company", "Location", "Date", "Time", "Rocket", "Mission",
                   "RocketStatus", "Price", "MissionStatus"]
    return df[[c for c in public_cols if c in df.columns]]


def _clean_for_json(value):
    """Clean a value for JSON serialization (handle NaN, None)."""
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value


def _df_to_records(df):
    """Convert DataFrame to list of dicts, cleaning NaN values."""
    records = _public_columns(df).to_dict(orient="records")
    return [
        {k: _clean_for_json(v) for k, v in record.items()}
        for record in records
    ]


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/missions")
def get_missions(
    company: Optional[str] = Query(None, description="Filter by company name"),
    statuses: Optional[str] = Query(None, description="Comma-separated mission statuses"),
    start_date: Optional[str] = Query(None, description="Start date (multiple formats)"),
    end_date: Optional[str] = Query(None, description="End date (multiple formats)"),
    search: Optional[str] = Query(None, description="Full-text search"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    sort_by: Optional[str] = Query(None, description="Column to sort by"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Sort order"),
):
    """Get paginated mission data with filtering and sorting."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    total = len(filtered)

    # Sorting
    if sort_by and sort_by in filtered.columns:
        ascending = sort_order == "asc"
        filtered = filtered.sort_values(sort_by, ascending=ascending, na_position="last")
    else:
        filtered = filtered.sort_values("_parsed_date", ascending=True, na_position="last")

    # Pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_data = filtered.iloc[start_idx:end_idx]

    return {
        "data": _df_to_records(page_data),
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, math.ceil(total / page_size)),
    }


@app.get("/api/summary")
def get_summary(
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Get summary statistics, optionally filtered."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    total = len(filtered)
    success_count = len(filtered[filtered["MissionStatus"] == "Success"])
    success_rate = round((success_count / total) * 100, 2) if total > 0 else 0.0

    active_rockets = int(filtered[filtered["RocketStatus"] == "Active"]["Rocket"].nunique())

    # Top company in filtered data
    if total > 0:
        top_company_series = filtered["Company"].value_counts()
        top_company = top_company_series.index[0]
        top_company_count = int(top_company_series.iloc[0])
    else:
        top_company = "N/A"
        top_company_count = 0

    return {
        "total_missions": total,
        "success_rate": success_rate,
        "active_rockets": active_rockets,
        "top_company": top_company,
        "top_company_count": top_company_count,
    }


@app.get("/api/charts/missions-over-time")
def get_missions_over_time(
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Missions per year for area chart."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    year_counts = filtered.groupby("_year").size().reset_index(name="missions")
    year_counts = year_counts.sort_values("_year")
    year_counts.columns = ["year", "missions"]

    return {
        "data": [
            {"year": int(row["year"]), "missions": int(row["missions"])}
            for _, row in year_counts.iterrows()
            if not math.isnan(row["year"])
        ]
    }


@app.get("/api/charts/success-over-time")
def get_success_over_time(
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Success rate per year for line chart."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    data = []
    for year, group in filtered.groupby("_year"):
        if math.isnan(year):
            continue
        total = len(group)
        success = len(group[group["MissionStatus"] == "Success"])
        rate = round((success / total) * 100, 2) if total > 0 else 0.0
        data.append({"year": int(year), "success_rate": rate})

    data.sort(key=lambda x: x["year"])
    return {"data": data}


@app.get("/api/charts/top-companies")
def get_top_companies(
    n: int = Query(10, ge=1, le=62),
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Top N companies by mission count for bar chart."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    counts = filtered["Company"].value_counts().head(n)
    return {
        "data": [
            {"company": company_name, "missions": int(count)}
            for company_name, count in counts.items()
        ]
    }


@app.get("/api/charts/success-by-company")
def get_success_by_company(
    n: int = Query(10, ge=1, le=62),
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Success rate per company for grouped bar chart."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    # Get top N companies by mission count first
    top_companies = filtered["Company"].value_counts().head(n).index.tolist()
    top_data = filtered[filtered["Company"].isin(top_companies)]

    data = []
    for comp in top_companies:
        comp_data = top_data[top_data["Company"] == comp]
        total = len(comp_data)
        success = len(comp_data[comp_data["MissionStatus"] == "Success"])
        rate = round((success / total) * 100, 2) if total > 0 else 0.0
        data.append({
            "company": comp,
            "success_rate": rate,
            "total_missions": total,
        })

    return {"data": data}


@app.get("/api/charts/status-breakdown")
def get_status_breakdown(
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Mission status counts for donut chart."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    counts = filtered["MissionStatus"].value_counts().to_dict()
    return {
        "data": [
            {"status": status, "count": int(count)}
            for status, count in counts.items()
        ]
    }


@app.get("/api/charts/launches-by-country")
def get_launches_by_country(
    n: int = Query(15, ge=1, le=100),
    company: Optional[str] = Query(None),
    statuses: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Launch counts by country for treemap/bar list."""
    df = _load_data()
    filtered = _apply_filters(df, company, statuses, start_date, end_date, search)

    counts = filtered["_country"].value_counts().head(n)
    return {
        "data": [
            {"country": country, "launches": int(count)}
            for country, count in counts.items()
        ]
    }


@app.get("/api/companies")
def get_companies():
    """List of all unique company names (for filter dropdown)."""
    df = _load_data()
    companies = sorted(df["Company"].unique().tolist())
    return {"data": companies}


@app.get("/api/statuses")
def get_statuses():
    """List of all unique mission statuses (for filter multi-select)."""
    df = _load_data()
    statuses = sorted(df["MissionStatus"].unique().tolist())
    return {"data": statuses}
