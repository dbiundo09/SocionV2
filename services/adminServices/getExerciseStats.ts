import auth from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

const getExerciseStats = async (exerciseId: string) => {
  try {
    const token = await auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(apiUrl + `/admin/exercise/${exerciseId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      handleUnauthorizedError(response);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch exercise stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exercise stats:', error);
    throw error;
  }
};

export default getExerciseStats; 