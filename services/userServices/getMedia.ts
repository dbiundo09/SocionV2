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

        if (!response.ok) {
            const error = await response.json();
            if (response.status === 401) {
                throw new Error('unauthorized');
            }
            throw new Error(error.message || 'Failed to fetch media');
        }

        // Since the response is a binary file, we need to handle it differently
        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data);
            };
            reader.onerror = reject;
        });
        reader.readAsDataURL(blob);
        const base64data = await base64Promise;

        return {
            content: base64data,
            media_type: contentType || 'application/octet-stream'
        };
    } catch (error) {
        if (handleUnauthorizedError(error)) {
            throw new Error('Unauthorized access');
        }
        throw error;
    }
}
