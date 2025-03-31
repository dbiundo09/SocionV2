import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  ActivityIndicator,
  Animated,
  TextInput,
  Alert,
  Keyboard,
  FlatList,
  useColorScheme,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import getUserClasses from '../../services/userServices/getClasses';
import { ClassItem } from '../types/class';
import joinClass from '../../services/userServices/joinClass';
import { handleLogout } from '../../services/authServices/handleUnauthorized';

export default function ClassesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ownedClasses, setOwnedClasses] = useState<ClassItem[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassItem[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = React.useRef(new Animated.Value(0)).current;
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getUserClasses();
      setOwnedClasses(response.ownedClasses || []);
      setEnrolledClasses(response.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };
 
  const handleJoinClass = async () => {
    console.log("classCode:", classCode);
    Keyboard.dismiss();
    if (!classCode.trim()) {
      Alert.alert('Error', 'Please enter a class code');
      return;
    }

    try {
      setJoining(true);
      const response = await joinClass(classCode.trim());
      setJoinDialogVisible(false);
      setClassCode('');
      await fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join class');
    } finally {
      setJoining(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchClasses();
    } catch (error) {
      console.error('Error refreshing classes:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderClassList = (classes: ClassItem[], title: string) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={classes}
        renderItem={({ item: classItem }) => (
          <TouchableOpacity 
            key={classItem.id}
            style={styles.classCard}
            onPress={() => {
              if (title === "Classes You Teach") {
                router.push({
                  pathname: '/auth/admin-view',
                  params: { classId: classItem.id }
                });
              } else {
                router.push({
                  pathname: '/auth/home',
                  params: { classId: classItem.id }
                });
              }
            }}
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
        )}
        keyExtractor={item => item.id.toString()}
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
  );

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
        <Text style={styles.headerTitle}>My Classes</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {ownedClasses.length > 0 && renderClassList(ownedClasses, "Classes You Teach")}
        {enrolledClasses.length > 0 && renderClassList(enrolledClasses, "Enrolled Classes")}

        {ownedClasses.length === 0 && enrolledClasses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No classes found</Text>
            <Text style={styles.emptyStateSubtext}>Join or create a class to get started</Text>
          </View>
        )}
      </ScrollView>

      {menuVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                transform: [
                  {
                    translateY: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
                opacity: menuAnimation,
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push('/auth/create-class');
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#1a1a1a" />
              <Text style={styles.menuItemText}>Create a Class</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                setJoinDialogVisible(true);
              }}
            >
              <Ionicons name="enter-outline" size={24} color="#1a1a1a" />
              <Text style={styles.menuItemText}>Join a Class</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={toggleMenu}
      >
        <Ionicons 
          name={menuVisible ? "close" : "add"} 
          size={30} 
          color="#fff" 
        />
      </TouchableOpacity>

      {joinDialogVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setJoinDialogVisible(false)}
        >
          <Animated.View 
            style={[styles.dialogContainer]}
          >
            <Text style={styles.dialogTitle}>Join a Class</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter class code"
              placeholderTextColor="#666"
              value={classCode}
              onChangeText={setClassCode}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleJoinClass}
              enablesReturnKeyAutomatically={true}
              keyboardType="default"
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => {
                  setJoinDialogVisible(false);
                  setClassCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.joinButton]}
                onPress={handleJoinClass}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.joinButtonText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 80,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1a1a1a',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
});
    