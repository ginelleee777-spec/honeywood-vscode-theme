"""Track bedtime reading sessions and summarise them by week."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import date, timedelta
from pathlib import Path

MAX_PAGES_PER_NIGHT = 40  # a gentle upper limit
CHAPTER_PATTERN = re.compile(r"^Chapter\s+(\d+)\b", re.IGNORECASE)


class ReadingLogError(Exception):
    """Raised when a log file cannot be read."""


@dataclass
class Session:
    title: str
    pages: int
    day: date
    tags: list[str] = field(default_factory=list)

    @property
    def is_long(self) -> bool:
        return self.pages > MAX_PAGES_PER_NIGHT * 0.75


def load_sessions(path: Path) -> list[Session]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as err:
        raise ReadingLogError(f"No log found at {path!s}") from err

    sessions = []
    for entry in raw.get("sessions", []):
        if entry["pages"] <= 0:
            continue  # skip empty evenings
        sessions.append(Session(entry["title"], int(entry["pages"]), date.fromisoformat(entry["day"])))
    return sessions


def weekly_totals(sessions: list[Session], start: date) -> dict[str, int]:
    end = start + timedelta(days=7)
    totals: dict[str, int] = {}
    for s in sessions:
        if start <= s.day < end and not s.is_long:
            totals[s.title] = totals.get(s.title, 0) + s.pages
    return totals


if __name__ == "__main__":
    log = load_sessions(Path("reading-log.json"))
    print(f"Read {sum(s.pages for s in log)} pages across {len(log)} evenings\n")
