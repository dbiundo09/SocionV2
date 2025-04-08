import auth from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

const markCompleted = async (exerciseId: string): Promise<void> => {
  try {
    const token = await auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(apiUrl + '/user/markComplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ exercise_id: exerciseId })
    });

    if (response.status === 401) {
        handleUnauthorizedError(response);
        return;
    }

    if (!response.ok) {
      throw new Error('Failed to mark exercise as complete');
    }

    return response.json();
  } catch (error) {
    console.error('Error marking exercise as complete:', error);
    throw error;
  }
};

export default markCompleted;
