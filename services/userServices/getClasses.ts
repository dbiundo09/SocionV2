import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

export default async function getUserClasses() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();


    const response = await fetch(`${apiUrl}/user/classes`, {
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
      throw new Error(error.message || 'Failed to fetch user classes');
    }

    return await response.json();
  } catch (error) {
    if (handleUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}
