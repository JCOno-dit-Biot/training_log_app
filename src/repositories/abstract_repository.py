import abc
from src import models
from typing import List

class abstract_repository(abc.ABC):

    @abc.abstractmethod
    def get_by_name(self, name: str):
        raise NotImplementedError

    @abc.abstractmethod
    def get_all(self) -> List:
        raise NotImplementedError
    
    @abc.abstractmethod
    def create(self, obj):
        raise NotImplementedError

    @abc.abstractmethod
    def delete(self, id: int):
        pass
