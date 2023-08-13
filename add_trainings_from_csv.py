from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, clear_mappers

from datetime import datetime
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

from ingest_weight_from_csv import setup_sessionmakeSQL
import src.repository as repository
import src.models as models
from src.controller import Controller

from pathlib import Path

dotenv_path=os.path.join(Path().absolute(),"config/.env")
load_dotenv(dotenv_path)

def create_training_object(row):

    #check humidity column

    if row['Humidity']:
        humidity = int(row['Humidity'].rstrip('%'))
    else:
        humidity = None

        
    
    training_entry = models.Training_Log(row['timestamp'],
                        row['T'], #temperature
                        humidity, #humitdity
                        models.Dog(str(row['Dog 1']), datetime.now(), 'unknown', 'unknown'), #dogs are initialized just with names and then updated based on database entry
                        models.Dog(str(row['Dog 1']), datetime.now(), 'unknown', 'unknown'),
                        row['Sport'],
                        models.Runner(str(row['Runner']), 'unknown'),
                        row['Location'],
                        row['Distance (Total)'],
                        row['rating (out of 5)'],
                        speed = row['average speed'],
                        pace = row['average pace'],
                        workout = bool(row['workout']),
                        sky_condition=row['Weather']
                    )
    
    return training_entry

    

def main():
    try:
        session_pool = setup_sessionmakeSQL()
    except Exception as e:
        print(e)

    #use column date and time to create a timestamp column
    training_df = pd.read_csv('/Users/jcono-dit-biot/Documents/Python/Python_repos/dog_training_log.csv', parse_dates={'timestamp': ['Date', 'Time']})
    training_df['timestamp'] = pd.to_datetime(training_df['timestamp'])#.dt.strftime('%Y-%m-%d %I:%M %p')

    training_df['average pace'] = pd.to_datetime(training_df['average pace'], format = '%M:%S').dt.strftime('%H:%M:%S')
    training_df['average speed'] = training_df['average speed'].str.replace(',', '.').astype('float')

    training_df['Distance (Total)'] = training_df['Distance (Total)'].str.replace(',', '.').astype('float')
    training_df =  training_df.replace({np.nan: None})

    if session_pool:
        with session_pool() as session:
            #initialize controller
            controller = Controller(repository.sql_alchemy_repository(session))

            for index, rows in training_df.iterrows():

                
                #initialize training log entries
                training_entry = create_training_object(rows)

                #update training log with database info
                dog1 = controller.get_dog(training_entry.dog1_name.dog_name)
                training_entry.dog1_name = dog1

                if training_entry.dog2_name:
                    dog2 = controller.get_dog(training_entry.dog2_name.dog_name)
                    training_entry.dog2_name = dog2

                runner = controller.get_runner(training_entry.runner_name.runner_name.replace(" ",""))
                training_entry.runner_name = runner

                #save to database
                controller.add_training_entry(training_entry)
            
            

            








            
    


if __name__ == "__main__":
    main()