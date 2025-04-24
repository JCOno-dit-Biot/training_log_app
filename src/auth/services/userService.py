from ..models.user import Users, UsersIn
from ..repositories.userRepository import UserRepository
from ..repositories.kennelRepository import KennelRepository



from passlib.context import CryptContext

import secrets

pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

class UserService():

    def __init__(self):
        self.userRepository = UserRepository()
        self.kennelRepository = KennelRepository()

    def register(self, user: UsersIn):
        # Try to find existing kennel
        kennel_id = self.kennel_repo.get_by_name(user.kennel_name)

        if not kennel_id:
            # If not found, create it
            kennel_id = self.kennel_repo.create(user.kennel_name)

        password_hash = pwd_context.hash(user.password)

        #create user
        user_id = self.userRepository.create(user, password_hash, kennel_id)

        return user_id
    
    def get_access_token(self, user: Users):
        if not self.userRepository.is_password_correct(user):
            return None
        access_token = self.repository.get_access_token(user)
        return access_token
    
    def authenticate_user(self, token: str):
        return self.repository.authenticate_user(token)
    
    def register_token_in_session(self, token: str):
        self.repository.register_token_in_session(token)

    def is_session_active(self, username: str):
        return self.repository.is_session_active(username)
    
    def delete_all_active_session(self, username: str):
        self.repository.delete_all_active_session(username)
        
    def logout(self, token: str):
        self.repository.logout(token)