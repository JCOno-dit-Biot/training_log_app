from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, clear_mappers

from datetime import datetime
import pandas as pd
import os
from dotenv import load_dotenv

from src.orm import mapper_reg, start_mappers
import src.repository as repository
import src.models as models
from src.controller import Controller

from pathlib import Path

dotenv_path=os.path.join(Path().absolute(),"config/.env")
load_dotenv(dotenv_path)


DATABASE_URI = 'postgresql+psycopg2://'+\
                os.getenv("POSTGRES_USER_NAME")+':'+\
                os.getenv("POSTGRES_PWD")+'@'+\
                os.getenv("POSTGRES_HOSTNAME")+':'+\
                os.getenv("POSTGRES_PORTID")+'/'+\
                os.getenv("POSTGRES_DB_NAME")


def setup_sessionmakeSQL():
    engine=create_engine(DATABASE_URI)
    mapper_reg.metadata.create_all(engine)
    clear_mappers()
    start_mappers()
    return sessionmaker(bind=engine)

def add_new_weight_entry(session):

    #find latest entry
    pass







def main():
    try:
        session_pool = setup_sessionmakeSQL()
    except Exception as e:
        print(e)

    luna_weight_df=pd.read_csv('/Users/jcono-dit-biot/Documents/Python/Python_repos/data_csv/lunaweight.csv')
  

    luna_weight_df['Date']=pd.to_datetime(luna_weight_df['Date'],dayfirst=True).dt.strftime('%Y/%m/%d')
    
    if session_pool:
        with session_pool() as session:
           
            controller = Controller(repository.sql_alchemy_repository(session))

            dog = controller.get_dog('Luna')
            

            for index, rows in luna_weight_df.iterrows():
             
                weight_entry=models.Dog_Weight(dog, rows['Date'], rows['Weight (lbs)'])
                
                if index > 0:
                    controller.add_weight_entry(weight_entry)


if __name__=="__main__":
    main()