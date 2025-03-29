import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import getAdminInfo from '@/services/adminServices/getAdminInfo';
import { ClassItem } from '../types/class';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import createExercise from '@/services/adminServices/createExercise';

export default function AdminViewScreen() {
    const router = useRouter();
    const { classId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classData, setClassData] = useState<ClassItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [exerciseData, setExerciseData] = useState({
        mediaUri: '',
        mediaType: '', // 'audio' or 'video'
        duration: '',
        startDate: new Date(),
        endDate: new Date(),
    });
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadClassData();
    }, [classId]);

    const loadClassData = async () => {
        if (!classId) {
            setError('No class ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getAdminInfo(classId as string);
            setClassData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load class data');
            Alert.alert('Error', 'Failed to load class data');
        } finally {
            setLoading(false);
        }
    };

    const pickMedia = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['audio/*', 'video/*'],
            });

            if (result.assets && result.assets[0]) {
                const asset = result.assets[0];
                setExerciseData({
                    ...exerciseData,
                    mediaUri: asset.uri,
                    mediaType: asset.mimeType?.startsWith('video/') ? 'video' : 'audio',
                });
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick media file');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);

        if (selectedDate) {
            if (datePickerMode === 'start') {
                setExerciseData({ ...exerciseData, startDate: selectedDate });
            } else {
                setExerciseData({ ...exerciseData, endDate: selectedDate });
            }
        }
    };


    const handleSubmit = async () => {
        if (!exerciseData.mediaUri) {
            Alert.alert('Error', 'Please select a media file');
            return;
        }
        if (!exerciseData.duration) {
            Alert.alert('Error', 'Please enter exercise duration');
            return;
        }

        try {
            setLoading(true);

            await createExercise({
                mediaUri: exerciseData.mediaUri,
                mediaType: exerciseData.mediaType,
                duration: exerciseData.duration,
                startDate: exerciseData.startDate.toISOString(),
                endDate: exerciseData.endDate.toISOString(),
                classId: classId as string,
            });

            Alert.alert('Success', 'Exercise added successfully');
            setIsModalVisible(false);
            
            // Reset form
            setExerciseData({
                mediaUri: '',
                mediaType: '',
                duration: '',
                startDate: new Date(),
                endDate: new Date(),
            });
        } catch (error) {
            console.error('Error creating exercise:', error);
            Alert.alert('Error', 'Failed to create exercise');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    if (error || !classData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error || 'Failed to load class data'}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadClassData}
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
                <Text style={styles.headerTitle}>Class Management</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Image
                    source={{ uri: classData.image }}
                    style={styles.coverImage}
                />

                <View style={styles.classInfo}>
                    <Text style={styles.className}>{classData.name}</Text>
                    <Text style={styles.instructorName}>Instructor: {classData.instructor}</Text>
                    <Text style={styles.classTime}>{classData.time}</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.button, styles.editButton]}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Add Exercise</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => {
                            console.log('Delete button pressed');
                        }}
                    >
                        <Ionicons name="trash-outline" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Delete Class</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Class Statistics</Text>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>42</Text>
                        <Text style={styles.statLabel}>Total Students</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>89%</Text>
                        <Text style={styles.statLabel}>Attendance Rate</Text>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setIsModalVisible(false);
                    setShowDatePicker(false);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Exercise</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsModalVisible(false)
                                    setShowDatePicker(false);
                                }}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <TouchableOpacity
                                style={styles.mediaUploadButton}
                                onPress={pickMedia}
                            >
                                <Ionicons
                                    name={exerciseData.mediaUri ? 'checkmark-circle' : 'cloud-upload'}
                                    size={24}
                                    color={exerciseData.mediaUri ? '#8B5CF6' : '#666'}
                                />
                                <Text style={styles.mediaUploadText}>
                                    {exerciseData.mediaUri ? 'Media Selected' : 'Upload Audio/Video'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Duration (minutes)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={exerciseData.duration}
                                    onChangeText={(text) => setExerciseData({ ...exerciseData, duration: text })}
                                    keyboardType="numeric"
                                    placeholder="Enter duration"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Start Date</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => {
                                        setDatePickerMode('start');
                                        setShowDatePicker(true);
                                    }}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {exerciseData.startDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>End Date</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => {
                                        setDatePickerMode('end');
                                        setShowDatePicker(true);
                                    }}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {exerciseData.endDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.formGroup}>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={datePickerMode === 'start' ? exerciseData.startDate : exerciseData.endDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onDateChange}
                                    />
                                )}
                            </View>

                        </ScrollView>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Add Exercise</Text>
                        </TouchableOpacity>

                    </View>
                </KeyboardAvoidingView>
            </Modal>


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
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    content: {
        flex: 1,
    },
    coverImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    classInfo: {
        padding: 16,
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    className: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    instructorName: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    classTime: {
        fontSize: 16,
        color: '#666',
    },
    actionButtons: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 8,
    },
    editButton: {
        backgroundColor: '#8B5CF6',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    statsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginBottom: 4,
    },
    statLabel: {
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    closeButton: {
        padding: 8,
    },
    modalScroll: {
        padding: 16,
    },
    mediaUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
    },
    mediaUploadText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    input: {
        height: 48,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1a1a1a',
    },
    dateButton: {
        height: 48,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    dateButtonText: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    submitButton: {
        margin: 16,
        height: 56,
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 