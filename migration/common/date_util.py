from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta, timezone


def parse_UTC(dt: str, hour_offset: int = 0) -> datetime:
    naive_datetime = datetime.strptime(dt, '%Y-%m-%dT%H:%M:%SZ')
    informed_datetime = naive_datetime.replace(tzinfo=timezone.utc)
    return to_tz(informed_datetime, hour_offset)

def get_now_UTC() -> datetime:
    return datetime.utcnow().replace(tzinfo=timezone.utc)

def get_time_in_tz(t: datetime, hour_offset: int):
    return t.replace(tzinfo=timezone(timedelta(hours=hour_offset)))
    
def to_tz(utc_time: datetime, hour_offset: int):
    tz = timezone(timedelta(hours=hour_offset))
    return utc_time.astimezone(tz)

def to_ISO8601(tz_time: datetime, is_only_date: bool = False) -> str:
    utc_time = tz_time.astimezone(timezone.utc)
    if is_only_date: return utc_time.strftime('%Y-%m-%d')
    return utc_time.strftime('%Y-%m-%dT%H:%M:%SZ')

def to_month_start(dt: datetime):
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

def curr_month_start_in_tz(hour_offset: int) -> datetime:
    now = get_now_UTC()
    now_tz = to_tz(now, hour_offset)
    end = to_month_start(now_tz)
    return end

def date_range(start_inclusive: datetime, end_exclusive: datetime):
    start = start_inclusive
    while start < end_exclusive:
        rel_next_month = start + relativedelta(months=1)
        end = min(rel_next_month, end_exclusive)
        yield start, end
        start = end