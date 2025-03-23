from .test_orm import in_memory_db, session
from .unit.test_models import Luna,JC
import pytest
from src import models
from src.repositories.postgres_repository import sql_alchemy_repository

from sqlalchemy.sql import text
from datetime import datetime


def test_get_dog(session,Luna):
    session.add(Luna)
    session.commit()

    repo=sql_alchemy_repository(session)
    dog_query=repo.get_dog('Luna')

    assert dog_query == Luna

def test_raise_condition_on_runner(session,JC):
    session.add(JC)
    session.commit()

    repo=sql_alchemy_repository(session)
    
    with pytest.raises(ValueError):
        repo.get_runner('Flo')

def test_add_weight_entry(session, Luna):
    weigth_entry=models.Dog_Weight(Luna,"2023/04/18",36)
    repo=sql_alchemy_repository(session)
    repo.add_weight_entry(weigth_entry)

    rows=list(session.execute(
        text(""" SELECT weight_entry.id, weight_entry.weight, dog.dog_name 
        FROM "weight_entry" 
        INNER JOIN dog ON weight_entry.dog_id=dog.id """)
    ))

    assert rows == [(1, 36.0, 'Luna')]


def test_add_training_entry(session,JC, Luna):
    session.add(models.Kennel('Team Running Husky'))
    session.flush()
    kennel=session.query(models.Kennel).first()
    JC.kennel_name=kennel
    Luna.kennel_name=kennel
    session.add(JC)
    session.add(Luna)
    session.commit()

    repo=sql_alchemy_repository(session)
    #create training log entry
    runner=repo.get_runner('JC')
    dog= repo.get_dog('Luna')

    training_entry=models.Training_Log(datetime.now(), 15, 77, dog, 
                                       None, 'Canicross', runner, 'Christie',
                                       3.2, 3, pace = '0:03:20', sky_condition='Sunny')
    
    repo.add_training_entry(training_entry)

    rows=list(session.execute(
        text(""" SELECT training_log.id, training_log.location, training_log.distance, 
        training_log.sport, training_log.pace, training_log.speed, training_log.weather_id,dog.dog_name, runner.runner_name
        FROM "training_log" 
        INNER JOIN dog ON training_log.dog1_id=dog.id
        
        INNER JOIN runner ON training_log.runner_id=runner.id """)
    ))

    assert rows == [(1, 'Christie', 3.2, 'Canicross', '0:03:20',18.0, 1,'Luna', 'JC')]


#TODO add test to see if training entry add a weather entry

def test_training_entry_creates_weather_entry(session,JC, Luna):
    session.add(models.Kennel('Team Running Husky'))
    session.flush()
    kennel=session.query(models.Kennel).first()
    JC.kennel_name=kennel
    Luna.kennel_name=kennel
    session.add(JC)
    session.add(Luna)
    session.commit()

    repo=sql_alchemy_repository(session)
    #create training log entry
    runner=repo.get_runner('JC')
    dog= repo.get_dog('Luna')

    training_entry=models.Training_Log(datetime(2023,7,3,13,20,0,90), 15, 77, dog, 
                                       None, 'Canicross', runner, 'Christie',
                                       3.2, 3, pace = '0:03:20', sky_condition='Sunny')
    
    repo.add_training_entry(training_entry)

    rows=list(session.execute(
        text(""" SELECT *
        FROM "weather_entry" """)
    ))
    
    now_string=datetime(2023,7,3,13,20,0,90).strftime('%Y-%m-%d %H:%M:%S.%f')
    assert rows == [(1, now_string, 15.0, 0.77, 'Sunny')]


