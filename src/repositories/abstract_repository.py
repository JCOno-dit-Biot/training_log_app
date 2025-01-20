import abc
from src import models

class abstract_repository(abc.ABC):

    @abc.abstractmethod
    def get_dog (self, dog_name: str):
        raise NotImplementedError
    
    @abc.abstractmethod
    def get_runner (self, runner_name: str):
        raise NotImplementedError
    
    @abc.abstractmethod
    def get_most_recent_weight_entry():
        raise NotImplementedError

    @abc.abstractmethod
    def get_latest_activity_entry():
        raise NotImplementedError

    @abc.abstractmethod
    def add_weight_entry(self, dog_weigth_entry: DogWeightEntry):
        raise NotImplementedError
    
    @abc.abstractmethod
    def add_activity_entry(self, training_entry: models.Training_Log):
        raise NotImplementedError