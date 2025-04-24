from abc import abstractmethod
from ..models.user import Users

class IUserRepository:
    @abstractmethod
    def register(self, user: Users): pass

    @abstractmethod
    def create_access_token(self, data: dict, expires_delta): pass

    @abstractmethod
    def get_user(self, username: str): pass
    
    @abstractmethod
    def is_password_correct(self, user: Users): pass

    @abstractmethod
    def get_access_token(self, user: Users): pass
     
    @abstractmethod
    def authenticate_user(self, token: str): pass

    @abstractmethod  
    def register_token_in_session(self, token: str): pass
    
    @abstractmethod
    def logout(self, token:str): pass
    
    # @abstractmethod
    # def is_session_active(self, username: str): pass
    
    # @abstractmethod
    # def get_access_token_from_active_session(self, username: str): pass

    @abstractmethod
    def delete_all_active_session(self, username: str): pass
