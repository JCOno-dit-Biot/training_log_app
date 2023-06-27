from sqlalchemy.orm import sessionmaker,clear_mappers
from sqlalchemy import create_engine
from sqlalchemy.sql import text

from datetime import datetime
import pytest

from src import models
from src.orm import mapper_reg,start_mappers

from tests.test_models import Luna, training_log_entry, JC

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
    
    # kennel=models.Kennel('Team Running Husky')

    # session.add(kennel)
    # luna_kennel=session.query(models.Kennel).all()

    #session.add(models.Dog('Luna',datetime(2017,4,18),kennel,'Husky'))
    

    session.add(Luna)
    session.commit()

    rows=list(session.execute(text(""" SELECT "dog_name", "kennel_id" FROM "dog" """)))
    expected=[(Luna.dog_name,1)]
    print(list(session.query(models.Kennel).all()))
    assert rows==expected

def test_runner_mapper_can_add_line(session,JC):
    
    session.add(JC)
    session.commit()

    rows=list(session.execute(text(""" SELECT "runner_name", "kennel_id" FROM "runner" """)))
    expected=[(JC.runner_name,1)]
    print(list(session.query(models.Kennel).all()))
    assert rows==expected

def test_dog_mapper_can_retrive_entry(session,Luna):
    kennel=models.Kennel('Team Running Husky')

    session.add(kennel)
    
    query=text(""" INSERT INTO "dog" ("dog_name", "date_of_birth", "breed", "kennel_id") VALUES (:dogname,:dob,:breed,:kennel_id)""")
    param={"dogname": 'Luna','dob':datetime(2017,4,18).date(),'breed':'Husky','kennel_id':1}
    session.execute(query,param)
    session.flush()
    

    expected=Luna
    
    assert list(session.query(models.Dog).all())[0].date_of_birth == expected.date_of_birth
    assert list(session.query(models.Dog).all())[0].breed == expected.breed
    assert list(session.query(models.Dog).all())[0].dog_name == expected.dog_name
    assert list(session.query(models.Dog).all())[0].kennel_name == expected.kennel_name


def test_can_add_training_entry(session):
    kennel=models.Kennel('Team Running Husky')

    session.add(kennel)
    TRH_kennel=session.query(models.Kennel).all()[0]

    luna=models.Dog('Luna',datetime(2017,4,18),TRH_kennel,'Husky')
    JC= models.Runner('JC', TRH_kennel)
    bolt=models.Dog('Bolt',datetime(2018,6,12),TRH_kennel,'Husky')
   
    #session.add(models.Dog('Luna',datetime(2017,4,18),kennel,'Husky'))
    
    training_entry= models.Training_Log(datetime.now(), 20,77, luna,"Canicross",JC,\
                                        "Christie", 2.4, 3, pace="0:03:20",dog2=bolt)

    
    
    session.add(training_entry)
    session.commit()

    query=text(""" SELECT "dog1_id", "runner_id", "sport","speed", "pace" FROM "training_log" """)
    
    rows=list(session.execute(query))
    print(rows)
    expected=[(luna.id, JC.id, "Canicross", 18, "0:03:20"),]
    assert rows==expected

def test_dog_weight_entry_mapper_can_add_line(session, Luna):
    # session.add(Luna)
    # session.flush()
    luna=models.Dog('Luna',datetime(2017,4,18),models.Kennel('Team Running Husky'),'Husky')
    
    weight_entry=models.Dog_Weight(luna, datetime.now().strftime('%Y/%m/%d'), 35)

    session.add(weight_entry)
    session.commit()

    query=text(""" SELECT "dog_id", "dog_age", "weight" FROM "weight_entry" """)
    
    rows=list(session.execute(query).all())
    print(rows)
    expected=[(luna.id, luna.age, 35.0),]
    assert rows==expected


