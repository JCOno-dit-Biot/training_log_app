from fastapi import Depends, APIRouter, Form, HTTPException
from fastapi_utils.cbv import cbv
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import ValidationError
from jwt.exceptions import PyJWTError
from services.userService import UserService

from models.user import UsersIn, Users
from models.customException import CustomValidationException
from models.customResponseModel import CustomResponseModel, SessionTokenResponse

user_controller_router = APIRouter()


@cbv(user_controller_router)
class UserController:
    
    def __init__(self):
        self.userService = UserService()

    @user_controller_router.post("/register")
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
                if err['loc'][0] == 'username':
                    raise CustomValidationException(
                        field = "email",
                        message = "Invalid format for registration information"
                    )
        
        except Exception as e:
            raise HTTPException(status_code = e.status_code, detail=str(e.detail))
        
    
    @user_controller_router.post("/token", response_model=SessionTokenResponse)
    def get_token(self, form_data: OAuth2PasswordRequestForm = Depends()):
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

            if access_token is None:
                raise HTTPException(status_code=400, detail = "Incorrect username or password")
            else:
                # generate refresh_token
                refresh_token = self.userService.get_refresh_token(form_data)
                if refresh_token is None:
                    raise HTTPException(status_code=400, detail = "Unable to generate refresh token")       
                access_token.refresh_token = refresh_token["refresh_token"]   
                # register the refresh token as active session
                self.userService.register_token_in_session(access_token)
            return SessionTokenResponse.model_validate(access_token)     
        except PyJWTError as decoding_error:
            raise HTTPException(status_code=401, detail = "Error during token registration process, token expired or invalid")         
        except Exception as e:
            raise HTTPException(status_code = e.status_code, detail=str(e.detail))
        

    # @user_controller_router.post("/refesh_token")
    # def refresh_token(self, token: str = Form(...), refresh_token: str = Form(...)):
    #     pass

    @user_controller_router.post("/logout")
    def logout(self, refresh_token: str):
        try:
            self.userService.logout(refresh_token)
        except Exception as e:
            raise HTTPException(status_code = e.status_code, detail=str(e.detail))

        