import React, { useEffect, useState, useCallback } from 'react';
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
    Animated,
    Keyboard,
    FlatList,
    useColorScheme,
    RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import getAdminInfo from '@/services/adminServices/getAdminInfo';
import { ClassItem } from '../types/class';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import createExercise from '@/services/adminServices/createExercise';
import Clipboard from '@react-native-clipboard/clipboard';
import addUserByEmail from '@/services/adminServices/addUserByEmail';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminViewScreen() {
    const router = useRouter();
    const { classId, short_code } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classData, setClassData] = useState<ClassItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [exerciseData, setExerciseData] = useState({
        mediaUri: '',
        mediaType: '',
        duration: '00:00:00',
        startDate: new Date(),
        endDate: new Date(),
        exerciseName: '',
        exerciseDescription: '',
    });
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [addStudentMenuVisible, setAddStudentMenuVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const addStudentMenuAnimation = React.useRef(new Animated.Value(0)).current;

    // Initial load
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
        setShowDatePicker(false);
        if (!exerciseData.duration) {
            Alert.alert('Error', 'Please enter exercise duration');
            return;
        }
        if (!exerciseData.exerciseName.trim()) {
            Alert.alert('Error', 'Please enter exercise name');
            return;
        }

        try {
            setLoading(true);
            // Parse duration from HH:MM:SS to total seconds
            const [hours, minutes, seconds] = exerciseData.duration.split(':').map(Number);
            const totalSeconds = (hours * 3600 + minutes * 60 + seconds).toString();
            // Only include media fields if they have values
            const exerciseDataToSubmit: any = {
                duration: totalSeconds,
                startDate: exerciseData.startDate.toISOString(),
                endDate: exerciseData.endDate.toISOString(),
                classId: classId as string,
                exerciseName: exerciseData.exerciseName.trim(),
                exerciseDescription: exerciseData.exerciseDescription.trim(),
            };

            // Only add media fields if they exist
            if (exerciseData.mediaUri && exerciseData.mediaType) {
                exerciseDataToSubmit.mediaUri = exerciseData.mediaUri;
                exerciseDataToSubmit.mediaType = exerciseData.mediaType;
            }

            await createExercise(exerciseDataToSubmit);

            Alert.alert('Success', 'Exercise added successfully');
            setIsModalVisible(false);
            
            // Reset form
            setExerciseData({
                mediaUri: '',
                mediaType: '',
                duration: '00:00:00',
                startDate: new Date(),
                endDate: new Date(),
                exerciseName: '',
                exerciseDescription: '',
            });

            // Refresh class data to show the new exercise
            await loadClassData();
        } catch (error) {
            console.error('Error creating exercise:', error);
            Alert.alert('Error', 'Failed to create exercise');
        } finally {
            setLoading(false);
        }
    };

    const toggleAddStudentMenu = () => {
        const toValue = addStudentMenuVisible ? 0 : 1;
        Animated.spring(addStudentMenuAnimation, {
            toValue,
            useNativeDriver: true,
        }).start();
        setAddStudentMenuVisible(!addStudentMenuVisible);
    };

    const handleAddByEmail = () => {
        toggleAddStudentMenu();
        setEmailModalVisible(true);
    };

    const handleEmailSubmit = async () => {
        if (!emailInput.trim()) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }

        try {
            setLoading(true);
            const response = await addUserByEmail(emailInput.trim(), classId as string);
            Alert.alert('Success', response.message);
            setEmailInput('');
            setEmailModalVisible(false);
            
            // Refresh class data to show the new student
            await loadClassData();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyClassCode = () => {
        Clipboard.setString(short_code as string);
        Alert.alert('Success', 'Class code copied to clipboard');
        toggleAddStudentMenu();
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
                <TouchableOpacity style={styles.backButton} disabled>
                    <Ionicons name="arrow-back" size={24} color="transparent" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <Image
                    source={{ uri: classData.image }}
                    style={styles.coverImage}
                />

                <View style={styles.mainContent}>
                    <View style={styles.classInfo}>
                        <Text style={styles.className}>{classData.name}</Text>
                        <View style={styles.classDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={20} color="#666" />
                                <Text style={styles.detailText}>{classData.instructor}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={20} color="#666" />
                                <Text style={styles.detailText}>{classData.time}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.primaryButton]}
                                onPress={() => setIsModalVisible(true)}
                            >
                                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Add Exercise</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton]}
                                onPress={toggleAddStudentMenu}
                            >
                                <Ionicons name="people-outline" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Add Student</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Class Statistics</Text>
                        <View style={styles.statsGrid}>
                            <TouchableOpacity 
                                style={styles.statCard}
                                onPress={() => router.push({
                                    pathname: '/auth/student-list',
                                    params: { classId }
                                })}
                            >
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="people" size={24} color="#8B5CF6" />
                                </View>
                                <Text style={styles.statNumber}>{classData.users || 0}</Text>
                                <Text style={styles.statLabel}>Total Students</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.statCard}
                                onPress={() => router.push({
                                    pathname: '/auth/view-exercises/[classId]',
                                    params: { classId }
                                })}
                            >
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                                </View>
                                <Text style={styles.statNumber}>{classData.num_exercises || 0}</Text>
                                <Text style={styles.statLabel}>Active Exercises</Text>
                            </TouchableOpacity>
                        </View>
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
                                style={[
                                    styles.mediaUploadButton,
                                    exerciseData.mediaUri && styles.mediaUploadButtonSelected
                                ]}
                                onPress={pickMedia}
                            >
                                <Ionicons
                                    name={exerciseData.mediaUri ? 'checkmark-circle' : 'cloud-upload'}
                                    size={24}
                                    color={exerciseData.mediaUri ? '#8B5CF6' : '#666'}
                                />
                                <Text style={[
                                    styles.mediaUploadText,
                                    exerciseData.mediaUri && styles.mediaUploadTextSelected
                                ]}>
                                    {exerciseData.mediaUri ? 'Media Selected (Optional)' : 'Upload Audio/Video (Optional)'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Exercise Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={exerciseData.exerciseName}
                                    onChangeText={(text) => setExerciseData({ ...exerciseData, exerciseName: text })}
                                    placeholder="Enter exercise name"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Exercise Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={exerciseData.exerciseDescription}
                                    onChangeText={(text) => setExerciseData({ ...exerciseData, exerciseDescription: text })}
                                    placeholder="Enter exercise description"
                                    placeholderTextColor="#666"
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Duration</Text>
                                <View style={styles.timeInputContainer}>
                                    <View style={styles.timeInputGroup}>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={exerciseData.duration.split(':')[0] || ''}
                                            onChangeText={(text) => {
                                                const numbers = text.replace(/[^0-9]/g, '');
                                                const [_, mm, ss] = exerciseData.duration.split(':');
                                                setExerciseData({
                                                    ...exerciseData,
                                                    duration: `${numbers}:${mm || '00'}:${ss || '00'}`
                                                });
                                            }}
                                            keyboardType="numeric"
                                            maxLength={2}
                                            placeholder="00"
                                            placeholderTextColor="#666"
                                        />
                                        <Text style={styles.timeLabel}>hours</Text>
                                    </View>

                                    <View style={styles.timeInputGroup}>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={exerciseData.duration.split(':')[1] || ''}
                                            onChangeText={(text) => {
                                                const numbers = text.replace(/[^0-9]/g, '');
                                                if (parseInt(numbers) < 60 || numbers === '') {
                                                    const [hh, _, ss] = exerciseData.duration.split(':');
                                                    setExerciseData({
                                                        ...exerciseData,
                                                        duration: `${hh || '00'}:${numbers}:${ss || '00'}`
                                                    });
                                                }
                                            }}
                                            keyboardType="numeric"
                                            maxLength={2}
                                            placeholder="00"
                                            placeholderTextColor="#666"
                                        />
                                        <Text style={styles.timeLabel}>min</Text>
                                    </View>

                                    <View style={styles.timeInputGroup}>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={exerciseData.duration.split(':')[2] || ''}
                                            onChangeText={(text) => {
                                                const numbers = text.replace(/[^0-9]/g, '');
                                                if (parseInt(numbers) < 60 || numbers === '') {
                                                    const [hh, mm] = exerciseData.duration.split(':');
                                                    setExerciseData({
                                                        ...exerciseData,
                                                        duration: `${hh || '00'}:${mm || '00'}:${numbers}`
                                                    });
                                                }
                                            }}
                                            keyboardType="numeric"
                                            maxLength={2}
                                            placeholder="00"
                                            placeholderTextColor="#666"
                                        />
                                        <Text style={styles.timeLabel}>sec</Text>
                                    </View>
                                </View>
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

            <Modal
                visible={emailModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEmailModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Student by Email</Text>
                            <TouchableOpacity
                                onPress={() => setEmailModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.label}>Student Email</Text>
                            <TextInput
                                style={styles.input}
                                value={emailInput}
                                onChangeText={setEmailInput}
                                placeholder="Enter student's email"
                                placeholderTextColor="#666"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>


                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleEmailSubmit}
                        >
                            <Text style={styles.submitButtonText}>Add Student</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {addStudentMenuVisible && (
                <Modal
                    visible={addStudentMenuVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={toggleAddStudentMenu}
                >
                    <View style={styles.modalContainer}>
                        <Animated.View 
                            style={[
                                styles.menuContainer,
                                {
                                    transform: [
                                        {
                                            translateY: addStudentMenuAnimation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [100, 0],
                                            }),
                                        },
                                    ],
                                    opacity: addStudentMenuAnimation,
                                },
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Student</Text>
                                <TouchableOpacity
                                    onPress={toggleAddStudentMenu}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={handleAddByEmail}
                            >
                                <Ionicons name="mail-outline" size={24} color="#1a1a1a" />
                                <Text style={styles.menuItemText}>Add by Email</Text>
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={handleCopyClassCode}
                            >
                                <Ionicons name="copy-outline" size={24} color="#1a1a1a" />
                                <Text style={styles.menuItemText}>Copy Class Code</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
            )}

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
    },
    coverImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    mainContent: {
        padding: 16,
    },
    classInfo: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    className: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    classDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    button: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#8B5CF6',
    },
    secondaryButton: {
        backgroundColor: '#6B7280',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginHorizontal: 8,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
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
    textArea: {
        height: 100,
        paddingTop: 12,
        paddingBottom: 12,
    },
    timeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    timeInputGroup: {
        alignItems: 'center',
    },
    timeInput: {
        width: 60,
        height: 48,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    modalBody: {
        padding: 16,
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    menuItemText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#1a1a1a',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 12,
    },
    mediaUploadButtonSelected: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    mediaUploadTextSelected: {
        color: '#8B5CF6',
    },
}); 