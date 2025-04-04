export type Exercise = {
    exercise_id: string;
    exercise_name: string;
    exercise_description: string | null;
    time: number;
    start_time: string;
    end_time: string;
    video_url?: string | null;
    audio_url?: string | null;
    completed: boolean;
};

export interface ExerciseListResponse {
    exercises: Exercise[];
    streak: number;
    completed_exercises: number;
}