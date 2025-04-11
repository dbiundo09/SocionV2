import { getAuth } from "@react-native-firebase/auth";
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface MediaResponse {
    content: string;
    media_type: string;
}

export default async function getMedia(exerciseId: string): Promise<MediaResponse> {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        console.log("Entered getMedia");
        if (!user) {
            throw new Error('No user is currently signed in');
        }
        const idToken = await user.getIdToken();

        const response = await fetch(`${apiUrl}/user/exercise/${exerciseId}/media`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Response received");
        console.log("Response:", response);
        if (!response.ok) {
            const error = await response.json();
            if (response.status === 401) {
                throw new Error('unauthorized');
            }
            throw new Error(error.message || 'Failed to fetch media');
        }
        console.log("Response is ok");
        
        console.log("Response status:",response.status);
        const data = await response.json();
        console.log("Media data received:", data);
        return {
            content: data.url,
            media_type: data.media_type
        };
    } catch (error) {
        if (handleUnauthorizedError(error)) {
            throw new Error('Unauthorized access');
        }
        throw error;
    }
}
