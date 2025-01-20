import numpy as np
from datetime import datetime, timedelta
from . import constants as c

def calculate_speed_from_pace(pace):

    """
    Convert pace (e.g., 'MM:SS' or 'H:MM:SS') to speed (km/h).

    :param pace: A string in 'MM:SS' or 'H:MM:SS' format, or a float representing minutes per kilometer.
    :return: Speed in kilometers per hour (float).
    :raises ValueError: If the input pace is invalid.
    """
    SEC_IN_HOUR = 3600
    MIN_TO_SEC = 60

    if isinstance(pace, str):
        try:
            # Try to parse as H:MM:SS format
            if ":" in pace:
                parts = pace.split(":")
                if len(parts) == 2:  # MM:SS
                    minutes, seconds = map(int, parts)
                    total_seconds = minutes * MIN_TO_SEC + seconds
                elif len(parts) == 3:  # H:MM:SS
                    hours, minutes, seconds = map(int, parts)
                    total_seconds = hours * SEC_IN_HOUR + minutes * MIN_TO_SEC + seconds
                else:
                    raise ValueError(f"Invalid pace format: {pace}")
            else:
                raise ValueError(f"Pace string must include colons: {pace}")
        except ValueError as e:
            raise ValueError(f"Error parsing pace '{pace}': {e}")
    elif isinstance(pace, (int, float)):
        # Assume pace is given in minutes per kilometer
        total_seconds = pace * MIN_TO_SEC
    else:
        raise TypeError(f"Pace must be a string or a number, got {type(pace)}")

    if total_seconds <= 0:
        raise ValueError("Pace must be greater than 0")

    speed = SEC_IN_HOUR / total_seconds
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

        