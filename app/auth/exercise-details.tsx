import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.8;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const CIRCLE_STROKE_WIDTH = 15;

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ExerciseDetails() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(2 * 60); // 15 minutes in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animatedValue = useRef(new Animated.Value(1)).current;

  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * (CIRCLE_RADIUS - CIRCLE_STROKE_WIDTH / 2);
  
  // Create the animated stroke dashoffset that will make the circle appear to empty
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const togglePlayPause = async () => {
    if (isPlaying) {
      // Pause
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Pause the animation
      animatedValue.stopAnimation();
      setIsPlaying(false);
    } else {
      // Play      
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start or resume the circle animation
      if (!hasStarted) {
        // If first time starting, reset animation
        animatedValue.setValue(1);
      }
      
      // Animate the circle fill
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: timeRemaining * 1000, // Convert seconds to milliseconds
        useNativeDriver: true,
      }).start();
      
      setIsPlaying(true);
      
      // Set hasStarted to true when play is first pressed
      if (!hasStarted) {
        setHasStarted(true);
      }
    }
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

      <View style={{height: 100}} /> {/* MAKE THIS DYNAMIC */}
      {/* Timer Circle -- What should  when timer ends??? */}
      <View style={styles.timerContainer}>
        <Svg height={CIRCLE_SIZE} width={CIRCLE_SIZE}>
          {/* Background Circle */}
          <Circle
            cx={CIRCLE_RADIUS}
            cy={CIRCLE_RADIUS}
            r={CIRCLE_RADIUS - CIRCLE_STROKE_WIDTH / 2}
            strokeWidth={CIRCLE_STROKE_WIDTH}
            stroke="#e6e6e6"
            fill="none"
          />
          
          {/* Progress Circle */}
          <AnimatedCircle
            cx={CIRCLE_RADIUS}
            cy={CIRCLE_RADIUS}
            r={CIRCLE_RADIUS - CIRCLE_STROKE_WIDTH / 2}
            strokeWidth={CIRCLE_STROKE_WIDTH}
            stroke="#6b5b9e"
            fill="none"
            strokeDasharray={[circumference, circumference]}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CIRCLE_RADIUS} ${CIRCLE_RADIUS})`}
          />
        </Svg>
        
        <View style={styles.timerContent}>
          {!hasStarted ? (
            <TouchableOpacity 
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Ionicons name="play" size={50} color="#6b5b9e" />
            </TouchableOpacity>
          ) : (
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.exerciseTitle}>Morning Breathwork</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{height: 5}} /> {/* MAKE THIS DYNAMIC */}

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
  timerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
