import { firebase, getAuth } from "@react-native-firebase/auth";

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

export default async function postSignIn() {
  try {

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();


    const response = await fetch(apiUrl + '/user/postSignin', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    console.log('User profile:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}