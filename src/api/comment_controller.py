from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi_utils.cbv import cbv
from src.repositories.comment_repository import comment_repository
from src.models.comment import commentCreate, commentOut
from src.deps import (
    get_comment_repo
)

router = APIRouter(prefix="/activities/{activity_id}")

@cbv(router)
class CommentController:
    def __init__(self, comment_repo: comment_repository = Depends(get_comment_repo)):
        self.repo = comment_repo

    @router.get("/comments", response_model=list[commentOut])
    def list_comments(self, activity_id: int):
        return self.repo.get_all(activity_id)

    @router.post("/comments")
    def create_comment(self, request: Request, comment: commentCreate):
        comment.user_id = request.state.user_id
        return self.repo.create(comment)

    @router.put("/comments/{comment_id}")
    def update_comment(self, comment: commentCreate, comment_id: int):
        self.repo.update(comment, comment_id)

    @router.delete("/comments/{comment_id}")
    def delete_comment(self, request: Request, comment_id: int):
        user_id = request.state.user_id
        try:
            self.repo.delete(comment_id, user_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Comment not found")
        except PermissionError:
            raise HTTPException(status_code=403, detail="You cannot delete this comment")
