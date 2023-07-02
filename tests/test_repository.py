from .test_orm import in_memory_db, session
from .test_models import Luna,JC
import pytest
from src import models
from src.repository import sql_alchemy_repository

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
        text(""" SELECT weight_entry.id, weight_entry.dog_age, weight_entry.weight, dog.dog_name 
        FROM "weight_entry" 
        INNER JOIN dog ON weight_entry.dog_id=dog.id """)
    ))

    assert rows == [(1, 6.0, 36.0, 'Luna')]