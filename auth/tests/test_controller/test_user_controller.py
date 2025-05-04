import pytest
from fastapi import HTTPException
from auth.models.customResponseModel import CustomResponseModel, SessionTokenResponse
from auth.models.customException import CustomValidationException
from auth.models.user import Users
from auth.models.kennel import Kennel

def test_get_all_kennels(client, mock_user_service):
    mock_user_service.get_all_kennels.return_value = [Kennel(name = 'test')]
    response = client.get("/kennels")
    mock_user_service.get_all_kennels.assert_called_once()
    assert response.status_code == 200

@pytest.mark.parametrize('service_return,expected_code',[
    (123, 201),
    (False, 422)
])
def test_register_success(client, mock_user_service, service_return, expected_code):
    mock_user_service.register.return_value = service_return

    response = client.post("/register", data={
        "email": "john@example.com",
        "password": "securepassword",
        "kennel_name": "Wolfpack"
    })
    assert response.status_code == expected_code
    if response.status_code == 201:
        assert "User john@example.com was succesfully registered" in response.json()['message']
    mock_user_service.register.assert_called_once()

def test_register_bad_email_format(client, mock_user_service):
    with pytest.raises(CustomValidationException):
        client.post("/register", data={
            "email": 123,
            "password": "securepassword",
            "kennel_name": "Wolfpack"
        })

def test_reset_password_success(client, mock_user_service):
    mock_user_service.reset_password.return_value = Users(email = 'john@example.com', password='password')
    
    response = client.post("/reset-password", data={
            "email": 'john@example.com',
            "old_password": "securepassword",
            "new_password": "new_securepassword"
            })
    assert response.status_code == 200
    assert "Password for user john@example.com was reset successfully" in response.json()['message']
    mock_user_service.reset_password.assert_called_once()

def test_reset_bad_password(client, mock_user_service):
    mock_user_service.reset_password.return_value = False
    
    response = client.post("/reset-password", data={
            "email": 'john@example.com',
            "old_password": "securepassword",
            "new_password": "new_securepassword"
            })
    assert response.status_code == 401
    assert "Old password for user john@example.com is incorrect" in response.json()['detail']

@pytest.mark.parametrize('oldpassword,newpassword',[
    ('','newpassword'),
    ('oldpassword', ''),
    ('    ', 'new_password'),
    ('oldpassword', '  ')
])
def test_reset_password_empty_string(client, oldpassword, newpassword):
    response = client.post("/reset-password", data={
        "email": 'john@example.com',
        "old_password": oldpassword,
        "new_password": newpassword
        })
    print(response.json())
    assert response.status_code == 422
    assert "cannot be empty" in str(response.json()['detail'])

def test_get_access_token(client, mock_user_service):
    mock_user_service.get_access_token.return_value = SessionTokenResponse(
        access_token = 'my_jwt_token'
    )
    mock_user_service.get_refresh_token.return_value = { 'refresh_token':'my_refresh_token'}
    mock_user_service.register_token_in_session.return_value = None # no return value

    response = client.post("/token", data =
                           {'username':'john@example.com',
                            'password': 'securepassword'})
   
    assert response.status_code == 201
    assert response.json()['access_token'] == 'my_jwt_token'
    assert response.json()['refresh_token'] == 'my_refresh_token'

@pytest.mark.parametrize('access_token,refresh_token,code, message', [
    (None, 'refresh_token', 400, "Incorrect username or password"),
    ("jwt_token", None, 400,"Unable to generate refresh token")
])
def test_get_access_token_fails(client, mock_user_service, access_token, refresh_token, code, message):
    mock_user_service.get_access_token.return_value = SessionTokenResponse(
        access_token = access_token
    )
    mock_user_service.get_refresh_token.return_value = { 'refresh_token':refresh_token}
    mock_user_service.register_token_in_session.return_value = None # no return value

    response = client.post("/token", data =
                           {'username':'john@example.com',
                            'password': 'securepassword'})
    
    assert response.status_code == code
    assert response.json()['detail'] == message

def test_refresh_token(client, mock_user_service):
    mock_user_service.refresh_access_token.return_value = SessionTokenResponse(
        access_token = 'my_new_jwt'
    )
    response = client.post("/refresh-token", params =
                           {'token':'current_jwt',
                            'refresh_token': "my_refresh_token"})
    assert response.status_code == 200
    assert response.json()['access_token'] == 'my_new_jwt'
    


def test_logout(client, mock_user_service):
    mock_user_service.logout.return_value = {'content':'Success'}
    response = client.post("/logout", data = {'refresh_token': 'token'})
    assert response.status_code ==200