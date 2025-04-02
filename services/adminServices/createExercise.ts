import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface ExerciseCreate {
  mediaUri?: string;
  mediaType?: string;
  duration: string;
  startDate: string;
  endDate: string;
  classId: string;
  exerciseName: string;
  exerciseDescription: string;
}

export default async function createExercise(exerciseData: ExerciseCreate) {
  try {

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }
    const idToken = await user.getIdToken();

    // Create form data for multipart/form-data request
    const formData = new FormData();
    
    // Only append media file if it exists
    if (exerciseData.mediaUri && exerciseData.mediaType) {
      const filename = exerciseData.mediaUri.split('/').pop() || 'file';
      formData.append('file', {
        uri: exerciseData.mediaUri,
        type: exerciseData.mediaType.includes('video') ? 'video/mp4' : 'audio/mpeg',
        name: filename,
      } as any);
    }

    // Append other exercise data
    formData.append('duration', exerciseData.duration);
    formData.append('startDate', exerciseData.startDate);
    formData.append('endDate', exerciseData.endDate);
    formData.append('classId', exerciseData.classId);
    formData.append('exerciseName', exerciseData.exerciseName);
    formData.append('exerciseDescription', exerciseData.exerciseDescription);

    const response = await fetch(`${apiUrl}/admin/createExercise`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        throw new Error('unauthorized');
      }
      throw new Error(error.message || 'Failed to create exercise');
    }

    return await response.json();
  } catch (error) {
    if (handleUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}
