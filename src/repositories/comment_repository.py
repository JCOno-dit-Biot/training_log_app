from src.models.comment import commentCreate, commentOut
#from src.parsers.activity_parser import parse_activity_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor


class comment_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, name):
        return super().get_by_name(name)
    
    def get_by_id(self, id):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            id, 
                            uusername, 
                            activity_id, 
                            comment, 
                            created_at, 
                            updated_at
                        FROM
                            activity_comments ac
                        JOIN 
                            users u 
                        ON
                            u.id = ac.user_id
                        WHERE 
                            id = %s;
                    """
            cur.execute(query, (id,))
            result = cur.fetchone()

        return commentOut(**result)
    
    def get_all(self, activity_id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            id, 
                            u.username, 
                            activity_id, 
                            comment, 
                            created_at, 
                            updated_at
                        FROM
                            activity_comments ac
                        JOIN 
                            users u 
                        ON
                            u.id = ac.user_id
                        WHERE 
                            activity_id = %s;
                    """
            cur.execute(query, (activity_id,))
            comments = []
            for row in cur.fetchall():
                comment = commentOut(**row)
                comments.append(comment)
        
        return comments
    
    def create(self, comment: commentCreate) -> int:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO activity_comments(activity_id, user_id, comment)
                    VALUES (%s, %s, %s) RETURNING id
                """
                cur.execute(query, (comment.activity_id, comment.user_id, comment.comment,))
                id = cur.fetchone()['id']
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()
        return id
    
    def update(self, comment: commentCreate, comment_id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    UPDATE activity_comments
                    SET comment = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s;
                """
                cur.execute(query, (comment.comment, comment_id,))
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()


    def delete(self, id: int, user_id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            #check if comment exists
            cur.execute("SELECT user_id FROM activity_comments WHERE id = %s", (id,))
            result = cur.fetchone()

            if result is None:
                raise ValueError("Comment not found")  

            if result['user_id'] != user_id:
                raise PermissionError("Not allowed to delete this comment")  

            # Now it's safe to delete
            cur.execute("DELETE FROM activity_comments WHERE id = %s", (id,))
            self._connection.commit()

    def get_total_count(self):
        return super().get_total_count()

