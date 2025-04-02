import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import auth from '@react-native-firebase/auth';
import getExercises from '@/services/userServices/getExercises';
import { Exercise } from '@/app/types/exercise';

const DARK_MODE_BACKGROUND = 'rgb(41, 44, 47)';

const theme = {
  light: {
    background: '#f5f5f5',
    text: '#1a1a1a',
    cardBackground: '#fff',
    subtitleText: '#666',
    trackingBox: 'rgb(144, 117, 197)',
    separator: '#e5e5e5',
  },
  dark: {
    background: DARK_MODE_BACKGROUND,
    text: '#fff',
    cardBackground: 'rgb(56, 59, 63)',
    subtitleText: '#aaa',
    trackingBox: 'rgb(108, 91, 217)',
    separator: 'rgba(255, 255, 255, 0.3)',
  }
};

type RootStackParamList = {
  DailyDetail: { title: string };
  AccountInfo: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<number>(0);
  const activeTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    if (classId) {
      loadExercises();
    }
  }, [classId]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises(classId);
      setExercises(data.exercises);
      setStreak(data.streak);
      setCompletedExercises(data.completed_exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
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

  const truncateText = (text: string | null, maxLength: number = 100): string => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, { backgroundColor: activeTheme.cardBackground }]}
      onPress={() => {
        router.push({
          pathname: '/auth/exercise-details',
          params: { exercise: JSON.stringify(item) }
        });
      }}
    >
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, { color: activeTheme.text }]}>{item.exercise_name}</Text>
        <Ionicons
          name={
            item.video_url ? 'videocam' :
            item.audio_url ? 'musical-notes' :
            'book-outline'
          }
          size={24}
          color="#8B5CF6"
        />
      </View>
      
      <Text style={[styles.exerciseDescription, { color: activeTheme.subtitleText }]} numberOfLines={2}>
        {truncateText(item.exercise_description)}
      </Text>
      
      <View style={[styles.exerciseDetails, { borderTopColor: activeTheme.separator }]}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={activeTheme.subtitleText} />
          <Text style={[styles.detailText, { color: activeTheme.subtitleText }]}>
            {formatDuration(item.time)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={activeTheme.subtitleText} />
          <Text style={[styles.detailText, { color: activeTheme.subtitleText }]}>
            {formatDateRange(item.start_time, item.end_time)}
          </Text>
        </View>

        {!item.video_url && !item.audio_url && (
          <View style={styles.detailItem}>
            <Ionicons name="book-outline" size={16} color={activeTheme.subtitleText} />
            <Text style={[styles.detailText, { color: activeTheme.subtitleText }]}>Read-through meditation</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleBackPress = () => {
    router.back();
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadExercises();
    } catch (error) {
      console.error('Error refreshing exercises:', error);
    } finally {
      setRefreshing(false);
    }
  }, [classId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: activeTheme.background }]}>
        <ActivityIndicator size="large" color="#6b5b9e" />
      </View>
    );
  }
  

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={activeTheme.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: activeTheme.text }]}>Exercises</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Ionicons
                name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
                size={24}
                color={activeTheme.text}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => auth().signOut()} 
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={activeTheme.text}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('AccountInfo')}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={activeTheme.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.trackingContainer, { backgroundColor: activeTheme.trackingBox }]}>
        <View style={styles.statsContainer}>
          <View style={styles.streakContainer}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={32} color="#fff" />
            </View>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={[styles.verticalSeparator, { backgroundColor: activeTheme.separator }]}></View>
          <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressNumber}>{completedExercises} / {exercises.length}</Text>
              <Text style={styles.progressLabel}>Exercises Completed</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.dailyChecklistTitle, { color: activeTheme.text }]}>Exercise List</Text>
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={item => item.exercise_id || ''}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6b5b9e']}
              tintColor="#6b5b9e"
              size={50}
              progressViewOffset={50}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  backButton: {
    padding: 4,
  },
  trackingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  streakIconContainer: {
    marginRight: 12,
  },
  streakTextContainer: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    lineHeight: 32,
  },
  streakLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Helvetica',
    opacity: 0.9,
    lineHeight: 16,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  progressTextContainer: {
    alignItems: 'flex-start',
  },
  progressNumber: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    lineHeight: 32,
  },
  progressLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Helvetica',
    opacity: 0.9,
    lineHeight: 16,
  },
  verticalSeparator: {
    width: 2,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dailyChecklistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dailyTextContainer: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dailySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  exerciseDetails: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
