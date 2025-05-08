import pytest
from unittest.mock import MagicMock
def test_get_all_kennels(user_service, mock_kennel_repo):
    mock_kennel_repo.get_all.return_value = ['test kennel', 'wolfpack']
    kennel_list = user_service.get_all_kennels()
    assert len(kennel_list) == 2
    mock_kennel_repo.get_all.assert_called_once()

def test_register(user_service, mock_kennel_repo, mock_user_repo):
    mock_kennel_repo.get_by_name.return_value = 12
    mock_user_repo.create.return_value = 1
    user =  MagicMock()
    user.password = 'password'
    user_id = user_service.register(user)
    assert user_id == 1
    mock_kennel_repo.get_by_name.assert_called_once()
    mock_user_repo.create.assert_called_once()

def test_register_unknown_kennel(user_service, mock_kennel_repo, mock_user_repo):
    mock_kennel_repo.get_by_name.return_value = None
    mock_kennel_repo.create.return_value = 3
    mock_user_repo.create.return_value = 2
    user =  MagicMock()
    user.password = 'password'
    user_id = user_service.register(user)
    assert user_id == 2
    mock_kennel_repo.get_by_name.assert_called_once()
    mock_kennel_repo.create.assert_called_once()
    mock_user_repo.create.assert_called_once()


def test_reset_password(user_service, mock_user_repo):
    mock_user_repo.is_password_correct.return_value = True
    user = MagicMock()
    user_return = user_service.reset_password(user, 'old_passwrod')
    mock_user_repo.is_password_correct.assert_called_once()

def test_reset_password_wrong_password(user_service, mock_user_repo):
    mock_user_repo.is_password_correct.return_value = False
    user = MagicMock()
    user_return = user_service.reset_password(user, 'old_passwrod')
    assert user_return == False
    mock_user_repo.is_password_correct.assert_called_once()

def test_authenticate_user(user_service, mock_user_repo):
    mock_user_repo.authenticate_user.return_value = {}
    user_service.authenticate_user('my_token')
    mock_user_repo.authenticate_user.assert_called_once()

@pytest.mark.parametrize('mock_return_password, mock_return_access_token, expected', [
    (True, MagicMock(access_token = 'valid_token'), MagicMock(access_token = 'valid_token')),
    (False, None, MagicMock(access_token = None))])
def test_get_access_token(mock_user_repo, user_service, mock_return_password, mock_return_access_token, expected):
    mock_user_repo.is_password_correct.return_value = mock_return_password
    mock_user_repo.get_access_token.return_value = mock_return_access_token
    token = user_service.get_access_token(MagicMock())
    assert token.access_token == expected.access_token

def test_refresh_token(user_service, mock_user_repo):
    mock_user_repo.refresh_access_token.return_value = MagicMock(access_token = 'my_new_access_token')
    token = user_service.refresh_access_token('jwt', 'refresh-token')
    assert token.access_token == 'my_new_access_token'
    mock_user_repo.refresh_access_token.assert_called_once()

def test_refresh_token_fails(user_service, mock_user_repo):
    mock_user_repo.refresh_access_token.return_value = None
    token = user_service.refresh_access_token('jwt', 'refresh-token')
    assert token is None
    mock_user_repo.refresh_access_token.assert_called_once()


def test_get_refresh_token(mock_user_repo, user_service):
    mock_user_repo.get_refresh_token.return_value = {'user':'john@example.com', 'refresh_token': 'my_refresh_token'}
    token_dict = user_service.get_refresh_token('john@example.com')
    mock_user_repo.get_refresh_token.assert_called_once()
    assert token_dict['user'] == 'john@example.com'
    assert token_dict['refresh_token'] == 'my_refresh_token'

def test_register_token_in_session(user_service, mock_user_repo):
    token = MagicMock()
    user_service.register_token_in_session(token)
    mock_user_repo.register_token_in_session.assert_called_once()

def test_delete_all_active_session(user_service, mock_user_repo):
    user_service.delete_all_active_session('john@example.com')
    mock_user_repo.delete_all_active_session.assert_called_once()

def test_logout(user_service, mock_user_repo):
    user_service.logout('jwt_token')
    mock_user_repo.logout.assert_called_once()