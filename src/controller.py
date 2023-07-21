import src.repository as repository
from . import models

class Controller:

    def __init__(self, repo: repository.abstract_repository):
        self.repo=repo

    def get_dog (self, dog_name: str):
        return self.repo.get_dog(dog_name)
    
    def get_runner (self, runner_name):
        return self.repo.get_runner(runner_name)
    
    def get_most_recent_weight_entry(self, dog_name):
        return self.repo.get_most_recent_weight_entry(dog_name)
    
    def add_weight_entry(self, dog_weigth_entry: models.Dog_Weight):
        self.repo.add_weight_entry(dog_weigth_entry)
    
    def add_training_entry(self, training_entry: models.Training_Log):
        self.repo.add_training_entry(training_entry)