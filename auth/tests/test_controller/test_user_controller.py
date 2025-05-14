import pytest
from fastapi import HTTPException
from auth.models.customResponseModel import CustomResponseModel, SessionTokenResponse
from auth.models.customException import CustomValidationException, TokenDecodeError
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

def test_reset_password_bad_email_format(client, mock_user_service):
    with pytest.raises(CustomValidationException):
        client.post("/reset-password", data= {
            "email": 123,
            "old_password": "securepassword",
            "new_password": "new_securepassword"
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
    mock_user_service.get_refresh_token.return_value = {'refresh_token':'my_refresh_token'}
    mock_user_service.register_token_in_session.return_value = None # no return value

    response = client.post("/token", data =
                           {'username':'john@example.com',
                            'password': 'securepassword'})
   
    assert response.status_code == 201
    assert response.json()['access_token'] == 'my_jwt_token'
    
    cookies = response.cookies
    print(cookies.get("refresh_token"))

    assert "refresh_token" in cookies
    assert cookies.get("refresh_token") == "my_refresh_token"

    raw_set_cookie = response.headers.get("set-cookie")
    assert "HttpOnly" in raw_set_cookie
    assert "Secure" in raw_set_cookie
    assert "refresh_token=my_refresh_token" in raw_set_cookie


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

@pytest.mark.parametrize('error,code,detail',[
    (TokenDecodeError("bad token"), 401, "Error during token registration process, token expired or invalid"),
    (Exception("some internal server issue"), 500, "some internal server issue")
])
def test_get_access_token_raises(client, mock_user_service, error, code, detail):
    # Simulate the service raising TokenDecodeError when registering the session
    mock_user_service.register_token_in_session.side_effect = error

    response = client.post("/token", data={
        "username": "test@example.com",
        "password": "testpass"
    })

    # Assert
    assert response.status_code == code
    assert detail in response.json()["detail"]

@pytest.mark.parametrize('return_value,code',
                         [({'sub': 'john@example.com', 'kennel_id':1}, 200),
                         (None, 404)]
                         )
def test_validate_token(client, mock_user_service, return_value, code):
    mock_user_service.authenticate_user.return_value = return_value
    response = client.post("/validate", json={"token": "jwt_token"})
    assert response.status_code == code
    if code == 200:
        assert response.json().get('sub') == 'john@example.com'
        assert response.json().get('kennel_id') == 1

@pytest.mark.parametrize('error,code,detail',[
    (TokenDecodeError("Invalid or expired access token"), 401, "Invalid or expired access token"),
    (Exception("some internal server issue"), 500, "some internal server issue")
])
def test_validate_token_raises(client, mock_user_service, error, code, detail):
    mock_user_service.authenticate_user.side_effect = error
    response = client.post("/validate", json={"token": "jwt_token"})
    print(response.json()["detail"])
    assert response.status_code == code
    assert detail in response.json()["detail"]

def test_refresh_token(client, mock_user_service):
    mock_user_service.refresh_access_token.return_value = SessionTokenResponse(
        access_token = 'my_new_jwt'
    )
    response = client.post("/refresh-token", params =
                           {'token':'current_jwt',
                            'refresh_token': "my_refresh_token"})
    assert response.status_code == 200
    assert response.json()['access_token'] == 'my_new_jwt'
    
def test_refresh_token_invalid(client, mock_user_service):
    mock_user_service.refresh_access_token.return_value = None
    response = client.post("/refresh-token", params =
                           {'token':'current_jwt',
                            'refresh_token': "my_refresh_token"})
    assert response.status_code == 400
    assert response.json()['detail'] == "Invalid refresh token"

def test_logout(client, mock_user_service):
    mock_user_service.logout.return_value = {'content':'Success'}
    response = client.post("/logout", data = {'refresh_token': 'token'})
    assert response.status_code ==200