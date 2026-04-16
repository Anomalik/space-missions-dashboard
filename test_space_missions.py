"""
Comprehensive test suite for space_missions.py

Tests all 8 required functions with verified expected values from the actual
dataset, plus extensive edge case coverage for input validation and resilience.
"""

import pytest
from space_missions import (
    getMissionCountByCompany,
    getSuccessRate,
    getMissionsByDateRange,
    getTopCompaniesByMissionCount,
    getMissionStatusCount,
    getMissionsByYear,
    getMostUsedRocket,
    getAverageMissionsPerYear,
    _parse_date,
)


# ---------------------------------------------------------------------------
# Test: getMissionCountByCompany
# ---------------------------------------------------------------------------

class TestGetMissionCountByCompany:
    def test_nasa_count(self):
        assert getMissionCountByCompany("NASA") == 203

    def test_rvsn_ussr_count(self):
        assert getMissionCountByCompany("RVSN USSR") == 1777

    def test_spacex_count(self):
        result = getMissionCountByCompany("SpaceX")
        assert isinstance(result, int)
        assert result > 0

    def test_case_insensitive_lowercase(self):
        assert getMissionCountByCompany("nasa") == 203

    def test_case_insensitive_uppercase(self):
        assert getMissionCountByCompany("NASA") == 203

    def test_case_insensitive_mixed(self):
        assert getMissionCountByCompany("NaSa") == 203

    def test_whitespace_handling(self):
        assert getMissionCountByCompany("  NASA  ") == 203

    def test_nonexistent_company(self):
        assert getMissionCountByCompany("FakeCompany123") == 0

    def test_empty_string(self):
        assert getMissionCountByCompany("") == 0

    def test_none_input(self):
        assert getMissionCountByCompany(None) == 0

    def test_numeric_input(self):
        assert getMissionCountByCompany(12345) == 0

    def test_boolean_input(self):
        assert getMissionCountByCompany(True) == 0

    def test_list_input(self):
        assert getMissionCountByCompany([]) == 0

    def test_returns_int(self):
        result = getMissionCountByCompany("NASA")
        assert isinstance(result, int)


# ---------------------------------------------------------------------------
# Test: getSuccessRate
# ---------------------------------------------------------------------------

class TestGetSuccessRate:
    def test_nasa_success_rate(self):
        assert getSuccessRate("NASA") == 91.63

    def test_case_insensitive(self):
        assert getSuccessRate("nasa") == getSuccessRate("NASA")

    def test_whitespace_handling(self):
        assert getSuccessRate("  NASA  ") == 91.63

    def test_nonexistent_company(self):
        assert getSuccessRate("FakeCompany123") == 0.0

    def test_empty_string(self):
        assert getSuccessRate("") == 0.0

    def test_none_input(self):
        assert getSuccessRate(None) == 0.0

    def test_returns_float(self):
        result = getSuccessRate("NASA")
        assert isinstance(result, float)

    def test_rounded_to_two_decimals(self):
        result = getSuccessRate("NASA")
        assert result == round(result, 2)

    def test_result_range(self):
        result = getSuccessRate("NASA")
        assert 0.0 <= result <= 100.0

    def test_numeric_input(self):
        assert getSuccessRate(999) == 0.0


# ---------------------------------------------------------------------------
# Test: getMissionsByDateRange
# ---------------------------------------------------------------------------

class TestGetMissionsByDateRange:
    def test_spec_example(self):
        result = getMissionsByDateRange("1957-10-01", "1957-12-31")
        assert result == ["Sputnik-1", "Sputnik-2", "Vanguard TV3"]

    def test_iso_format(self):
        result = getMissionsByDateRange("2020-01-01", "2020-01-31")
        assert isinstance(result, list)
        assert len(result) > 0

    def test_us_format(self):
        result = getMissionsByDateRange("1/1/2020", "1/31/2020")
        assert isinstance(result, list)

    def test_mixed_formats(self):
        result1 = getMissionsByDateRange("2020-01-01", "2020-12-31")
        result2 = getMissionsByDateRange("1/1/2020", "12/31/2020")
        assert result1 == result2

    def test_sorted_chronologically(self):
        result = getMissionsByDateRange("1957-10-01", "1958-12-31")
        assert len(result) > 0
        # First mission should be Sputnik-1
        assert result[0] == "Sputnik-1"

    def test_single_day(self):
        result = getMissionsByDateRange("1957-10-04", "1957-10-04")
        assert "Sputnik-1" in result

    def test_start_after_end(self):
        result = getMissionsByDateRange("2020-12-31", "2020-01-01")
        assert result == []

    def test_before_data_range(self):
        result = getMissionsByDateRange("1900-01-01", "1950-12-31")
        assert result == []

    def test_after_data_range(self):
        result = getMissionsByDateRange("2025-01-01", "2030-12-31")
        assert result == []

    def test_invalid_start_date(self):
        result = getMissionsByDateRange("not-a-date", "2020-12-31")
        assert result == []

    def test_invalid_end_date(self):
        result = getMissionsByDateRange("2020-01-01", "garbage")
        assert result == []

    def test_both_invalid(self):
        result = getMissionsByDateRange("foo", "bar")
        assert result == []

    def test_none_inputs(self):
        assert getMissionsByDateRange(None, None) == []

    def test_empty_strings(self):
        assert getMissionsByDateRange("", "") == []

    def test_returns_list_of_strings(self):
        result = getMissionsByDateRange("1957-10-01", "1957-12-31")
        assert isinstance(result, list)
        assert all(isinstance(m, str) for m in result)


# ---------------------------------------------------------------------------
# Test: getTopCompaniesByMissionCount
# ---------------------------------------------------------------------------

class TestGetTopCompaniesByMissionCount:
    def test_top_1(self):
        result = getTopCompaniesByMissionCount(1)
        assert len(result) == 1
        assert result[0][0] == "RVSN USSR"
        assert result[0][1] == 1777

    def test_top_3(self):
        result = getTopCompaniesByMissionCount(3)
        assert len(result) == 3
        assert result[0][0] == "RVSN USSR"
        assert result[0][1] == 1777

    def test_returns_tuples(self):
        result = getTopCompaniesByMissionCount(3)
        for item in result:
            assert isinstance(item, tuple)
            assert isinstance(item[0], str)
            assert isinstance(item[1], int)

    def test_descending_order(self):
        result = getTopCompaniesByMissionCount(10)
        counts = [item[1] for item in result]
        assert counts == sorted(counts, reverse=True)

    def test_alphabetical_tiebreak(self):
        result = getTopCompaniesByMissionCount(62)
        for i in range(len(result) - 1):
            if result[i][1] == result[i + 1][1]:
                assert result[i][0] < result[i + 1][0]

    def test_n_zero(self):
        assert getTopCompaniesByMissionCount(0) == []

    def test_n_negative(self):
        assert getTopCompaniesByMissionCount(-5) == []

    def test_n_greater_than_total(self):
        result = getTopCompaniesByMissionCount(1000)
        assert len(result) == 62

    def test_n_none(self):
        assert getTopCompaniesByMissionCount(None) == []

    def test_n_float(self):
        result = getTopCompaniesByMissionCount(3.7)
        assert len(result) == 3

    def test_n_string(self):
        result = getTopCompaniesByMissionCount("5")
        assert len(result) == 5

    def test_n_invalid_string(self):
        assert getTopCompaniesByMissionCount("abc") == []


# ---------------------------------------------------------------------------
# Test: getMissionStatusCount
# ---------------------------------------------------------------------------

class TestGetMissionStatusCount:
    def test_returns_dict(self):
        result = getMissionStatusCount()
        assert isinstance(result, dict)

    def test_has_all_statuses(self):
        result = getMissionStatusCount()
        assert "Success" in result
        assert "Failure" in result
        assert "Partial Failure" in result
        assert "Prelaunch Failure" in result

    def test_success_count(self):
        result = getMissionStatusCount()
        assert result["Success"] == 4162

    def test_failure_count(self):
        result = getMissionStatusCount()
        assert result["Failure"] == 357

    def test_partial_failure_count(self):
        result = getMissionStatusCount()
        assert result["Partial Failure"] == 107

    def test_prelaunch_failure_count(self):
        result = getMissionStatusCount()
        assert result["Prelaunch Failure"] == 4

    def test_total_equals_dataset_size(self):
        result = getMissionStatusCount()
        total = sum(result.values())
        assert total == 4630

    def test_values_are_ints(self):
        result = getMissionStatusCount()
        for value in result.values():
            assert isinstance(value, int)


# ---------------------------------------------------------------------------
# Test: getMissionsByYear
# ---------------------------------------------------------------------------

class TestGetMissionsByYear:
    def test_2020(self):
        assert getMissionsByYear(2020) == 119

    def test_1957(self):
        result = getMissionsByYear(1957)
        assert result > 0

    def test_2022(self):
        result = getMissionsByYear(2022)
        assert result > 0

    def test_before_data(self):
        assert getMissionsByYear(1950) == 0

    def test_after_data(self):
        assert getMissionsByYear(2025) == 0

    def test_negative_year(self):
        assert getMissionsByYear(-1) == 0

    def test_none_input(self):
        assert getMissionsByYear(None) == 0

    def test_string_year(self):
        assert getMissionsByYear("2020") == 119

    def test_float_year(self):
        assert getMissionsByYear(2020.5) == 119

    def test_invalid_string(self):
        assert getMissionsByYear("not-a-year") == 0

    def test_returns_int(self):
        result = getMissionsByYear(2020)
        assert isinstance(result, int)


# ---------------------------------------------------------------------------
# Test: getMostUsedRocket
# ---------------------------------------------------------------------------

class TestGetMostUsedRocket:
    def test_returns_string(self):
        result = getMostUsedRocket()
        assert isinstance(result, str)

    def test_expected_rocket(self):
        assert getMostUsedRocket() == "Cosmos-3M (11K65M)"

    def test_not_empty(self):
        assert len(getMostUsedRocket()) > 0


# ---------------------------------------------------------------------------
# Test: getAverageMissionsPerYear
# ---------------------------------------------------------------------------

class TestGetAverageMissionsPerYear:
    def test_2010_to_2020(self):
        assert getAverageMissionsPerYear(2010, 2020) == 72.27

    def test_same_year(self):
        result = getAverageMissionsPerYear(2020, 2020)
        assert result == 119.0

    def test_reversed_years(self):
        result = getAverageMissionsPerYear(2020, 2010)
        assert result == 72.27

    def test_before_data(self):
        assert getAverageMissionsPerYear(1900, 1950) == 0.0

    def test_none_inputs(self):
        assert getAverageMissionsPerYear(None, None) == 0.0

    def test_string_inputs(self):
        assert getAverageMissionsPerYear("2010", "2020") == 72.27

    def test_invalid_string_inputs(self):
        assert getAverageMissionsPerYear("abc", "def") == 0.0

    def test_returns_float(self):
        result = getAverageMissionsPerYear(2010, 2020)
        assert isinstance(result, float)

    def test_rounded_to_two_decimals(self):
        result = getAverageMissionsPerYear(2010, 2020)
        assert result == round(result, 2)

    def test_single_year_no_missions(self):
        result = getAverageMissionsPerYear(1950, 1950)
        assert result == 0.0


# ---------------------------------------------------------------------------
# Test: _parse_date (internal helper)
# ---------------------------------------------------------------------------

class TestParseDate:
    def test_us_format(self):
        result = _parse_date("10/4/1957")
        assert result is not None
        assert result.year == 1957
        assert result.month == 10
        assert result.day == 4

    def test_iso_format(self):
        result = _parse_date("2020-01-15")
        assert result is not None
        assert result.year == 2020
        assert result.month == 1
        assert result.day == 15

    def test_long_form(self):
        result = _parse_date("January 15, 2020")
        assert result is not None
        assert result.year == 2020
        assert result.month == 1
        assert result.day == 15

    def test_short_month_form(self):
        result = _parse_date("Jan 15, 2020")
        assert result is not None
        assert result.year == 2020

    def test_none_input(self):
        assert _parse_date(None) is None

    def test_empty_string(self):
        assert _parse_date("") is None

    def test_garbage_input(self):
        assert _parse_date("not-a-date-at-all") is None

    def test_whitespace_handling(self):
        result = _parse_date("  2020-01-15  ")
        assert result is not None
        assert result.year == 2020

    def test_numeric_input(self):
        # Should handle gracefully, converting to string first
        result = _parse_date(12345)
        # May or may not parse, but should not crash
        assert result is None or isinstance(result, type(_parse_date("2020-01-01")))
