import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import getStudents from '@/services/adminServices/getStudents';
import removeStudent from '@/services/adminServices/removeStudent';

interface Student {
    userId: string;
    email: string;
    name?: string;
}

export default function StudentListScreen() {
    const router = useRouter();
    const { classId } = useLocalSearchParams();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        loadStudents();
    }, [classId]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStudents(classId as string);
            if (!data?.students) {
                throw new Error('Invalid student data received');
            }
            setStudents(data.students);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStudent = async (userId: string) => {
        Alert.alert(
            'Remove Student',
            'Are you sure you want to remove this student from the class?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await removeStudent(userId, classId as string);
                            await loadStudents(); 
                            Alert.alert('Success', 'Student removed successfully');
                        } catch (err) {
                            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to remove student');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#1a1a1a'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>Students</Text>
                <View style={styles.backButton} />
            </View>

            <FlatList
                data={students}
                renderItem={({ item }) => (
                    <View style={[styles.studentItem, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
                        <View style={styles.studentInfo}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={24} color="#8B5CF6" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.studentEmail, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                                    {item.email}
                                </Text>
                                {item.name && (
                                    <Text style={[styles.studentName, { color: isDarkMode ? '#aaa' : '#666' }]}>
                                        {item.name}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveStudent(item.userId)}
                        >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item) => item.email}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        width: 40,
        alignItems: 'center',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    studentEmail: {
        fontSize: 16,
        fontWeight: '500',
    },
    studentName: {
        fontSize: 14,
        marginTop: 2,
    },
    removeButton: {
        padding: 8,
    },
});
