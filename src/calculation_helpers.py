import numpy as np
from datetime import datetime, timedelta
import constants as c

def calculate_speed_from_pace(pace):

    pace_datetime=datetime.strptime(pace,"%H:%M:%S")
    time_in_sec=pace_datetime.minute*c.MIN_TO_SEC + pace_datetime.second
    speed=c.SEC_IN_HOUR/time_in_sec

    return speed


def calculate_pace_from_speed(speed):

    time_in_sec=c.SEC_IN_HOUR/speed

    pace_minutes=int(time_in_sec // c.MIN_TO_SEC)

    pace_second=int(time_in_sec % c.MIN_TO_SEC)

    pace_timedelta=timedelta(hours=0, minutes=pace_minutes,seconds=pace_second)

    return str(pace_timedelta)