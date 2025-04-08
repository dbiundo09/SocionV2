import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Exercise } from '@/app/types/exercise';
import deleteExercise from '@/services/adminServices/deleteExercise';
import updateExercise from '@/services/adminServices/updateExercise';
const { width } = Dimensions.get('window');

type ExerciseStats = {
  total_students: number;
  completed_count: number;
  completion_rate: number;
  average_completion_time: number;
};

// Mock stats data
const MOCK_STATS: ExerciseStats = {
  total_students: 25,
  completed_count: 18,
  completion_rate: 0.72,
  average_completion_time: 480, // 8 minutes in seconds
};

export default function AdminExerciseDetails() {
  const router = useRouter();
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const exerciseData: Exercise = exercise ? JSON.parse(exercise) : null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExerciseStats>(MOCK_STATS);
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(exerciseData);
  const [timeInput, setTimeInput] = useState<string>('');

  useEffect(() => {
    if (exerciseData) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!editedExercise) return;
    
    setLoading(true);
    try {
      await updateExercise(editedExercise);
      Alert.alert('Success', 'Exercise updated successfully');
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
    Alert.alert('Success', 'Exercise updated successfully');

  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            deleteExercise(exerciseData.exercise_id);
            setLoading(false);
            router.back();
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
  };

  const formatTimeInput = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Split into hours, minutes, seconds
    const hours = digits.slice(0, 2);
    const minutes = digits.slice(2, 4);
    const seconds = digits.slice(4, 6);
    
    // Format with colons
    let formatted = '';
    if (hours) formatted += hours;
    if (minutes) formatted += `:${minutes}`;
    if (seconds) formatted += `:${seconds}`;
    
    return formatted;
  };

  if (!exerciseData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No exercise data available</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Exercise Details</Text>

        <View style={[styles.backButton, styles.headerActions]}>
          {!isEditing ? (
            <>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={24} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={24} color="#28a745" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Exercise Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercise Information</Text>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedExercise?.exercise_name}
                  onChangeText={(text) => 
                    setEditedExercise(prev => prev ? {...prev, exercise_name: text} : null)
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedExercise?.exercise_description || ''}
                  onChangeText={(text) => 
                    setEditedExercise(prev => prev ? {...prev, exercise_description: text} : null)
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (HH:MM:SS)</Text>
                <TextInput
                  style={styles.input}
                  value={timeInput}
                  onChangeText={(text) => {
                    // Allow deletion
                    if (text.length < timeInput.length) {
                      setTimeInput(text);
                      return;
                    }
                    
                    // Format the input
                    const formatted = formatTimeInput(text);
                    setTimeInput(formatted);
                    
                    // Update the exercise time if we have a complete time
                    if (formatted.split(':').length === 3) {
                      const seconds = parseTime(formatted);
                      setEditedExercise(prev => prev ? {...prev, time: seconds} : null);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="00:00:00"
                />
              </View>
            </View>
          ) : (
            <View style={styles.detailsContainer}>
              <Text style={styles.exerciseName}>{exerciseData.exercise_name}</Text>
              <Text style={styles.exerciseDescription}>
                {exerciseData.exercise_description || 'No description available'}
              </Text>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{formatTime(exerciseData.time)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name={exerciseData.video_url ? "videocam-outline" : "musical-note-outline"} size={20} color="#666" />
                <Text style={styles.detailText}>
                  {exerciseData.video_url ? "Video Exercise" : exerciseData.audio_url ? "Audio Exercise" : "Text Exercise"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats Section */}
        {!isEditing && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Completion Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="people" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statNumber}>{stats.total_students}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statNumber}>{stats.completed_count}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="analytics" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statNumber}>{Math.round(stats.completion_rate * 100)}%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="timer" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statNumber}>{formatTime(stats.average_completion_time)}</Text>
                <Text style={styles.statLabel}>Avg. Time</Text>
              </View>
            </View>
          </View>
        )}
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
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  headerActions: {
    width: 96,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
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
  statsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 