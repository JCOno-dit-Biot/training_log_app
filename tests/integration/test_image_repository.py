import pytest

from src.repositories.image_repository import ImageRepository


@pytest.fixture
def image_repository(test_db_conn):
    return ImageRepository(test_db_conn)


def test_create_dog_image_inserts_active_image(image_repository):
    dog_id = 4

    created = image_repository.create_dog_image(
        dog_id=dog_id,
        image_path="profile-pictures/dogs/1/test.jpg",
    )
    image_repository._connection.commit()

    assert created["dog_id"] == dog_id
    assert created["image_path"] == "profile-pictures/dogs/1/test.jpg"
    assert created["is_active"] is True


def test_deactivate_active_dog_image_sets_old_image_inactive(image_repository):
    dog_id = 4

    image_repository.deactivate_active_dog_image(dog_id)
    second = image_repository.create_dog_image(
        dog_id=dog_id,
        image_path="profile-pictures/dogs/1/second.jpg",
    )
    image_repository._connection.commit()

    with image_repository._connection.cursor() as cur:
        cur.execute(
            """
            SELECT id, image_path, is_active
            FROM images
            WHERE dog_id = %s
            ORDER BY created_at ASC;
            """,
            (dog_id,),
        )
        rows = cur.fetchall()

    assert len(rows) == 2
    assert rows[0][2] is False
    assert rows[1][0] == second["id"]
    assert rows[1][2] is True


def test_get_active_dog_image_returns_only_active_one(image_repository):
    dog_id = 4

    image_repository.deactivate_active_dog_image(dog_id)
    image_repository.create_dog_image(
        dog_id=dog_id,
        image_path="profile-pictures/dogs/1/second.jpg",
    )
    image_repository._connection.commit()

    active = image_repository.get_active_dog_image(dog_id)

    assert active is not None
    assert active["image_path"] == "profile-pictures/dogs/1/second.jpg"
    assert active["is_active"] is True


def test_unique_active_dog_index_prevents_two_active_images(image_repository):
    dog_id = 3

    with pytest.raises(Exception):
        image_repository.create_dog_image(
            dog_id=dog_id,
            image_path="profile-pictures/dogs/1/second.jpg",
        )
        image_repository._connection.commit()

    image_repository._connection.commit()


def test_create_runner_image_inserts_active_image(image_repository):
    runner_id = 3

    created = image_repository.create_runner_image(
        runner_id=runner_id,
        image_path="profile-pictures/runners/1/test.jpg",
    )
    image_repository._connection.commit()

    assert created["runner_id"] == runner_id
    assert created["is_active"] is True


def test_deactivate_active_runner_image_sets_old_image_inactive(image_repository):
    runner_id = 2

    image_repository.deactivate_active_runner_image(runner_id)
    second = image_repository.create_runner_image(
        runner_id=runner_id,
        image_path="profile-pictures/runners/1/second.jpg",
    )
    image_repository._connection.commit()

    with image_repository._connection.cursor() as cur:
        cur.execute(
            """
            SELECT id, image_path, is_active
            FROM images
            WHERE runner_id = %s
            ORDER BY created_at ASC;
            """,
            (runner_id,),
        )
        rows = cur.fetchall()

    assert len(rows) == 3
    assert rows[0][2] is False
    assert rows[2][0] == second["id"]
    assert rows[2][2] is True