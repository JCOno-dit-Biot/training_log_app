import { useState } from "react";
import { useUpdateComment, useDeleteComment } from '../hooks/useComments';
import { Pencil, X, Check, Trash2 } from "lucide-react";
import { Comment } from "../types/Comment";

interface CommentItemProps {
  comment: Comment;
  // parent provides a setter for the list
  currentUsername: string;
  onError?: (msg: string) => void;       // optional error surfacing
}

export function CommentItem({ comment,
  currentUsername,
  onError
}: CommentItemProps) {

  const isOwner = currentUsername === comment.username;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.comment);

  const { mutate: editComment, isPending: saving } = useUpdateComment();
  const { mutate: removeComment, isPending: deleting } = useDeleteComment();


  const startEdit = () => {
    setDraft(comment.comment);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(comment.comment);
    setIsEditing(false);
  };

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.comment) {
      setIsEditing(false);
      return;
    }

    editComment(
      { activityId: comment.activity_id, id: comment.id, text: trimmed, username: currentUsername ?? null },
      {
        onSuccess: () => setIsEditing(false),
        onError: (e: any) => onError?.(e?.response?.data?.detail ?? "Failed to update comment."),
      }
    );
  };



  const remove = () => {
    if (!confirm("Delete this comment?")) return;
    removeComment(
      { activityId: comment.activity_id, id: comment.id },
      {
        onError: (e: any) => onError?.(e?.response?.data?.detail ?? "Failed to delete comment."),
      }
    );
  };


  return (
    <div className="flex justify-between items-start gap-2 py-1">
      {!isEditing ? (
        <span className="text-sm text-charcoal whitespace-pre-wrap break-words">
          {comment.comment}
        </span>
      ) : (
        <input
          className="flex-1 bg-gray-200 rounded px-2 py-1 text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          }}
          autoFocus
          disabled={saving}
        />
      )}

      {isOwner && (
        <div className="flex items-center gap-2 shrink-0">
          {!isEditing ? (
            <>
              <button
                className="text-gray-500 bg-white hover:text-gray-700"
                onClick={startEdit}
                title="Edit"
                aria-label="Edit comment"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-600 disabled:opacity-50 bg-white"
                onClick={remove}
                disabled={deleting}
                title="Delete"
                aria-label="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={cancelEdit}
                disabled={saving}
                title="Cancel"
                aria-label="Cancel edit"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                className="text-white bg-primary rounded px-2 py-1 text-xs hover:bg-opacity-90 disabled:opacity-60"
                onClick={save}
                disabled={saving || !draft.trim()}
                title="Save"
                aria-label="Save edit"
              >
                <Check className="w-4 h-4 inline-block align-[-2px]" />{" "}
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}