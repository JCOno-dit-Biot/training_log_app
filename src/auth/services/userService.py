from fastapi.security import OAuth2PasswordRequestForm
from models.user import Users, UsersIn
from models.customResponseModel import SessionTokenResponse
from repositories.userRepository import UserRepository
from repositories.kennelRepository import KennelRepository



from passlib.context import CryptContext

import secrets

pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

class UserService():

    def __init__(self):
        self.userRepository = UserRepository()
        self.kennel_repo = KennelRepository()

    def get_all_kennels(self):
        kennel_list = self.kennel_repo.get_all()
        return kennel_list
    
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
    
    def reset_password(self, user: Users, old_password):
        if self.userRepository.is_password_correct(OAuth2PasswordRequestForm(username = user.email, password=old_password)):
            return self.userRepository.reset_password(user)
        return False
    
    def get_access_token(self, form_data: OAuth2PasswordRequestForm):
        if not self.userRepository.is_password_correct(form_data):
            return SessionTokenResponse(access_token=None)
        access_token = self.userRepository.get_access_token(form_data)
        return access_token
    
    def refresh_access_token(self, token: str, refresh_token: str):
        new_access_token = self.userRepository.refresh_access_token(token, refresh_token)
        if new_access_token is not None:
            new_access_token.refresh_token = refresh_token
        return new_access_token

    def get_refresh_token(self, username):
        return self.userRepository.get_refresh_token(username)

    def register_token_in_session(self, access_token: SessionTokenResponse):
        self.userRepository.register_token_in_session(access_token)

    # def authenticate_user(self, token: str):
    #     return self.repository.authenticate_user(token)
    
    def delete_all_active_session(self, username: str):
        self.userRepository.delete_all_active_session(username)
        
    def logout(self, token: str):
        self.userRepository.logout(token)