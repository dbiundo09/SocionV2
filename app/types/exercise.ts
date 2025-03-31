export interface Exercise {
    exercise_id: string | null;
    audio_url: string | null;
    video_url: string | null;
    class_id: string;
    end_time: string;
    start_time: string;
    exercise_description: string;
    exercise_name: string;
    reps: number | null;
    time: number;
}