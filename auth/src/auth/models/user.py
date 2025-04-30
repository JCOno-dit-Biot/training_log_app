from pydantic import BaseModel
from typing import Optional

class Users(BaseModel):
    email: str
    password: str

class UsersIn(Users):
    kennel_name: str # user inputs the kennel name, either for a dropdown or entry