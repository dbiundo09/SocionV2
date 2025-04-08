import auth from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

const deleteExercise = async (exerciseId: string) => {
  try {
    const token = await auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(apiUrl + `/admin/deleteExercise?exercise_id=${exerciseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      handleUnauthorizedError(response);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to delete exercise');
    }

    return true;
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
};

export default deleteExercise; 