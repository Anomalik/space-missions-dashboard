"""
Comprehensive test suite for space_missions.py

Tests all 8 required functions with structural/behavioral assertions that work
regardless of the underlying CSV data, plus extensive edge case coverage for
input validation and resilience.
"""

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
    def test_known_company_returns_positive(self):
        # RVSN USSR is the most prolific launcher in any version of this dataset
        assert getMissionCountByCompany("RVSN USSR") > 0

    def test_returns_int(self):
        result = getMissionCountByCompany("NASA")
        assert isinstance(result, int)

    def test_case_insensitive(self):
        assert getMissionCountByCompany("nasa") == getMissionCountByCompany("NASA")
        assert getMissionCountByCompany("NaSa") == getMissionCountByCompany("NASA")

    def test_whitespace_handling(self):
        assert getMissionCountByCompany("  NASA  ") == getMissionCountByCompany("NASA")

    def test_nonexistent_company(self):
        assert getMissionCountByCompany("FakeCompany123") == 0

    def test_empty_string(self):
        assert getMissionCountByCompany("") == 0

    def test_none_input(self):
        assert getMissionCountByCompany(None) == 0  # type: ignore[arg-type]

    def test_numeric_input(self):
        assert getMissionCountByCompany(12345) == 0  # type: ignore[arg-type]

    def test_boolean_input(self):
        assert getMissionCountByCompany(True) == 0  # type: ignore[arg-type]

    def test_list_input(self):
        assert getMissionCountByCompany([]) == 0  # type: ignore[arg-type]

    def test_consistency_with_top_companies(self):
        top = getTopCompaniesByMissionCount(1)
        if top:
            company, count = top[0]
            assert getMissionCountByCompany(company) == count


# ---------------------------------------------------------------------------
# Test: getSuccessRate
# ---------------------------------------------------------------------------

class TestGetSuccessRate:
    def test_known_company_returns_rate(self):
        result = getSuccessRate("NASA")
        assert result > 0.0

    def test_returns_float(self):
        result = getSuccessRate("NASA")
        assert isinstance(result, float)

    def test_result_range(self):
        result = getSuccessRate("NASA")
        assert 0.0 <= result <= 100.0

    def test_rounded_to_two_decimals(self):
        result = getSuccessRate("NASA")
        assert result == round(result, 2)

    def test_case_insensitive(self):
        assert getSuccessRate("nasa") == getSuccessRate("NASA")

    def test_whitespace_handling(self):
        assert getSuccessRate("  NASA  ") == getSuccessRate("NASA")

    def test_nonexistent_company(self):
        assert getSuccessRate("FakeCompany123") == 0.0

    def test_empty_string(self):
        assert getSuccessRate("") == 0.0

    def test_none_input(self):
        assert getSuccessRate(None) == 0.0  # type: ignore[arg-type]

    def test_numeric_input(self):
        assert getSuccessRate(999) == 0.0  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# Test: getMissionsByDateRange
# ---------------------------------------------------------------------------

class TestGetMissionsByDateRange:
    def test_returns_list(self):
        result = getMissionsByDateRange("2020-01-01", "2020-12-31")
        assert isinstance(result, list)

    def test_returns_strings(self):
        result = getMissionsByDateRange("2020-01-01", "2020-12-31")
        assert all(isinstance(m, str) for m in result)

    def test_nonempty_for_known_range(self):
        result = getMissionsByDateRange("2020-01-01", "2020-12-31")
        assert len(result) > 0

    def test_sorted_chronologically(self):
        # The earliest missions in the dataset are from 1957
        result = getMissionsByDateRange("1957-10-01", "1957-12-31")
        assert len(result) > 0
        # Sputnik-1 was the first ever space mission
        assert result[0] == "Sputnik-1"

    def test_iso_format(self):
        result = getMissionsByDateRange("2020-01-01", "2020-01-31")
        assert isinstance(result, list)
        assert len(result) > 0

    def test_us_format(self):
        result = getMissionsByDateRange("1/1/2020", "1/31/2020")
        assert isinstance(result, list)

    def test_mixed_formats_match(self):
        result1 = getMissionsByDateRange("2020-01-01", "2020-12-31")
        result2 = getMissionsByDateRange("1/1/2020", "12/31/2020")
        assert result1 == result2

    def test_single_day(self):
        result = getMissionsByDateRange("1957-10-04", "1957-10-04")
        assert "Sputnik-1" in result

    def test_start_after_end(self):
        assert getMissionsByDateRange("2020-12-31", "2020-01-01") == []

    def test_before_data_range(self):
        assert getMissionsByDateRange("1900-01-01", "1950-12-31") == []

    def test_after_data_range(self):
        assert getMissionsByDateRange("2099-01-01", "2099-12-31") == []

    def test_invalid_start_date(self):
        assert getMissionsByDateRange("not-a-date", "2020-12-31") == []

    def test_invalid_end_date(self):
        assert getMissionsByDateRange("2020-01-01", "garbage") == []

    def test_both_invalid(self):
        assert getMissionsByDateRange("foo", "bar") == []

    def test_none_inputs(self):
        assert getMissionsByDateRange(None, None) == []  # type: ignore[arg-type]

    def test_empty_strings(self):
        assert getMissionsByDateRange("", "") == []


# ---------------------------------------------------------------------------
# Test: getTopCompaniesByMissionCount
# ---------------------------------------------------------------------------

class TestGetTopCompaniesByMissionCount:
    def test_top_1_returns_single(self):
        result = getTopCompaniesByMissionCount(1)
        assert len(result) == 1

    def test_top_1_has_most_missions(self):
        result = getTopCompaniesByMissionCount(1)
        assert result[0][1] > 0

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
        result = getTopCompaniesByMissionCount(100)
        for i in range(len(result) - 1):
            if result[i][1] == result[i + 1][1]:
                assert result[i][0] < result[i + 1][0]

    def test_n_zero(self):
        assert getTopCompaniesByMissionCount(0) == []

    def test_n_negative(self):
        assert getTopCompaniesByMissionCount(-5) == []

    def test_n_greater_than_total(self):
        result = getTopCompaniesByMissionCount(10000)
        # Should return all companies, however many there are
        assert len(result) > 0
        assert len(result) < 10000

    def test_n_none(self):
        assert getTopCompaniesByMissionCount(None) == []  # type: ignore[arg-type]

    def test_n_float(self):
        result = getTopCompaniesByMissionCount(3.7)  # type: ignore[arg-type]
        assert len(result) == 3

    def test_n_string(self):
        result = getTopCompaniesByMissionCount("5")  # type: ignore[arg-type]
        assert len(result) == 5

    def test_n_invalid_string(self):
        assert getTopCompaniesByMissionCount("abc") == []  # type: ignore[arg-type]

    def test_consistency_with_mission_count(self):
        result = getTopCompaniesByMissionCount(3)
        for company, count in result:
            assert getMissionCountByCompany(company) == count


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

    def test_success_is_majority(self):
        result = getMissionStatusCount()
        assert result["Success"] > result["Failure"]

    def test_total_is_positive(self):
        result = getMissionStatusCount()
        total = sum(result.values())
        assert total > 0

    def test_values_are_ints(self):
        result = getMissionStatusCount()
        for value in result.values():
            assert isinstance(value, int)

    def test_all_values_non_negative(self):
        result = getMissionStatusCount()
        for value in result.values():
            assert value >= 0

    def test_consistency_with_top_companies(self):
        # Total missions should equal sum of all company counts
        status_total = sum(getMissionStatusCount().values())
        all_companies = getTopCompaniesByMissionCount(10000)
        company_total = sum(count for _, count in all_companies)
        assert status_total == company_total


# ---------------------------------------------------------------------------
# Test: getMissionsByYear
# ---------------------------------------------------------------------------

class TestGetMissionsByYear:
    def test_recent_year_has_missions(self):
        assert getMissionsByYear(2020) > 0

    def test_first_year_has_missions(self):
        assert getMissionsByYear(1957) > 0

    def test_returns_int(self):
        result = getMissionsByYear(2020)
        assert isinstance(result, int)

    def test_before_data(self):
        assert getMissionsByYear(1950) == 0

    def test_after_data(self):
        assert getMissionsByYear(2099) == 0

    def test_negative_year(self):
        assert getMissionsByYear(-1) == 0

    def test_none_input(self):
        assert getMissionsByYear(None) == 0  # type: ignore[arg-type]

    def test_string_year(self):
        assert getMissionsByYear("2020") == getMissionsByYear(2020)  # type: ignore[arg-type]

    def test_float_year(self):
        assert getMissionsByYear(2020.5) == getMissionsByYear(2020)  # type: ignore[arg-type]

    def test_invalid_string(self):
        assert getMissionsByYear("not-a-year") == 0  # type: ignore[arg-type]

    def test_consistency_with_date_range(self):
        count = getMissionsByYear(2020)
        missions = getMissionsByDateRange("2020-01-01", "2020-12-31")
        assert count == len(missions)


# ---------------------------------------------------------------------------
# Test: getMostUsedRocket
# ---------------------------------------------------------------------------

class TestGetMostUsedRocket:
    def test_returns_string(self):
        result = getMostUsedRocket()
        assert isinstance(result, str)

    def test_not_empty(self):
        assert len(getMostUsedRocket()) > 0


# ---------------------------------------------------------------------------
# Test: getAverageMissionsPerYear
# ---------------------------------------------------------------------------

class TestGetAverageMissionsPerYear:
    def test_returns_positive_for_known_range(self):
        result = getAverageMissionsPerYear(2010, 2020)
        assert result > 0.0

    def test_returns_float(self):
        result = getAverageMissionsPerYear(2010, 2020)
        assert isinstance(result, float)

    def test_rounded_to_two_decimals(self):
        result = getAverageMissionsPerYear(2010, 2020)
        assert result == round(result, 2)

    def test_same_year_equals_year_count(self):
        result = getAverageMissionsPerYear(2020, 2020)
        assert result == float(getMissionsByYear(2020))

    def test_reversed_years_handled(self):
        forward = getAverageMissionsPerYear(2010, 2020)
        backward = getAverageMissionsPerYear(2020, 2010)
        assert forward == backward

    def test_before_data(self):
        assert getAverageMissionsPerYear(1900, 1950) == 0.0

    def test_none_inputs(self):
        assert getAverageMissionsPerYear(None, None) == 0.0  # type: ignore[arg-type]

    def test_string_inputs(self):
        assert getAverageMissionsPerYear("2010", "2020") == getAverageMissionsPerYear(2010, 2020)  # type: ignore[arg-type]

    def test_invalid_string_inputs(self):
        assert getAverageMissionsPerYear("abc", "def") == 0.0  # type: ignore[arg-type]

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
        result = _parse_date(12345)
        assert result is None or hasattr(result, 'year')
