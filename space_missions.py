"""
Space Missions Data Analysis Functions

Provides 8 core analysis functions for the space missions dataset.
Functions are designed to be imported standalone or used by the FastAPI backend.
"""

import os
import pandas as pd
from datetime import datetime
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

SUPPORTED_DATE_FORMATS = [
    "%m/%d/%Y",     # 1/15/2020  — CSV format (try first)
    "%Y-%m-%d",     # 2020-01-15 — ISO standard
    "%d/%m/%Y",     # 15/01/2020 — European
    "%Y/%m/%d",     # 2020/01/15
    "%B %d, %Y",    # January 15, 2020
    "%b %d, %Y",    # Jan 15, 2020
    "%d %B %Y",     # 15 January 2020
    "%d %b %Y",     # 15 Jan 2020
    "%m-%d-%Y",     # 01-15-2020
    "%d-%m-%Y",     # 15-01-2020
]

_df_cache: Optional[pd.DataFrame] = None


def _load_data() -> pd.DataFrame:
    """Load and cache the space missions dataset."""
    global _df_cache
    if _df_cache is not None:
        return _df_cache

    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "space_missions.csv")
    df = pd.read_csv(csv_path, encoding="utf-8")

    # Strip whitespace from string columns
    for col in df.select_dtypes(include=["object", "string"]).columns:
        df[col] = df[col].str.strip()

    # Parse dates into datetime objects
    df["_parsed_date"] = pd.to_datetime(df["Date"], format="%m/%d/%Y", errors="coerce")

    # Lowercase company column for case-insensitive matching
    df["_company_lower"] = df["Company"].str.lower()

    # Extract year for fast year-based queries
    df["_year"] = df["_parsed_date"].dt.year

    # Extract country from Location (last part after the last comma)
    df["_country"] = df["Location"].apply(_extract_country)

    _df_cache = df
    return _df_cache


def _extract_country(location: str) -> str:
    """Extract country from a location string like 'Site 1/5, Baikonur Cosmodrome, Kazakhstan'."""
    try:
        parts = str(location).split(",")
        return parts[-1].strip()
    except Exception:
        return "Unknown"


def _parse_date(date_str: Any) -> Optional[datetime]:
    """
    Parse a date string using multiple known formats.

    Tries US-style (M/D/Y) first since the dataset uses that convention,
    then ISO, European, and long-form formats. Returns None on failure.
    """
    if date_str is None:
        return None

    date_str = str(date_str).strip()
    if not date_str:
        return None

    for fmt in SUPPORTED_DATE_FORMATS:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    # Fallback: try dateutil parser if available
    try:
        from dateutil import parser as dateutil_parser
        return dateutil_parser.parse(date_str, dayfirst=False)
    except Exception:
        return None


def _safe_str(value: Any) -> str:
    """Convert any input to a stripped string. Returns empty string for None/NaN."""
    if value is None:
        return ""
    if isinstance(value, float) and pd.isna(value):
        return ""
    return str(value).strip()


def _safe_int(value: Any) -> Optional[int]:
    """Convert any input to an integer. Returns None on failure."""
    if value is None:
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# Public API — 8 required functions
# ---------------------------------------------------------------------------


def getMissionCountByCompany(companyName: str) -> int:
    """
    Returns the total number of missions for a given company.

    Case-insensitive matching with whitespace stripping.
    Returns 0 for invalid input or unknown companies.
    """
    try:
        name = _safe_str(companyName).lower()
        if not name:
            return 0
        df = _load_data()
        return int(df[df["_company_lower"] == name].shape[0])
    except Exception:
        return 0


def getSuccessRate(companyName: str) -> float:
    """
    Calculates the success rate for a given company as a percentage.

    Only 'Success' missions count as successful.
    Returns 0.0 for invalid input, unknown companies, or companies with no missions.
    """
    try:
        name = _safe_str(companyName).lower()
        if not name:
            return 0.0
        df = _load_data()
        company_missions = df[df["_company_lower"] == name]
        total = len(company_missions)
        if total == 0:
            return 0.0
        success_count = len(company_missions[company_missions["MissionStatus"] == "Success"])
        return round((success_count / total) * 100, 2)
    except Exception:
        return 0.0


def getMissionsByDateRange(startDate: str, endDate: str) -> list:
    """
    Returns a list of all mission names launched between startDate and endDate (inclusive).

    Accepts multiple date formats (ISO, US, European, long-form).
    Returns missions sorted chronologically.
    Returns an empty list for invalid dates or if start > end.
    """
    try:
        start = _parse_date(startDate)
        end = _parse_date(endDate)
        if start is None or end is None:
            return []
        if start > end:
            return []

        df = _load_data()
        mask = (df["_parsed_date"] >= start) & (df["_parsed_date"] <= end)
        filtered = df[mask].sort_values("_parsed_date")
        return filtered["Mission"].tolist()
    except Exception:
        return []


def getTopCompaniesByMissionCount(n: int) -> list:
    """
    Returns the top N companies ranked by total number of missions.

    Returns list of tuples: [(companyName, missionCount), ...]
    Sorted by mission count descending; ties broken alphabetically.
    Returns empty list for n <= 0 or invalid input.
    """
    try:
        safe_n = _safe_int(n)
        if safe_n is None or safe_n <= 0:
            return []

        df = _load_data()
        counts = df.groupby("Company").size().reset_index(name="count")
        counts = counts.sort_values(["count", "Company"], ascending=[False, True])

        safe_n = min(safe_n, len(counts))
        result = [(row["Company"], int(row["count"])) for _, row in counts.head(safe_n).iterrows()]
        return result
    except Exception:
        return []


def getMissionStatusCount() -> dict:
    """
    Returns the count of missions for each mission status.

    Keys: 'Success', 'Failure', 'Partial Failure', 'Prelaunch Failure'
    """
    try:
        df = _load_data()
        counts = df["MissionStatus"].value_counts().to_dict()
        # Ensure all expected statuses are present
        expected = ["Success", "Failure", "Partial Failure", "Prelaunch Failure"]
        result = {}
        for status in expected:
            result[status] = int(counts.get(status, 0))
        # Include any unexpected statuses found in the data
        for status, count in counts.items():
            if status not in result:
                result[status] = int(count)
        return result
    except Exception:
        return {}


def getMissionsByYear(year: int) -> int:
    """
    Returns the total number of missions launched in a specific year.

    Returns 0 for invalid input or years with no missions.
    """
    try:
        safe_year = _safe_int(year)
        if safe_year is None:
            return 0
        df = _load_data()
        return int(df[df["_year"] == safe_year].shape[0])
    except Exception:
        return 0


def getMostUsedRocket() -> str:
    """
    Returns the name of the rocket that has been used the most times.

    If multiple rockets are tied, returns the first one alphabetically.
    """
    try:
        df = _load_data()
        counts = df["Rocket"].value_counts()
        max_count = counts.iloc[0]
        tied = sorted(counts[counts == max_count].index.tolist())
        return tied[0]
    except Exception:
        return ""


def getAverageMissionsPerYear(startYear: int, endYear: int) -> float:
    """
    Calculates the average number of missions per year over a given range.

    Both startYear and endYear are inclusive.
    If startYear > endYear, they are swapped.
    Returns 0.0 for invalid input.
    """
    try:
        start = _safe_int(startYear)
        end = _safe_int(endYear)
        if start is None or end is None:
            return 0.0

        # Swap if reversed
        if start > end:
            start, end = end, start

        num_years = end - start + 1
        if num_years <= 0:
            return 0.0

        df = _load_data()
        mask = (df["_year"] >= start) & (df["_year"] <= end)
        total_missions = int(mask.sum())
        return round(total_missions / num_years, 2)
    except Exception:
        return 0.0
