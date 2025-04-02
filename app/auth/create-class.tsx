import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import createClass from '../../services/adminServices/createClass';

interface ImageItem {
  id: string;
  url: string;
  thumbnail: string;
}

const DEFAULT_IMAGES: ImageItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1545389336-cf090694435e',
    thumbnail: 'Meditation'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    thumbnail: 'Yoga'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83',
    thumbnail: 'Mindfulness'
  }
];

interface FormData {
  name: string;
  instructor: string;
  time: string;
  image: string;
}

export default function CreateClassScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    instructor: '',
    time: '',
    image: DEFAULT_IMAGES[0].url // Default to first image
  });
  const [selectedImageId, setSelectedImageId] = useState(DEFAULT_IMAGES[0].id);

  const handleSubmit = async () => {
    const requiredFields: (keyof FormData)[] = ['name', 'instructor', 'time'];
    for (const key of requiredFields) {
      if (!formData[key].trim()) {
        Alert.alert('Error', `${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        return;
      }
    }

    setLoading(true);
    try {
      const classData = {
        name: formData.name.trim(),
        instructor: formData.instructor.trim(),
        time: formData.time.trim(),
        image: formData.image
      };
      await createClass(classData);
      Alert.alert('Success', 'Class created successfully');
      router.replace('/auth/classes');
    } catch (error: any) {
      console.error('Error creating class:', error);
      Alert.alert('Error', error.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const renderImageItem = ({ item }: { item: ImageItem }) => (
    <TouchableOpacity
      style={[
        styles.imageOption,
        selectedImageId === item.id && styles.selectedImageOption
      ]}
      onPress={() => {
        setSelectedImageId(item.id);
        setFormData({ ...formData, image: item.url });
      }}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.thumbnailImage}
      />
      <Text style={styles.thumbnailText}>{item.thumbnail}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Class</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Class Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter class name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Instructor Name</Text>
          <TextInput
            style={styles.input}
            value={formData.instructor}
            onChangeText={(text) => setFormData({ ...formData, instructor: text })}
            placeholder="Enter instructor name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Class Time</Text>
          <TextInput
            style={styles.input}
            value={formData.time}
            onChangeText={(text) => setFormData({ ...formData, time: text })}
            placeholder="e.g., Daily • 7:00 AM"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Choose Cover Image</Text>
          <FlatList
            data={DEFAULT_IMAGES}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageList}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Class</Text>
        )}
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
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
  imageList: {
    marginTop: 8,
  },
  imageOption: {
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedImageOption: {
    borderColor: '#8B5CF6',
  },
  thumbnailImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  thumbnailText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  }
}); 