import pytest
from src.repositories.comment_repository import comment_repository
from src.models import commentCreate, commentOut
from datetime import datetime

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
    assert all([isinstance(comment, commentOut) for comment in comments])

def test_get_by_id(comment_repo):
    comment = comment_repo.get_by_id(1)
    assert isinstance(comment, commentOut)
    assert comment.comment == "Really solid training"

def test_create(test_comment, comment_repo):
    id = comment_repo.create(test_comment)
    with comment_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_comments WHERE id = %s """, (id,))
        result = cur.fetchone()

    print(result)
    assert result is not None
    assert result[0] == id
    assert result[3] == "test comment - great training"

def test_update_comment(comment_repo):
    with comment_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_comments WHERE id = 1""")
        result = cur.fetchone()

    assert result[3] == "Really solid training"
    assert result[-1] is None
    commentupdate=commentCreate(
        user_id = 1,
        activity_id = 1,
        comment = 'updated_comment'
    )
    comment_repo.update(commentupdate, 1)
    with comment_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_comments WHERE id = 1""")
        result = cur.fetchone()

    assert isinstance(result[-1], datetime)
    assert result[3] == 'updated_comment'

def test_delete_comment(comment_repo):
    comment_repo.delete(1)
    with comment_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_comments WHERE id = 1""")
        result = cur.fetchone()
    assert result is None

