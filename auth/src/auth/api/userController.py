import os
import logging

from fastapi import Depends, APIRouter, Form, HTTPException, Query, status, Response, Request
from fastapi_utils.cbv import cbv
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import ValidationError
from jwt.exceptions import PyJWTError
from auth.services.userService import UserService

from auth.models.user import UsersIn, Users
from auth.models.kennel import Kennel
from auth.models.customException import CustomValidationException, TokenDecodeError
from auth.models.customResponseModel import CustomResponseModel, SessionTokenResponse

user_controller_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/token")

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

@cbv(user_controller_router)
class UserController:
    
    def __init__(self, user_service: UserService = Depends()):
        self.userService = user_service

    @user_controller_router.get("/kennels", response_model=list[Kennel], status_code=status.HTTP_200_OK)
    def get_all_kennels(self):
        try:
            kennel_list = self.userService.get_all_kennels()
            return [Kennel.model_validate(kennel) for kennel in kennel_list]
        except Exception as e:
            raise HTTPException(status_code = e.status_code, detail=str(e.detail))
        
    @user_controller_router.post("/register", response_model=CustomResponseModel, status_code=status.HTTP_201_CREATED)
    def register(self, email: str = Form(...), password: str = Form(), kennel_name: str = Form(...)):
        ''' 
        Route to register new user, user must provide a kennel name from dropdown or enter a new kennel name
        '''
    
        try: 
            user = UsersIn(
                email = email,
                password = password,
                kennel_name = kennel_name
            )
            
            usr_id = self.userService.register(user)

            if usr_id is not False:
                return CustomResponseModel(status_code = 201, message = f"User {user.email} was succesfully registered")
            else:
                raise HTTPException(status_code=422, detail="User already exists")
        except ValidationError as validation_error:
            for err in validation_error.errors():
                if err['loc'][0] == 'email':
                    raise CustomValidationException(
                        field = "email",
                        message = "Invalid format for registration information"
                    )
        except HTTPException: 
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 
        
    @user_controller_router.post("/reset-password", response_model=CustomResponseModel, status_code=status.HTTP_200_OK)
    def reset_password(self, email: str = Form(...), old_password: str = Form(...), new_password: str = Form(...)):
        '''
        Route to reset user's password
        '''

        if not old_password.strip() or not new_password.strip():
            raise HTTPException(status_code=422, detail="Passwords cannot be empty strings or spaces only")
        
        try:         
            user_in = Users(
                email = email,
                password= new_password
            )
            user=self.userService.reset_password(user_in, old_password)
            if user is not None:
                if user == False:
                    raise HTTPException(status_code=401, detail=f"Old password for user {user_in.email} is incorrect")
                else:
                    return CustomResponseModel(
                        status_code=200,
                        message = f"Password for user {user.email} was reset successfully"
                    )
            else:
                raise HTTPException(status_code=404, detail = f"Could not find user {user_in.email}")
        except ValidationError as validation_error:
            for err in validation_error.errors():
                if err['loc'][0] == 'email':
                    raise CustomValidationException(
                        field = "email",
                        message = "Invalid format for registration information"
                    )
        except HTTPException: 
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 

    @user_controller_router.post("/token", response_model=SessionTokenResponse, status_code = 201)
    def get_token(self, response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
        ''' 
        Route to get a JWT and a refresh token. JWT expires on a short time scale, refresh tokens are long lived and can be used to regenerate a new JWT token.
        Refresh tokens should be kept securely
        '''
    
        try:
            # for validation purposes only
            user = Users(
                email = form_data.username,
                password = form_data.password,
            )
            # generate access token
            access_token = self.userService.get_access_token(form_data)

            if access_token.access_token is None:
                raise HTTPException(status_code=400, detail = "Incorrect username or password")
            else:
                # generate refresh_token
                refresh_token = self.userService.get_refresh_token(form_data)
                if refresh_token["refresh_token"] is None:
                    raise HTTPException(status_code=400, detail = "Unable to generate refresh token")       
                
                response.set_cookie(
                    key="refresh_token",
                    value=refresh_token["refresh_token"],
                    httponly=True,
                    secure= not (os.getenv("ENV") == "dev"),        # Only over HTTPS
                    samesite="strict",
                    max_age=7 * 24 * 60 * 60,  # 7 days
                    path="/auth"     # Optional: restrict to auth prefix (used in refresh-token and logout)
                )
                # register the refresh token as active session
                self.userService.register_token_in_session(access_token, refresh_token["refresh_token"])
            return SessionTokenResponse.model_validate(access_token)     
        except TokenDecodeError as decoding_error:
            raise HTTPException(status_code=401, detail = "Error during token registration process, token expired or invalid")         
        except HTTPException: 
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 
    
    @user_controller_router.post("/validate", status_code=status.HTTP_200_OK)
    def validate_token(self, payload: dict):
        token = payload.get("token")
        try:
            user_dict = self.userService.authenticate_user(token)
            if user_dict is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail = "User not found in token"
                )
            return user_dict
        except TokenDecodeError as decoding_error:
            raise HTTPException(status_code=401, detail = str(decoding_error))
        except HTTPException: 
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 

    @user_controller_router.post("/refresh-token", response_model=SessionTokenResponse, status_code=200)
    def refresh_token(self, request: Request, token=Depends(oauth2_scheme)):
        '''
        Route to renew JWT tokens that have expired
        '''
        refresh_token = request.cookies.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException( status_code=status.HTTP_401_UNAUTHORIZED, detail = 'Missing refresh token')
        try:
            access_token = self.userService.refresh_access_token(token, refresh_token)
            if access_token is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "Invalid refresh token")
            return SessionTokenResponse.model_validate(access_token)
        except HTTPException: 
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 
        
    @user_controller_router.post("/logout", status_code=200)
    def logout(self, refresh_token: str = Form(...)):
        try:
            self.userService.logout(refresh_token)
            return JSONResponse(content = "Success")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 

        