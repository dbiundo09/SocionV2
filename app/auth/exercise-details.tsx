import React, { useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.8;

export default function ExerciseDetails() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const initialTime = 2 * 60; // 2 minutes in seconds

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const togglePlayPause = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#6b5b9e" />
        </TouchableOpacity>
        
        <View style={[styles.logoContainer]}>
          <Text style={[styles.logoText]}>om</Text>
        </View>

        <View style={{ width: 24 }} />
      </View>

      <View style={{height: 100}} />
      
      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <CountdownCircleTimer
          isPlaying={isPlaying}
          duration={initialTime}
          colors="#6b5b9e"
          size={CIRCLE_SIZE}
          strokeWidth={15}
          trailColor="#e6e6e6"
          rotation="counterclockwise"
          onComplete={() => {
            setIsPlaying(false);
            return { shouldRepeat: false }
          }}
        >
          {({ remainingTime }) => (
            !hasStarted ? (
              <TouchableOpacity 
                style={styles.playButton}
                onPress={togglePlayPause}
              >
                <Ionicons name="play" size={50} color="#6b5b9e" />
              </TouchableOpacity>
            ) : (
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
                <Text style={styles.exerciseTitle}>Morning Breathwork</Text>
              </View>
            )
          )}
        </CountdownCircleTimer>
      </View>

      {/* Audio Visualization - Only show after meditation has started */}
      {hasStarted && (
        <View style={styles.audioVisualization}>
          {/* Simple audio waveform visualization */}
          {Array.from({ length: 40 }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.waveformBar,
                { 
                  height: 10 + Math.random() * 40,
                  backgroundColor: isPlaying ? 
                    (index % 3 === 0 ? '#6b5b9e' : '#d2cce6') : 
                    '#d2cce6'
                }
              ]} 
            />
          ))}
        </View>
      )}

      {/* Control Button - Only show after meditation has started */}
      {hasStarted && (
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  logoText: {
    fontSize: 30, 
    color: '#6b5b9e',
  },
  timerContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(107, 91, 158, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '500',
    color: '#6b5b9e',
  },
  exerciseTitle: {
    fontSize: 16,
    color: '#9e9e9e',
    marginTop: 8,
  },
  audioVisualization: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 2,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#d2cce6',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6b5b9e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
});
