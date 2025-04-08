import auth from '@react-native-firebase/auth';
import { handleUnauthorizedError } from '@/services/authServices/handleUnauthorized';

const apiUrl = process.env.API_URL || 'http://localhost:8000';

export default async function getStudents(classId: string) {
    try {
        const token = await auth().currentUser?.getIdToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Add classId as a query parameter
        const response = await fetch(`${apiUrl}/admin/getStudents?class_id=${classId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 401) {
            handleUnauthorizedError(new Error('Unauthorized access'));
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
}