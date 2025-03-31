import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import auth from '@react-native-firebase/auth';
import getExercises from '@/services/userServices/getExercises';
import { Exercise } from '@/app/types/exercise';

const DARK_MODE_BACKGROUND = 'rgb(41, 44, 47)';

const theme = {
  light: {
    background: 'rgb(248, 245, 252)',
    text: '#000',
    cardBackground: 'rgb(213, 205, 233)',
    subtitleText: '#666',
    trackingBox: 'rgb(144, 117, 197)',
    separator: 'rgba(255, 255, 255, 0.5)',
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
      setExercises(data);
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

  const truncateText = (text: string | null, maxLength: number = 100): string => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <View style={[styles.dailyItem, { backgroundColor: activeTheme.cardBackground }]}>
      <TouchableOpacity
        style={styles.dailyTextContainer}
        onPress={() => {
          console.log("Pressed")
          console.log(item)
          router.push({
            pathname: '/auth/exercise-details',
            params: { exercise: JSON.stringify(item) }
          });
        }}
      >
        <Text style={[styles.dailyTitle, { color: activeTheme.text }]}>{item.exercise_name}</Text>
        <Text style={[styles.dailySubtitle, { color: activeTheme.subtitleText }]}>
          {truncateText(item.exercise_description)}
        </Text>
        <View style={styles.exerciseDetails}>
          <Text style={[styles.detailText, { color: activeTheme.subtitleText }]}>
            Duration: {formatDuration(item.time)}
          </Text>
          <Text style={[styles.detailText, { color: activeTheme.subtitleText }]}>
            {formatDate(item.start_time)} - {formatDate(item.end_time)}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={activeTheme.text}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: activeTheme.background }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/auth/classes')}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={activeTheme.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: activeTheme.text }]}>Exercises</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Ionicons
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
              size={24}
              color={activeTheme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={() => auth().signOut()} >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={activeTheme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AccountInfo')}>
            <Ionicons
              name="person-circle-outline"
              size={30}
              color={activeTheme.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.trackingContainer, { backgroundColor: activeTheme.trackingBox }]}>
        <View style={styles.trackingBox}>
          <Text style={styles.trackingNumber}>{exercises.length}</Text>
          <Text style={styles.trackingLabel}>Exercises</Text>
        </View>
        <View style={[styles.verticalSeparator, { backgroundColor: activeTheme.separator }]}></View>
        <View style={styles.trackingBox}>
          <Text style={styles.trackingNumber}>
            {exercises.reduce((acc, exercise) => acc + exercise.time, 0)}
          </Text>
          <Text style={styles.trackingLabel}>Total Time</Text>
        </View>
      </View>
      <Text style={[styles.dailyChecklistTitle, { color: activeTheme.text }]}>Exercise List</Text>
      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    marginRight: 8,
  },
  signOutButton: {
    marginRight: 8,
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  trackingBox: {
    alignItems: 'center',
    width: '45%',
  },
  trackingNumber: {
    fontSize: 50,
    color: '#fff',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
  trackingLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
  verticalSeparator: {
    width: 3,
    height: '120%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dailyChecklistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 20,
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
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    marginTop: 2,
  },
  backButton: {
    marginRight: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
});
