import { getAuth } from "@react-native-firebase/auth";

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface ClassJoin {
  class_id: string;
}

export default async function joinClass(class_id: string) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();

    const classData: ClassJoin = { class_id };

    console.log('Making request to:', `${apiUrl}/user/joinClass`);
    console.log('Request headers:', {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    });
    console.log('Request body:', classData);

    const response = await fetch(`${apiUrl}/user/joinClass`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.detail || error.message || 'Failed to join class');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error joining class:', error);
    throw error;
  }
}
