import auth from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';
import { Exercise } from '@/app/types/exercise';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

const updateExercise = async (exercise: Exercise) => {
  try {
    const token = await auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(apiUrl + `/admin/exercise/${exercise.exercise_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(exercise)
    });

    if (response.status === 401) {
      handleUnauthorizedError(response);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to update exercise');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
};

export default updateExercise; 