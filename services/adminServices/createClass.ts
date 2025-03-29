import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface ClassCreate {
  name: string;
  instructor: string;
  time: string;
  image: string;
}

export default async function createClass(classData: ClassCreate) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();

   
    const response = await fetch(`${apiUrl}/admin/createClass`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        throw new Error('unauthorized');
      }
      throw new Error(error.message || 'Failed to create class');
    }

    return await response.json();
  } catch (error) {
    if (handleUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}
