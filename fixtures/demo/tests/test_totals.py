from datetime import date

from reading_log import Session, weekly_totals


def test_weekly_totals_skips_long_sessions():
    sessions = [Session("The Mill Pond", 12, date(2026, 10, 19)), Session("The Mill Pond", 39, date(2026, 10, 20))]
    assert weekly_totals(sessions, date(2026, 10, 19)) == {"The Mill Pond": 12}
