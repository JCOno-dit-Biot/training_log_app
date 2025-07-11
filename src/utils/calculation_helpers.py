import numpy as np
from datetime import datetime, timedelta, date
from .. import constants as c

def convert_str_time_to_timedelta(time_str) -> timedelta:
    if isinstance(time_str, str):
        try:
            # Try to parse as H:MM:SS format
            if ":" in time_str:
                parts = time_str.split(":")
                if len(parts) == 2:  # MM:SS
                    minutes, seconds = map(int, parts)
                    time_delta = timedelta(seconds=seconds, minutes=minutes)
                elif len(parts) == 3:  # H:MM:SS
                    hours, minutes, seconds = map(int, parts)
                    time_delta = timedelta(seconds=seconds, minutes=minutes, hours=hours)
                else:
                    raise ValueError(f"Invalid timeformat: {time_str}")
            else:
                raise ValueError(f"time string must include colons: {time_str}")
        except ValueError as e:
            raise ValueError(f"Error parsing time '{time_str}': {e}")
    else:
        raise TypeError(f"Time must be a string or a number, got {type(time_str)}")
    
    return time_delta

def calculate_speed_from_pace(pace):

    """
    Convert pace (e.g., 'MM:SS' or 'H:MM:SS') to speed (km/h).

    :param pace: A string in 'MM:SS' or 'H:MM:SS' format, or a float representing minutes per kilometer.
    :return: Speed in kilometers per hour (float).
    :raises ValueError: If the input pace is invalid.
    """
    try:
        total_seconds = convert_str_time_to_timedelta(pace).total_seconds()
    except TypeError as type_error:
        if isinstance(pace, (int, float)):
            # Assume pace is given in minutes per kilometer
            total_seconds = pace * c.MIN_TO_SEC
        else:
            raise TypeError(f"Pace must be a string or a number, got {type(pace)}")

    if total_seconds <= 0:
        raise ValueError("Pace must be greater than 0")

    speed = c.SEC_IN_HOUR / total_seconds
    return round(speed, 2)

def calculate_pace_from_speed(speed):

    """
    Convert speed (km/h) to pace 'MM:SS'.

    :param speed: A float in km/h.
    :return: Pace in 'MM:SS' format
    :raises TypeError: If the input speed is not a float
    """
    
    if isinstance(speed, float):
        time_in_sec=c.SEC_IN_HOUR/speed
        pace_minutes=int(time_in_sec // c.MIN_TO_SEC)
        pace_second=int(time_in_sec % c.MIN_TO_SEC)
        pace_timedelta=timedelta(minutes=pace_minutes,seconds=pace_second)
       
        return ":".join(str(pace_timedelta).split(":")[1:])
    else:
        raise TypeError("speed must be a float")

        
def calculate_speed_from_time_distance(distance: float, time: str):

    total_seconds = convert_str_time_to_timedelta(time).total_seconds()

    return distance / total_seconds * c.SEC_IN_HOUR


def get_month_range(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    # compute first of next month
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return start, end