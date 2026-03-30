export type ImageResponse = {
    id: number;
    image_path: string;
    image_url: string;
    dog_id: number | null;
    runner_id: number | null;
    is_active: boolean;
    created_at: string;
};
