export interface Comment {
    id?: number;
    user_id: number;
    activity_id: number;
    comment: string;
    created_at?: string;
    update_at?: string;
}