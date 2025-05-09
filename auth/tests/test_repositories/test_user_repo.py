import pytest
import os
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, timezone, datetime
import jwt
import hashlib
import secrets
from unittest.mock import patch

from auth.models.user import Users, UsersIn
from auth.repositories.userRepository import UserRepository
from auth.models.customResponseModel import SessionTokenResponse
from auth.models.customException import TokenDecodeError

pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

@pytest.fixture()
def user_repo():
    return UserRepository()

@pytest.fixture()
def test_user():
    return UsersIn(
        email = 'john.doe@domain.com',
        password= 'password',
        kennel_name='test kennel'
    )

@pytest.fixture()
def test_OAuth_form():
    return OAuth2PasswordRequestForm(username='john.doe@domain.com', password='password')

@pytest.fixture
def refresh_token():
    return "fake_refresh_token"

@pytest.fixture
def insert_valid_refresh_token(user_repo, refresh_token):
    refresh_token = secrets.token_hex(32)  
    hashed = user_repo.hash_token(refresh_token)
    with user_repo.connection.cursor() as cur:
        cur.execute("""
            INSERT INTO refresh_tokens (user_id, hashed_refresh_token, expires_on)
            VALUES ((SELECT id FROM users WHERE username = %s), %s, %s)
        """, (
            'john@domain.com',
            hashed,
            datetime.now(timezone.utc) + timedelta(days=1),
        ))
        user_repo.connection.commit()
    return refresh_token

@pytest.fixture(autouse=True)
def cleanup_refresh_tokens(user_repo):
    ''' Clean up refresh token created by fixture '''
    with user_repo.connection.cursor() as cur:
        cur.execute("DELETE FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE username = %s)", ('john@domain.com',))
        user_repo.connection.commit()


def test_create_new_user(user_repo, test_user):
    user_id = user_repo.create(test_user, 'hashed_password', 1)
    assert user_id is not False
    assert isinstance(user_id, int)

def test_create_user_exists(user_repo):
    user_id = user_repo.create(
        UsersIn(
            email = 'john@domain.com',
            password= 'password',
            kennel_name='test kennel'),
            'hashpassword',
            1
    )
    assert user_id == False

def test_reset_password(user_repo):
    user = Users(email = 'john.doe@domain.com', password = 'new_password')
    usr = user_repo.reset_password(user)
    assert usr is not None
    with user_repo.connection.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE username = %s", (user.email,))
        result = cur.fetchone()
    assert pwd_context.verify(user.password,result[3])

def test_reset_password_user_not_exist(user_repo):
    user = Users(email = 'johndoe@domain.com', password = 'new_password')
    usr = user_repo.reset_password(user)
    assert usr is None


def test_get_access_token(user_repo, test_OAuth_form):
    token = user_repo.get_access_token(test_OAuth_form)
    assert isinstance(token, SessionTokenResponse)
    assert token.access_token is not None
    # this test does not check the info in the JWT as this is perfomed in
    # the following tests

def test_get_access_token_undefined_user(user_repo):
    form = OAuth2PasswordRequestForm(username = 'not_a_user', password = 'pass')
    token = user_repo.get_access_token(form)
    assert isinstance(token, SessionTokenResponse)
    assert token.access_token is None

def test_create_access_token(user_repo):
    data = {'sub': 'john.doe@domain.com', 'kennel_id': 1}
    expires = timedelta(minutes = 60)
    token = user_repo.create_access_token(data, expires)
    decoded_jwt = jwt.decode(token.access_token, os.getenv("SECRET_KEY"), algorithms = os.getenv("ALGORITHM"))
    assert isinstance(token, SessionTokenResponse)
    assert token.token_type == "bearer"
    assert token.expires_in == 3600
    assert decoded_jwt['sub'] == 'john.doe@domain.com'
    assert decoded_jwt['kennel_id'] == 1
    
def test_get_user(user_repo):
    user = user_repo.get_user('john@domain.com')
    assert isinstance(user, Users)
    assert user.email == 'john@domain.com'


def test_is_password_correct(test_OAuth_form, user_repo):
    user_id = user_repo.create(UsersIn(
            email = 'john.doe@example.com',
            password='example_test',
            kennel_name='test kennel'
        ),
        pwd_context.hash('example_test'),
        1
    )
    assert user_id is not False
    password_verify = user_repo.is_password_correct(
        form_data=OAuth2PasswordRequestForm(
            username = 'john.doe@example.com',
            password='example_test'
        )
    )
    assert password_verify == True

@pytest.mark.parametrize("user,password,expected", [
    ("john.doe@example.com", "wrong_password", False),
    ('user@domain.com', "test", False)
])
def test_wrong_password(user_repo, user, password, expected):
    password_verify = user_repo.is_password_correct(
        form_data=OAuth2PasswordRequestForm(
            username = user,
            password = password
        )
    )
    assert password_verify == expected

def test_get_refresh_token(user_repo,test_OAuth_form):
    refresh_token = user_repo.get_refresh_token(test_OAuth_form)
    assert isinstance(refresh_token, dict)
    assert "user" in refresh_token
    assert "refresh_token" in refresh_token

def test_generate_refresh_token(user_repo):
    token = user_repo.generate_refresh_token()
    assert isinstance(token, str)
    assert len(token) == 64
    int(token, 16)

def test_hash_token(user_repo):
    token = "test-token"
    expected = hashlib.sha256(token.encode()).hexdigest()

    assert user_repo.hash_token(token) == expected

def test_authenticate_user(user_repo):
    data = {'sub': 'john.doe@domain.com', 'kennel_id': 1}
    expires_delta = timedelta(minutes = 60)
    expire = datetime.now(timezone.utc) + expires_delta
    data.update({'exp': expire})
    encoded_jwt = jwt.encode(data, os.getenv("SECRET_KEY"), algorithm = os.getenv("ALGORITHM"))
    user_dict = user_repo.authenticate_user(encoded_jwt)
    assert user_dict['sub'] == 'john.doe@domain.com'
    assert user_dict['kennel_id'] == 1

def test_authenticate_user_no_user(user_repo):
    data = {'kennel_id': 1}
    expires_delta = timedelta(minutes = 60)
    expire = datetime.now(timezone.utc) + expires_delta
    data.update({'exp': expire})
    encoded_jwt = jwt.encode(data, os.getenv("SECRET_KEY"), algorithm = os.getenv("ALGORITHM"))
    user_dict = user_repo.authenticate_user(encoded_jwt)
    assert user_dict == None

def test_authenticate_user_expired_token(user_repo):
    data = {'sub': 'john.doe@domain.com', 'kennel_id': 1}
    expires_delta = timedelta(minutes = 10)
    expire = datetime.now(timezone.utc) - expires_delta
    data.update({'exp': expire})
    encoded_jwt = jwt.encode(data, os.getenv("SECRET_KEY"), algorithm = os.getenv("ALGORITHM"))
    with pytest.raises(TokenDecodeError) as exc_info:
        user_dict = user_repo.authenticate_user(encoded_jwt)

    assert str(exc_info.value) == "Invalid or expired access token"
    

def test_register_token_in_session(user_repo):
    user = 'john@domain.com'
    token = user_repo.create_access_token(
        data={'sub': 'john@domain.com', 'kennel_id': 1},
        expires_delta=timedelta(minutes=60)
    )
    token.refresh_token = user_repo.generate_refresh_token()

    user_repo.register_token_in_session(token)

    with user_repo.connection.cursor() as cur:
        cur.execute("SELECT * FROM refresh_tokens WHERE user_id = \
                    (SELECT id FROM users WHERE username = %s)", (user,))
        result = cur.fetchone()
    
    assert result is not None
    assert result[0] == 1

def test_decode_token_raises_token_decode_error(user_repo):
    token = SessionTokenResponse(access_token="fake.jwt.token")

    with patch("auth.repositories.userRepository.jwt.decode", side_effect=jwt.PyJWTError("bad token")):
        with pytest.raises(TokenDecodeError) as exc_info:
            user_repo.register_token_in_session(token)
        assert "Invalid access token" in str(exc_info.value)
        assert isinstance(exc_info.value.__cause__, jwt.PyJWTError)

def test_logout(user_repo, insert_valid_refresh_token):
    user_repo.logout(insert_valid_refresh_token)
    with user_repo.connection.cursor() as cur:
        cur.execute("SELECT * FROM refresh_tokens WHERE hashed_refresh_token = %s", 
                        (user_repo.hash_token(insert_valid_refresh_token),))
        result = cur.fetchone()

    assert result is None
    

def test_validate_refresh_token(user_repo, insert_valid_refresh_token):
    valid_token = user_repo.validate_refresh_token('john@domain.com', insert_valid_refresh_token)
    assert valid_token == True


def test_validate_refresh_token_wrong_token(user_repo, insert_valid_refresh_token):
    # pass in the wrong refresh token
    valid_token = user_repo.validate_refresh_token('john@domain.com', 'wrong_fake_refresh_token')
    assert valid_token == False

def test_validate_refresh_token_expired(user_repo, insert_valid_refresh_token):
    hashed = user_repo.hash_token(insert_valid_refresh_token)
    # artificially make the token expired
    with user_repo.connection.cursor() as cur:
        cur.execute("UPDATE refresh_tokens SET expires_on = %s WHERE hashed_refresh_token = %s",
                    (datetime.now(timezone.utc) - timedelta(days = 1), hashed,)
                    )
    
    valid_token = user_repo.validate_refresh_token('john@domain.com', insert_valid_refresh_token)
    assert valid_token == False

def test_refresh_access_token(user_repo, insert_valid_refresh_token):
    data = {'sub': 'john@domain.com', 'kennel_id': 1}
    token = user_repo.create_access_token(data, timedelta(minutes=60))
    assert token is not None
    new_access_token = user_repo.refresh_access_token(token.access_token, insert_valid_refresh_token)
    assert new_access_token is not None
    payload = jwt.decode(new_access_token.access_token, os.getenv("SECRET_KEY"), algorithms = os.getenv("ALGORITHM"))
    assert payload.get('sub') == 'john@domain.com'
    assert payload.get('kennel_id') == 1

def test_refresh_token_invalid(user_repo, insert_valid_refresh_token):
    data = {'sub': 'john@domain.com', 'kennel_id': 1}
    token = user_repo.create_access_token(data, timedelta(minutes=60))
    assert token is not None
    new_access_token = user_repo.refresh_access_token(token.access_token, 'bad_token')
    assert new_access_token is None

def test_refresh_token_with_expired_jwt(user_repo, insert_valid_refresh_token):
    data = {'sub': 'john@domain.com', 'kennel_id': 1}
    expires_delta = timedelta(minutes = 10)
    expire = datetime.now(timezone.utc) - expires_delta
    data.update({'exp': expire})
    token = jwt.encode(data, os.getenv("SECRET_KEY"), algorithm = os.getenv("ALGORITHM"))
    new_access_token = user_repo.refresh_access_token(token, insert_valid_refresh_token)
    assert new_access_token is not None
    payload = jwt.decode(new_access_token.access_token, os.getenv("SECRET_KEY"), algorithms = os.getenv("ALGORITHM"))
    assert payload.get('sub') == 'john@domain.com'
    assert payload.get('kennel_id') == 1


def test_decode_token_raises_token_decode_error_in_refresh_access_token(user_repo):
    token = SessionTokenResponse(access_token="fake.jwt.token")

    with patch("auth.repositories.userRepository.jwt.decode", side_effect=jwt.PyJWTError("bad token")):
        with pytest.raises(TokenDecodeError) as exc_info:
            user_repo.refresh_access_token(token.access_token, 'refresh_token')
        assert "Invalid access token" in str(exc_info.value)
        assert isinstance(exc_info.value.__cause__, jwt.PyJWTError)