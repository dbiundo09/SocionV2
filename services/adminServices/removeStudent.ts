import auth from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl = process.env.API_URL || 'http://localhost:8000';

export default async function removeStudent(userId: string, classId: string) {
    try {
        const token = await auth().currentUser?.getIdToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log("Printing email and classId");
        console.log(userId, classId);

        const response = await fetch(`${apiUrl}/admin/removeStudent`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                "user_id": userId,
                "class_id": classId 
            }),
        });

        if (response.status === 401) {
            await handleUnauthorizedError(new Error('Unauthorized access'));
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to remove student');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing student:', error);
        throw error;
    }
} 