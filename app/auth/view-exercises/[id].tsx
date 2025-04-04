import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import getExercises from '@/services/adminServices/getExercises';
import { Exercise } from '@/app/types/exercise';

export default function ViewExercisesScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadExercises();
    }, [id]);

    const loadExercises = async () => {
        if (!id) {
            setError('No class ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getExercises(id as string);
            setExercises(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load exercises');
            Alert.alert('Error', 'Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: string) => {
        const totalSeconds = parseInt(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateRange = (startDate: string, endDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // If dates are the same, just show one date
        if (start.toDateString() === end.toDateString()) {
            if (start.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (start.toDateString() === tomorrow.toDateString()) {
                return 'Tomorrow';
            }
            return formatDate(startDate);
        }

        // If dates are different, show the range
        if (start.toDateString() === today.toDateString()) {
            return `Today - ${formatDate(endDate)}`;
        } else if (start.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow - ${formatDate(endDate)}`;
        }
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadExercises}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Class Exercises</Text>
                <TouchableOpacity style={styles.backButton} disabled>
                    <Ionicons name="arrow-back" size={24} color="transparent" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {exercises.map((exercise) => (
                    <TouchableOpacity
                        key={exercise.exercise_id}
                        style={styles.exerciseCard}
                        onPress={() => router.push({
                            pathname: '/auth/admin-exercise-details',
                            params: { exercise: JSON.stringify(exercise) }
                        })}
                    >
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                            <Ionicons
                                name={
                                    exercise.video_url ? 'videocam' :
                                    exercise.audio_url ? 'musical-notes' :
                                    'book-outline'
                                }
                                size={24}
                                color="#8B5CF6"
                            />
                        </View>
                        
                        <Text style={styles.exerciseDescription} numberOfLines={2}>
                            {exercise.exercise_description}
                        </Text>
                        
                        <View style={styles.exerciseDetails}>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={16} color="#666" />
                                <Text style={styles.detailText}>
                                    {formatDuration(exercise.time.toString())}
                                </Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.detailText}>
                                    {formatDateRange(exercise.start_time, exercise.end_time)}
                                </Text>
                            </View>

                            {!exercise.video_url && !exercise.audio_url && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="book-outline" size={16} color="#666" />
                                    <Text style={styles.detailText}>Read-through meditation</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 48,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    exerciseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    exerciseDetails: {
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        paddingTop: 12,
        gap: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
