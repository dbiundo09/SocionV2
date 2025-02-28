import React from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SAMPLE_CLASSES = [
  {
    id: '1',
    name: 'Meditation with Jason',
    instructor: 'Jason',
    time: 'Daily • 7:00 AM',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
  },
  {
    id: '2',
    name: 'Mindful Movement',
    instructor: 'Michael Chen',
    time: 'Mon, Wed, Fri • 9:00 AM',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773'
  },
  {
    id: '3',
    name: 'Evening Relaxation',
    instructor: 'Emma Williams',
    time: 'Daily • 8:00 PM',
    image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83'
  },
  {
    id: '4',
    name: 'Breathing Techniques',
    instructor: 'David Miller',
    time: 'Tue, Thu • 3:00 PM',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
  },
  {
    id: '5',
    name: 'Breathing Techniques',
    instructor: 'David Miller',
    time: 'Tue, Thu • 3:00 PM',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
  },
];

export default function ClassesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Classes</Text>
        <TouchableOpacity 
          onPress={() => console.log('Add class')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {SAMPLE_CLASSES.map((classItem) => (
          <TouchableOpacity 
            key={classItem.id}
            style={styles.classCard}
            onPress={() => router.push('/auth/home')}
          >
            <ImageBackground
              source={{ uri: classItem.image }}
              style={styles.cardBackground}
              imageStyle={styles.cardBackgroundImage}
            >
              <View style={styles.cardContent}>
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classInstructor}>{classItem.instructor}</Text>
                <Text style={styles.classTime}>{classItem.time}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => console.log('Add class')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  classCard: {
    height: 160,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardBackgroundImage: {
    opacity: 0.7,
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  classInstructor: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  classTime: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
    