import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';
import { Exercise } from '@/app/types/exercise';
import { ExerciseListResponse } from '@/app/types/exercise';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';


export default async function getExercises(classId?: string): Promise<ExerciseListResponse> {
    try {
        const user = getAuth().currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        const idToken = await user.getIdToken();
        const url = new URL(`${apiUrl}/user/getExercises`);
        
        if (classId) {
            url.searchParams.append('class_id', classId);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            await handleUnauthorizedError(new Error('Unauthorized'));
            return { exercises: [], streak: 0, completed_exercises: 0 };
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch exercises: ${response.statusText}`);
        }

        const data: ExerciseListResponse = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error;
    }
}
