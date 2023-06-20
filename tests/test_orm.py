from sqlalchemy.orm import sessionmaker,clear_mappers
from sqlalchemy import create_engine
from sqlalchemy.sql import text

from datetime import datetime
import pytest

from src import models
from src.orm import mapper_reg,start_mappers

from tests.test_models import Luna

@pytest.fixture
def in_memory_db():
    engine=create_engine("sqlite:///:memory:")
    mapper_reg.metadata.create_all(engine)
    return engine

@pytest.fixture
def session(in_memory_db):
    clear_mappers()
    start_mappers()
    yield sessionmaker(bind=in_memory_db)()
    clear_mappers

def test_can_add_kennel(session):
    session.execute(text(""" INSERT INTO "kennel" ("kennel_name") VALUES ('Team Running Husky')"""))

    session.flush()
    expected=[models.Kennel('Team Running Husky')]
    
    assert list(session.query(models.Kennel).all()) == expected

def test_kennel_mapper_can_add_line(session):
    new_kennel=models.Kennel('Team Running Husky')
    session.add(new_kennel)
    session.commit()

    rows=list(session.execute(text(""" SELECT "kennel_name" FROM "kennel" """)))
    assert rows==[("Team Running Husky",)]

def test_dog_mapper_can_add_line(session,Luna):
    
    kennel=models.Kennel('Team Running Husky')

    session.add(kennel)
    luna_kennel=session.query(models.Kennel).all()

    session.add(models.Dog('Luna',datetime(2017,4,18),kennel,'Husky'))
    session.commit()

    rows=list(session.execute(text(""" SELECT "dog_name", "kennel_id" FROM "dog" """)))
    expected=[(Luna.dog_name,kennel.id)]
    print(list(session.query(models.Kennel).all()))
    assert rows==expected
