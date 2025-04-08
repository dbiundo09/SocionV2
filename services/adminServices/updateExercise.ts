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

    const formData = new FormData();
    formData.append('exercise_id', exercise.exercise_id);
    formData.append('exercise_name', exercise.exercise_name);
    formData.append('exercise_description', exercise.exercise_description || '');
    formData.append('duration', exercise.time.toString());

    const response = await fetch(apiUrl + '/admin/updateExercise', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401) {
      handleUnauthorizedError(response);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to update exercise');
    }

    return await response.text();
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
};

export default updateExercise; 