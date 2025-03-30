import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';
import { Exercise } from '@/app/types/exercise';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface ExerciseResponse {
    exercises: Exercise[];
}

export default async function getExercises(classId: string): Promise<Exercise[]> {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('No user is currently signed in');
        }
        const idToken = await user.getIdToken();

        const response = await fetch(`${apiUrl}/admin/getExercises?class_id=${classId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            if (response.status === 401) {
                throw new Error('unauthorized');
            }
            throw new Error(error.message || 'Failed to fetch exercises');
        }

        const data: ExerciseResponse = await response.json();
        return data.exercises;
    } catch (error) {
        if (handleUnauthorizedError(error)) {
            return [];
        }
        throw error;
    }
}
