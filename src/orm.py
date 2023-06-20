from sqlalchemy import Table, MetaData, Column, Integer, Boolean, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import registry, relationship
from . import models

SCHEMA='public'


metadata=MetaData()

mapper_reg=registry(metadata=metadata)

kennel=Table(
    "kennel",
    mapper_reg.metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("kennel_name",String(100), unique = True),
)

dog=Table(
    "dog",
    mapper_reg.metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("dog_name",String(50)),
    Column("date_of_birth", DateTime),
    Column("breed",String(50)),
    Column("kennel_id", Integer, ForeignKey("kennel.id")),
    
)

runner=Table(
    "runner",
    mapper_reg.metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("runner_name",String(50)),
    Column("kennel_id", Integer, ForeignKey("kennel.id")),
    
)

dog_weigth_entry=Table(
    "weight_entry",
    mapper_reg.metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("timestamp", DateTime),
    Column("dog_age", Float),
    Column("weight",Float),
    Column("dog_id",Integer, ForeignKey("dog.id")),
)

weather_entry=Table(
    "weather_entry",
    mapper_reg.metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("timestamp", DateTime),
    Column("runner_name",String(50)),
    Column("kennel_id", Integer, ForeignKey("kennel.id")),


)

#what happens if dog2 is not set?
training_log=Table(
    "training_log",
    mapper_reg.metadata,
    Column("id",Integer,primary_key=True,autoincrement=True),
    Column("timestamp", DateTime),
    Column("runner_id", Integer, ForeignKey("runner.id")),
    Column("dog1_id", Integer, ForeignKey("dog.id")),
    Column("dog2_id",Integer, ForeignKey("dog.id")),
    Column("sport",String(50)),
    Column("location",String(50)),
    Column("distance",Float),
    Column("speed",Float),
    Column("pace",String(10)),
    Column("rating",Integer),
    Column("workout",Boolean)
)

def start_mappers():
    #map kennel object to the kennel table
    kennel_mapper=mapper_reg.map_imperatively(
        models.Kennel,
        kennel
    )

    dog_mapper=mapper_reg.map_imperatively(
        models.Dog,
        dog,
        properties={"kennel_name":relationship(models.Kennel)}
    )