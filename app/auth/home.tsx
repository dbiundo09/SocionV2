import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
// Customize these colors to match your index page
const DARK_MODE_BACKGROUND = 'rgb(41, 44, 47)';  // Replace this with your index page background color

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

const initialDailies = [
  { id: '1', title: 'Morning Breathwork', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: false },
  { id: '2', title: 'Nature', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: true },
  { id: '3', title: 'Evening Chanting', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: false },
  { id: '4', title: 'Gratitude', subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', completed: false },
];

interface Daily {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

type RootStackParamList = {
  DailyDetail: { title: string };
  AccountInfo: undefined;  // undefined means no params required
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const [dailies, setDailies] = useState<Daily[]>(initialDailies);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const activeTheme = isDarkMode ? theme.dark : theme.light;

  const toggleCompletion = (id: string) => {
    setDailies(dailies.map(daily => 
      daily.id === id ? { ...daily, completed: !daily.completed } : daily
    ));
  };

  const renderDaily = (props: { item: Daily }) => (
    <View style={[styles.dailyItem, { backgroundColor: activeTheme.cardBackground }]}>
      <TouchableOpacity
        style={styles.dailyTextContainer}
        onPress={() => navigation.navigate('DailyDetail', { title: props.item.title })}
      >
        <Text style={[styles.dailyTitle, { color: activeTheme.text }]}>{props.item.title}</Text>
        <Text style={[styles.dailySubtitle, { color: activeTheme.subtitleText }]}>{props.item.subtitle}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleCompletion(props.item.id)}>
        <Ionicons
          name={props.item.completed ? 'checkbox' : 'square-outline'}
          size={24}
          color={activeTheme.text}
        />
      </TouchableOpacity>
    </View>
  );

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
        <Text style={[styles.headerText, { color: activeTheme.text }]}>Home</Text>
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
          <Text style={styles.trackingNumber}>0</Text>
          <Text style={styles.trackingLabel}>Classes</Text>
        </View>
        <View style={[styles.verticalSeparator, { backgroundColor: activeTheme.separator }]}></View>
        <View style={styles.trackingBox}>
          <Text style={styles.trackingNumber}>0</Text>
          <Text style={styles.trackingLabel}>Day Streak</Text>
        </View>
      </View>
      <Text style={[styles.dailyChecklistTitle, { color: activeTheme.text }]}>Daily Checklist</Text>
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
    padding: 16,
    paddingTop: 48,
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
  },
  backButton: {
    marginRight: 16,
  },
});
