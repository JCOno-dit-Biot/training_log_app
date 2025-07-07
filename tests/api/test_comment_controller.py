import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from src.api.comment_controller import router as comment_router
from src.repositories.comment_repository import comment_repository
from src.models.comment import commentCreate, commentOut
from datetime import datetime


@pytest.fixture
def mock_repo():
    mock = Mock(spec=comment_repository)
    mock.get_all.return_value = [commentOut(
        id = 0, username= 'john@domain.com', activity_id = 1, comment = "Mock comment 1", created_at= datetime.now()
    ),
    commentOut(
        id = 1, username= 'john.doe@domain.com', activity_id = 1, comment = "Mock comment 2", created_at= datetime.now()
    )
    ]
    mock.create.return_value = 3

    return mock

@pytest.fixture
def test_app(mock_repo):
    app = FastAPI()

    # Override the repository dependency
    def override_repo():
        return mock_repo

    #even though kennel id is not needed, the route is behind jwt so this is tested here
    async def fake_jwt_verify(request: Request):
        request.state.kennel_id = 1
        request.state.user_id = 2

    from src.deps import get_comment_repo, verify_jwt
    app.dependency_overrides[get_comment_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(comment_router, dependencies=[Depends(verify_jwt)])

    return app

def test_get_comments_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/activities/1/comments")

    assert response.status_code == 200
    assert commentOut(**response.json()[0]).comment == "Mock comment 1"
    mock_repo.get_all.assert_called_once()
    mock_repo.get_all.assert_called_with(1)


def test_create_comment(test_app, mock_repo):
    client = TestClient(test_app)

    payload = {
            "activity_id": 2,
            "comment": "insert comment"
        }
    
    response = client.post(url="/activities/2/comments", json = payload)
    assert response.status_code == 200
    assert response.json()==3
    mock_repo.create.assert_called_once()
    mock_repo.create.assert_called_with(commentCreate(activity_id=2, user_id=2, comment='insert comment'))


def test_delete_comment(test_app, mock_repo):
    client = TestClient(test_app)

    client.delete("/activities/2/comments/3")
    mock_repo.delete.assert_called_once()
    mock_repo.delete.assert_called_with(3, 2)

def test_update_comment(test_app, mock_repo):
    client = TestClient(test_app)

    payload = {
        "activity_id": 2,
        "username": "john@domain.com",
        "comment": "Updated comment text"
    }


    client.put("/activities/2/comments/10", json = payload)
    mock_repo.update.assert_called_once()
    mock_repo.update.assert_called_with(commentCreate(**payload), 10)

@pytest.mark.parametrize('error,code,detail',[
    (ValueError("Comment not found"), 404, "Comment not found"),
    (PermissionError("Not allowed to delete this comment"), 403, "You cannot delete this comment")
])
def test_delete_comment_repo_raises(test_app, mock_repo,error, code, detail):
    client = TestClient(test_app)

    mock_repo.delete.side_effect=error
    response = client.delete("/activities/20/comments/1")
    assert response.status_code == code
    assert detail in response.json()["detail"]