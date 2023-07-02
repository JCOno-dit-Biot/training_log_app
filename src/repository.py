import abc

from src import models
from . import models

class abstract_repository(abc.ABC):

    @abc.abstractmethod
    def get_dog (self, dog_name: str):
        raise NotImplementedError
    
    @abc.abstractmethod
    def get_runner (self, dog:models.Dog):
        raise NotImplementedError
    
    @abc.abstractmethod
    def add_weight_entry(self, dog_weigth_entry: models.Dog_Weight):
        raise NotImplementedError


#sql alchemy implementation of the repository

class sql_alchemy_repository(abstract_repository):

    def __init__ (self, session):
        self.session=session

    def get_dog (self, dog_name):
        dog = self.session.query(models.Dog).filter_by(dog_name = dog_name).first()
        if dog:
            return dog
        else:
            raise ValueError(f"No dog entry for {dog_name}")
    
    def get_runner (self,runner_name):
        runner = self.session.query(models.Runner).filter_by(runner_name = runner_name).first()

        if runner:
            return runner
        else:
            raise ValueError(f"No runner entry for {runner_name}")

    def add_weight_entry(self, dog_weigth_entry: models.Dog_Weight):
        self.session.add(dog_weigth_entry)
        self.session.commit()

    def add_training_entry(self, training_entry: models.Training_Log):
        self.session.add(training_entry)
        self.session.commit()

        #should make sure that runners and dogs are not added multiple times

