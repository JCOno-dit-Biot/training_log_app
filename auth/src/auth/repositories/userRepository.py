from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
import hashlib
import jwt
from jwt.exceptions import PyJWTError
import secrets
import os
from datetime import datetime, timedelta, timezone
from psycopg2.extras import RealDictCursor
from auth.repositories.IUserRepository import IUserRepository
from auth.models.customResponseModel import SessionTokenResponse
from auth.models.customException import TokenDecodeError
from auth.models.user import Users, UsersIn

from auth.utils import get_connection
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

class UserRepository(IUserRepository):

    def __init__(self):
        self.connection = get_connection()
    
    def create(self, user: UsersIn, password_hash, kennel_id): 
        with self.connection.cursor() as cur:
            # check if user email is already used
            cur.execute("""SELECT * FROM users WHERE username = %s""", (user.email,))
            usr = cur.fetchone()

            if usr is None:
                query = """
                INSERT INTO users (username, password_hash, kennel_id) VALUES (%s, %s, %s) RETURNING id
                """
                cur.execute(query, (user.email, password_hash, kennel_id,))
                user_id = cur.fetchone()[0]
                self.connection.commit()
                print(user_id)
                return user_id
            else:
                return False
            
    def reset_password(self, user: Users):
        with self.connection.cursor(cursor_factory = RealDictCursor) as cur:
            cur.execute("""
                            SELECT id, username FROM users WHERE username = %s 
                        """, (user.email,))
            usr = cur.fetchone()

            if usr is not None:
                cur.execute(""" UPDATE users SET password_hash = %s WHERE username = %s""",
                            (pwd_context.hash(user.password), user.email,))
                self.connection.commit()
                return user
            else:
                return None
        
    def get_access_token(self, form_data: OAuth2PasswordRequestForm = Depends()):
        access_token_expires = timedelta(minutes= int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60)))
        with self.connection.cursor(cursor_factory = RealDictCursor) as cur:
            cur.execute("""
                        SELECT id, kennel_id FROM users WHERE username = %s
                        """, (form_data.username,))
            result = cur.fetchone()
            if result is None:
                return SessionTokenResponse(access_token=None)
            else:
                kennel_id = result["kennel_id"]
                user_id = result["id"]
            access_token = self.create_access_token(
                data = {
                    "sub": form_data.username,
                    "user_id": user_id,
                    "kennel_id": kennel_id
                },
                expires_delta=access_token_expires
            )
            return access_token
            

    def create_access_token(self, data: dict, expires_delta): 
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode.update({'exp': expire})

        encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm = os.getenv("ALGORITHM"))

        return SessionTokenResponse(
            access_token= encoded_jwt,
            token_type = "bearer",
            expires_in = expires_delta.total_seconds()
        )

    def get_user(self, username: str): 
        with self.connection.cursor(cursor_factory = RealDictCursor) as cur:
            cur.execute("""SELECT username, password_hash FROM users WHERE username = %s""", (username,))
            user = cur.fetchone()
            
            if user is not None:
                return Users(
                    email = user["username"],
                    password= user["password_hash"]
                )
            
            return None

    def is_password_correct(self, form_data: OAuth2PasswordRequestForm = Depends()): 
        user = self.get_user(form_data.username)
        if user is None or not pwd_context.verify(form_data.password, user.password):
            return False
        return True

    def get_refresh_token(self, form_data: OAuth2PasswordRequestForm = Depends()):
        refresh_token = self.generate_refresh_token()
        return {'user': form_data.username, 'refresh_token': refresh_token}
    
    def generate_refresh_token(self) -> str:
        return secrets.token_hex(32)
    
    def hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    def authenticate_user(self, token: str) -> dict | None: 
        try:
            payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms = os.getenv("ALGORITHM"))
            username = payload.get('sub')
            kennel_id = payload.get('kennel_id')
            if username is None or kennel_id is None:
                return None
            else:
                return {'sub': payload['sub'], 'user_id': payload['user_id'], 'kennel_id': payload['kennel_id']}
        except PyJWTError as decoding_error:
             raise TokenDecodeError("Invalid or expired access token") from decoding_error 

    def register_token_in_session(self, token: SessionTokenResponse, refresh_token):
        try:
            payload = jwt.decode(token.access_token, os.getenv("SECRET_KEY"), algorithms = os.getenv("ALGORITHM"))
        
            username = payload.get("sub")
            if refresh_token is not None:
                hashed_token = self.hash_token(refresh_token)
            # Note: look at the case where refresh token is None

            refresh_token_expires = timedelta(days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")))
            refresh_token_expiry_date = datetime.now(timezone.utc) + refresh_token_expires

            with self.connection.cursor() as cur:
                cur.execute("""
                            INSERT INTO refresh_tokens (user_id, hashed_refresh_token, expires_on) VALUES ((SELECT id FROM users WHERE username = %s), %s, %s)
                            """, (username, hashed_token, refresh_token_expiry_date,))
                self.connection.commit()
        except PyJWTError as decoding_error:
            raise TokenDecodeError("Invalid access token") from decoding_error 
        
    def logout(self, refresh_token:str):
        with self.connection.cursor() as cur:
            cur.execute("""
                        DELETE FROM refresh_tokens WHERE hashed_refresh_token = %s
                        """, 
                        (self.hash_token(refresh_token),))
            self.connection.commit()
 
    def delete_all_active_session(self, username: str): pass

    def validate_refresh_token(self, username: str, refresh_token: str):
        hashed_token = self.hash_token(refresh_token)

        with self.connection.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT hashed_refresh_token, expires_on FROM refresh_tokens \
                        WHERE user_id = (SELECT id FROM users WHERE username = %s) AND hashed_refresh_token = %s
                        """, (username, hashed_token,))
            hashed_token_db = cur.fetchone()
            if hashed_token_db is not None:
                if hashed_token_db["expires_on"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
                    return False
                # check that the token corresponds to what is registered in db
                return hashed_token == hashed_token_db['hashed_refresh_token']
            else: 
                return False
        
    def refresh_access_token(self, token, refresh_token):
        try:
            # get user info from previous token, disable expiry check to get the user info
            payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms = os.getenv("ALGORITHM"), options={"verify_exp": False})
            username, user_id, kennel_id = payload.get('sub'), payload.get('user_id'), payload.get('kennel_id')

            # validate refresh_token
            if not self.validate_refresh_token(username, refresh_token):
                return None
            
            # generate new access_token
            access_token_expires =  timedelta(minutes= int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60)))

            new_access_token = self.create_access_token(
                data = {'sub': username, 'user_id': user_id, 'kennel_id': kennel_id}, expires_delta= access_token_expires
            )
            return new_access_token
        except PyJWTError as decoding_error:
            raise TokenDecodeError("Invalid access token") from decoding_error
            