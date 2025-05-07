from pydantic import BaseModel, EmailStr
from typing import Optional

class Users(BaseModel):
    email: EmailStr
    password: str

class UsersIn(Users):
    kennel_name: str # user inputs the kennel name, either for a dropdown or entry