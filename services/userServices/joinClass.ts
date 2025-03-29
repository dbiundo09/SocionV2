import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface ClassJoin {
  class_id: string;
}

export default async function joinClass(classId: string) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();

    const payload: ClassJoin = {
      class_id: classId
    };

    const response = await fetch(`${apiUrl}/user/joinClass`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        throw new Error('unauthorized');
      }
      throw new Error(error.message || 'Failed to join class');
    }

    return await response.json();
  } catch (error) {
    if (handleUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}
