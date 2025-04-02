import { getAuth } from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '../authServices/handleUnauthorized';

const apiUrl: string = process.env.API_URL || 'http://localhost:8000';

interface AddUserResponse {
    success: boolean;
    message: string;
}

export default async function addUserByEmail(email: string, classId: string): Promise<AddUserResponse> {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error('User not authenticated');
        }

        const idToken = await user.getIdToken();
        
        const formData = new FormData();
        formData.append('email', email);
        formData.append('class_id', classId);
        const response = await fetch(`${apiUrl}/admin/addUserByEmail`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (response.status === 401) {
            handleUnauthorizedError(response);
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add user, please try again.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding user by email:', error);
        throw error;
    }
}
