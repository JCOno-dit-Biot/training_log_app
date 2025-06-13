import pytest
from src.repositories.comment_repository import comment_repository
from src.models import commentCreate, commentOut

@pytest.fixture
def comment_repo(test_db_conn):
    print(test_db_conn)
    return comment_repository(test_db_conn)

@pytest.fixture
def test_comment():
    return commentCreate(
        activity_id = 3,
        user_id = 1,
        comment= "test comment - great training"
    )

def test_get_all(comment_repo):
    comments = comment_repo.get_all(2)
    assert len(comments) == 2

def test_create(test_comment, comment_repo):
    id = comment_repo.create(test_comment)
    with comment_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_comments WHERE id = %s """, (id,))
        result = cur.fetchone()

    assert result is not None
    assert result[0] == id