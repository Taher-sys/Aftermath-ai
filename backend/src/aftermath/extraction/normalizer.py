import re
from typing import Any, Dict, Optional


class FactNormalizer:
    """Normalizes raw contractual strings into deterministic domain values."""

    MONTH_MAP = {
        "january": 1,
        "jan": 1,
        "february": 2,
        "feb": 2,
        "march": 3,
        "mar": 3,
        "april": 4,
        "apr": 4,
        "may": 5,
        "june": 6,
        "jun": 6,
        "july": 7,
        "jul": 7,
        "august": 8,
        "aug": 8,
        "september": 9,
        "sep": 9,
        "sept": 9,
        "october": 10,
        "oct": 10,
        "november": 11,
        "nov": 11,
        "december": 12,
        "dec": 12,
    }

    @classmethod
    def normalize_currency(cls, text: str, default_frequency: str = "ONE_TIME") -> Dict[str, Any]:
        """Parses a currency amount string into structured numeric components."""
        currency = "USD"
        if "EUR" in text or "€" in text:
            currency = "EUR"
        elif "GBP" in text or "£" in text:
            currency = "GBP"
        elif "CAD" in text:
            currency = "CAD"

        frequency = default_frequency
        lower = text.lower()
        if "month" in lower:
            frequency = "MONTHLY"
        elif "year" in lower or "annual" in lower:
            frequency = "ANNUAL"
        elif "day" in lower:
            frequency = "DAILY"

        # Extract numeric characters
        clean = text.replace(",", "")
        match = re.search(r"(\d+(?:\.\d{1,2})?)", clean)
        amount = float(match.group(1)) if match else 0.0

        return {
            "amount": amount,
            "currency": currency,
            "frequency": frequency,
            "raw": text,
        }

    @classmethod
    def normalize_date(cls, text: str) -> Optional[str]:
        """Normalizes diverse date formats into standard ISO 8601 (YYYY-MM-DD)."""
        # Try YYYY-MM-DD
        m = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", text)
        if m:
            return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"

        # Try Month Name DD, YYYY (e.g. November 1, 2026 or Nov 1, 2026)
        m = re.search(r"\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b", text)
        if m:
            month_str = m.group(1).lower()
            if month_str in cls.MONTH_MAP:
                month_num = cls.MONTH_MAP[month_str]
                day = int(m.group(2))
                year = int(m.group(3))
                return f"{year:04d}-{month_num:02d}-{day:02d}"

        # Try MM/DD/YYYY
        m = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b", text)
        if m:
            return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"

        return None

    @classmethod
    def normalize_duration(cls, text: str) -> Dict[str, Any]:
        """Parses duration statements into integer days."""
        lower = text.lower()
        days = 0

        # Pattern: sixty (60) days or (60) days or 60 days
        m_days = re.search(r"\(?(\d+)\)?\s*(?:calendar\s*)?days", lower)
        if m_days:
            days = int(m_days.group(1))
        else:
            # Pattern: 12 months or (12) months
            m_months = re.search(r"\(?(\d+)\)?\s*(?:calendar\s*)?months", lower)
            if m_months:
                days = int(m_months.group(1)) * 30
            else:
                m_hours = re.search(r"\(?(\d+)\)?\s*hours", lower)
                if m_hours:
                    days = max(1, round(int(m_hours.group(1)) / 24))

        return {
            "duration_days": days,
            "raw": text,
        }

    @classmethod
    def normalize_modality(cls, text: str) -> str:
        """Determines modal obligation duty."""
        lower = text.lower()
        if any(w in lower for w in ["shall not", "prohibited", "must not", "will not"]):
            return "PROHIBITED"
        if any(w in lower for w in ["shall", "must", "agrees to", "required to", "will"]):
            return "MANDATORY"
        if any(
            w in lower for w in ["may", "optional", "at tenant's option", "at employee's option"]
        ):
            return "OPTIONAL"
        return "MANDATORY"
