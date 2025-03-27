import { getAuth } from "@react-native-firebase/auth";

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

export default async function getUserClasses() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();

    console.log('Making request to:', `${apiUrl}/user/classes`);
    console.log('Request headers:', {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    });

    const response = await fetch(`${apiUrl}/user/classes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.message || 'Failed to fetch user classes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user classes:', error);
    throw error;
  }
}
