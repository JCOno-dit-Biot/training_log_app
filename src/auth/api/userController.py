from fastapi import Depends, APIRouter, Form, HTTPException
from fastapi_utils.cbv import cbv
from pydantic import ValidationError

from ..services.userService import UserService

from ..models.user import UsersIn
from models.customException import CustomValidationException
from models.customResponseModel import CustomResponseModel

user_controller_router = APIRouter()


@cbv(user_controller_router)
class UserController:
    
    def __init__(self):
        self.userService = UserService()

    @user_controller_router.post("/register")
    def register(self, email: str = Form(...), password: str = Form(), kennel_name: str = Form(...)):

        try: 
            user = UsersIn(
                email = email,
                password = password,
                kennel_name = kennel_name
            )
            usr_id = self.userService.register(user)

            if usr_id is not False:
                return ResponseModel(status_code = 201, message = f"User {user.username} was succesfully registered")
            else:
                raise HTTPException(status_code=422, detail="User already exists")
        except ValidationError: 
            # look into custom exception for more detailed info
            raise ValidationError("Invalid format for registration information")
        
        except Exception as e:
            raise HTTPException(status_code = e.status_code, detail=str(e.detail))
        
        