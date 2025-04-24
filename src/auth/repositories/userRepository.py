from abc import abstractmethod
from ..models.user import Users, UsersIn

from utils import get_connection

class UserRepository:

    def __init__(self):
        self.connection = get_connection()
    
    def create(self, user: UsersIn, password_hash, kennel_id): 
        with self.connection.cursor() as cur:
            # check if user email is already used
            cur.execute(""" SELECT * FROM users WHERE username = %s""", (user.username,))
            usr = cur.fetchone()

            if usr is None:
                query = """
                INSERT INTO users (username, password_hash, kennel_id) VALUES (%s, %s, %s) RETURNING id
                """
                user_id = cur.execute(query (user.username, password_hash, kennel_id,))
                self.connection.commit()
                return user_id
            else:
                return False


    def create_access_token(self, data: dict, expires_delta): pass


    def get_user(self, username: str): pass
    

    def is_password_correct(self, user: Users): pass


    def get_access_token(self, user: Users): pass
     

    def authenticate_user(self, token: str): pass

   
    #def register_token_in_session(self, token: str): pass
    

    def logout(self, token:str): pass

 
    def delete_all_active_session(self, username: str): pass
