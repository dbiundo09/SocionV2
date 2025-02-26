import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const dailies = [
  { id: '1', title: 'Morning Breathwork', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: false },
  { id: '2', title: 'Nature', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: true },
  { id: '3', title: 'Evening Chanting', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: false },
  { id: '4', title: 'Gratitude', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: false },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const renderDaily = ({ item }) => (
    <TouchableOpacity
      style={styles.dailyItem}
      onPress={() => navigation.navigate('DailyDetail', { title: item.title })}
    >
      <View style={styles.dailyTextContainer}>
        <Text style={styles.dailyTitle}>{item.title}</Text>
        <Text style={styles.dailySubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons
        name={item.completed ? 'checkbox' : 'square-outline'}
        size={24}
        color="black"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>om</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AccountInfo')}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.trackingContainer}>
        <View style={styles.trackingBox}>
          <Text style={styles.trackingNumber}>0</Text>
          <Text style={styles.trackingLabel}>Classes</Text>
        </View>
        <View style={styles.trackingBox}>
          <Text style={styles.trackingNumber}>0</Text>
          <Text style={styles.trackingLabel}>Day Streak</Text>
        </View>
      </View>
      <Text style={styles.dailyChecklistTitle}>Daily Checklist</Text>
      <FlatList
        data={dailies}
        renderItem={renderDaily}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6a5acd',
    paddingVertical: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  trackingBox: {
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 32,
    color: '#fff',
  },
  trackingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  dailyChecklistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
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
  },
});
