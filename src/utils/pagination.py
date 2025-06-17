from fastapi import Request
from urllib.parse import urlencode

def paginate_results(items: list, total: int, request: Request, limit: int, offset: int):
    base_url = str(request.url).split("?")[0]
    query_params = dict(request.query_params)

    def build_url(new_offset: int):
        query_params["limit"] = limit
        query_params["offset"] = new_offset
        return f"{base_url}?{urlencode(query_params)}"

    return {
        "total_count": total,
        "limit": limit,
        "offset": offset,
        "next": build_url(offset + limit) if offset + limit < total else None,
        "previous": build_url(max(offset - limit, 0)) if offset > 0 else None,
        "data": items,
    }
