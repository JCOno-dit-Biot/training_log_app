from src.utils.pagination import paginate_results
import pytest
from starlette.datastructures import QueryParams
from starlette.datastructures import URL


# Mock request factory
class MockRequest:
    def __init__(self, url: str, query_string: str):
        self.url = URL(url + "?" + query_string)
        self.query_params = QueryParams(query_string)

@pytest.fixture
def sample_items():
    return [{"id": 1}, {"id": 2}]

def test_paginate_results(sample_items):
    request = MockRequest("http://testserver/activities", "limit=2&offset=0")
    response = paginate_results(
        items=sample_items,
        total=5,
        request=request,
        limit=2,
        offset=0
    )

    assert response["total_count"] == 5
    assert response["limit"] == 2
    assert response["offset"] == 0
    assert response["next"] == "http://testserver/activities?limit=2&offset=2"
    assert response["previous"] is None
    assert response["data"] == sample_items

def test_paginate_results_middle_page(sample_items):
    request = MockRequest("http://testserver/activities", "limit=2&offset=2")
    response = paginate_results(
        items=sample_items,
        total=5,
        request=request,
        limit=2,
        offset=2
    )

    assert response["next"] == "http://testserver/activities?limit=2&offset=4"
    assert response["previous"] == "http://testserver/activities?limit=2&offset=0"

def test_paginate_results_last_page(sample_items):
    request = MockRequest("http://testserver/activities", "limit=2&offset=4")
    response = paginate_results(
        items=sample_items,
        total=5,
        request=request,
        limit=2,
        offset=4
    )

    assert response["next"] is None
    assert response["previous"] == "http://testserver/activities?limit=2&offset=2"


