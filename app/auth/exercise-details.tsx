import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Exercise } from '@/app/types/exercise';
import getMedia from '@/services/userServices/getMedia';
import markCompleted from '@/services/userServices/markCompleted';
import { Video, ResizeMode } from 'expo-av';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.8;
const NUM_PARTICLES = 20; // Number of particles for the explosion effect

const STREAK_MESSAGES = [
  "Keep that streak alive! ⚡️",
  "On fire! 🌟",
  "You're crushing it! 💪",
  "Unstoppable! 🚀",
  "The streak continues! 🔥",
  "You're on a roll! 🎯",
  "Nothing can stop you! 💫",
  "Keep the momentum going! ⚡️",
  "You're a meditation machine! 🧘‍♂️",
  "The streak is strong with you! ✨"
];

const getRandomStreakMessage = () => {
  return STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
};

export default function ExerciseDetails() {
  const router = useRouter();
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const exerciseData: Exercise = exercise ? JSON.parse(exercise) : null;
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [mediaData, setMediaData] = useState<{ content: string; media_type: string } | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  
  // Animation values for ripple effect
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  
  // Create particle animation values
  const particles = Array.from({ length: NUM_PARTICLES }).map(() => ({
    position: useRef(new Animated.ValueXY({ x: 0, y: 0 })).current,
    opacity: useRef(new Animated.Value(1)).current,
    scale: useRef(new Animated.Value(1)).current,
    rotation: useRef(new Animated.Value(0)).current,
    // Random values for each particle
    angle: Math.random() * Math.PI * 2,
    distance: CIRCLE_SIZE * (0.3 + Math.random() * 0.7),
    size: 5 + Math.random() * 15,
    color: Math.random() > 0.6 ? '#6b5b9e' : '#8a7aba',
    delay: Math.random() * 300,
    duration: 1500 + Math.random() * 1000,
  }));


  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const streakScale = useRef(new Animated.Value(0)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only attempt to load media if there's a video or audio URL
    if (exerciseData?.video_url || exerciseData?.audio_url) {
      loadMedia();
    }
    
    return () => {
      // Cleanup media resources
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  const loadMedia = async () => {
    if (!exerciseData?.exercise_id) return;
    
    try {
      setIsLoadingMedia(true);
      setMediaError(null);
      setLoadingProgress(0);

      const media = await getMedia(exerciseData.exercise_id);
      
      if (!media || !media.content) {
        throw new Error('No media content received');
      }

      // Ensure the URL is properly formatted
      const mediaUrl = media.content.startsWith('http') ? media.content : `https://${media.content}`;

      setMediaData({
        ...media,
        content: mediaUrl
      });
      
      // If it's audio, prepare the sound
      if (media.media_type.startsWith('audio/')) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: mediaUrl },
          { shouldPlay: false }
        );
        audioRef.current = sound;
      }

      setIsLoadingMedia(false);
    } catch (error: any) {
      console.error('Error loading media:', error);
      // Only set error if it's not a 404 (no media found)
      if (error?.response?.status !== 404) {
        setMediaError('Failed to load media');
      }
      setIsLoadingMedia(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const togglePlayPause = async () => {
    if (isLoadingMedia) return; // Prevent playback while loading
    
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);

    // Handle media playback
    if (mediaData) {
      if (mediaData.media_type.startsWith('video/')) {
        if (videoRef.current) {
          if (isPlaying) {
            await videoRef.current.pauseAsync();
          } else {
            await videoRef.current.playAsync();
          }
        }
      } else if (mediaData.media_type.startsWith('audio/')) {
        if (audioRef.current) {
          if (isPlaying) {
            await audioRef.current.pauseAsync();
          } else {
            await audioRef.current.playAsync();
          }
        }
      }
    }
  };

  // Create ripple animation
  const startRippleAnimation = () => {
    setIsComplete(true);
    
    // Fill animation
    Animated.timing(scale, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    
    // Create repeated ripple effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleScale, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(rippleScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]),
      { iterations: 2 }
    ).start(() => {
      // After ripple completes, start particle explosion
      setShowParticles(true);
      startParticleAnimation();
      
      // Fade out the circle
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Create the particle explosion animation
  const startParticleAnimation = () => {
    // Animate each particle
    particles.forEach(particle => {
      const targetX = Math.cos(particle.angle) * particle.distance;
      const targetY = Math.sin(particle.angle) * particle.distance;
      
      // Create a sequence of animations for this particle
      Animated.sequence([
        // Delay based on particle
        Animated.delay(particle.delay),
        // Run these animations in parallel
        Animated.parallel([
          // Position animation
          Animated.timing(particle.position, {
            toValue: { x: targetX, y: targetY },
            duration: particle.duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Opacity animation (fade out)
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: particle.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Scale animation (get smaller)
          Animated.timing(particle.scale, {
            toValue: 0.2,
            duration: particle.duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Rotation animation
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 2 - 1, // Random rotation -1 to 1 (full circles)
            duration: particle.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ]).start();
    });
  };

  const startStreakAnimation = () => {
    setShowStreakAnimation(true);
    Animated.parallel([
      Animated.spring(streakScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(streakOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(streakOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowStreakAnimation(false);
          streakScale.setValue(0);
        });
      }, 2000);
    });
  };

  const renderMediaPlayer = () => {
    if (mediaError) {
      return (
        <View style={styles.mediaContainer}>
          <Text style={styles.errorText}>{mediaError}</Text>
        </View>
      );
    }

    if (mediaData) {
      if (mediaData.media_type.startsWith('video/')) {
        return (
          <View style={styles.mediaContainer}>
            <Video
              ref={videoRef}
              source={{ uri: mediaData.content }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onError={(error) => {
                console.error('Video playback error:', error);
                setMediaError('Failed to play video');
              }}
              onLoad={() => {
                console.log('Video loaded successfully');
              }}
              shouldPlay={false}
              isMuted={false}
            />
          </View>
        );
      }

      if (mediaData.media_type.startsWith('audio/')) {
        return (
          <View style={styles.mediaContainer}>
            <View style={styles.audioPlayer}>
              <Ionicons name="musical-notes" size={40} color="#6b5b9e" />
            </View>
          </View>
        );
      }
    }

    // Show description for read-through meditation
    return (
      <View style={styles.mediaContainer}>
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionHeader}>
            <Ionicons name="book-outline" size={24} color="#6b5b9e" />
            <Text style={styles.descriptionTitle}>Read Through Meditation</Text>
          </View>
          <ScrollView style={styles.descriptionScroll}>
            <Text style={styles.descriptionText}>{exerciseData.exercise_description}</Text>
          </ScrollView>
        </View>
      </View>
    );
  };

  if (!exerciseData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No exercise data available</Text>
      </View>
    );
  }

  if (isLoadingMedia) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Meditation</Text>
          <ActivityIndicator size="large" color="#6b5b9e" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { justifyContent: 'space-between' }]}>
        {(!isComplete || exerciseData.completed) && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#6b5b9e" />
          </TouchableOpacity>
        )}
        
        <View style={[styles.logoContainer]}>
          <Text style={[styles.logoText]}>om</Text>
        </View>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Circle */}
        <View style={styles.timerSection}>
          <View style={styles.timerContainer}>
            {/* Purple fill circle that shows on completion */}
            {isComplete && (
              <Animated.View 
                style={[
                  styles.completionCircle,
                  {
                    transform: [
                      { scale: rippleScale },
                    ],
                    opacity: opacity,
                    backgroundColor: '#6b5b9e',
                  }
                ]} 
              />
            )}
            
            {/* Particles for explosion effect */}
            {showParticles && particles.map((particle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    backgroundColor: particle.color,
                    opacity: particle.opacity,
                    transform: [
                      { translateX: particle.position.x },
                      { translateY: particle.position.y },
                      { scale: particle.scale },
                      { rotate: particle.rotation.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ['-360deg', '360deg']
                      })}
                    ],
                  }
                ]}
              />
            ))}
          
            <CountdownCircleTimer
              isPlaying={isPlaying}
              duration={exerciseData.time}
              colors="#6b5b9e"
              size={CIRCLE_SIZE}
              strokeWidth={15}
              trailColor="#e6e6e6"
              rotation="counterclockwise"
              onComplete={() => {
                setIsPlaying(false);
                startRippleAnimation();
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
                    <Text style={styles.timeText}>
                      {remainingTime === 0 && isComplete ? "Done!" : formatTime(remainingTime)}
                    </Text>
                    <Text style={styles.exerciseTitle}>{exerciseData.exercise_name}</Text>
                  </View>
                )
              )}
            </CountdownCircleTimer>
          </View>
        </View>

        {/* Media Player */}
        {renderMediaPlayer()}

        {/* Control Button - Only show after meditation has started and not completed */}
        {hasStarted && !isComplete && (
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

        {/* Streak Animation */}
        {showStreakAnimation && (
          <Animated.View 
            style={[
              styles.streakContainer,
              {
                transform: [{ scale: streakScale }],
                opacity: streakOpacity,
              }
            ]}
          >
            <View style={styles.streakContent}>
              <Ionicons name="flame" size={40} color="#FF6B6B" />
              <Text style={styles.streakText}>+1 Streak!</Text>
              <Text style={styles.streakSubtext}>{getRandomStreakMessage()}</Text>
            </View>
          </Animated.View>
        )}

        {/* Done button - Show after completion */}
        {isComplete && !exerciseData.completed && (
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={async () => {
              try {
                if (exerciseData.exercise_id) {
                  const response = await markCompleted(exerciseData.exercise_id);
                  if (response?.streak_changed) {
                    startStreakAnimation();
                    // Wait for animation to complete before navigating back
                    setTimeout(() => {
                      router.back();
                    }, 3000);
                  } else {
                    router.back();
                  }
                }
              } catch (error) {
                console.error('Error marking exercise as complete:', error);
              }
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  timerSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  timerContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  completionCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#6b5b9e',
    opacity: 0.7,
    zIndex: 5,
  },
  particle: {
    position: 'absolute',
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
    alignSelf: 'center',
  },
  doneButton: {
    width: 120,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6b5b9e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    alignSelf: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  video: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000', // Add background color for video container
  },
  audioPlayer: {
    width: width - 40,
    height: 100,
    backgroundColor: 'rgba(107, 91, 158, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  descriptionContainer: {
    width: '100%',
    backgroundColor: 'rgba(107, 91, 158, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    height: 200,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b5b9e',
  },
  descriptionScroll: {
    flex: 1,
    height: 120,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'left',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '80%',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b5b9e',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(107, 91, 158, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6b5b9e',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6b5b9e',
    marginTop: 8,
  },
  streakContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  streakContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 10,
  },
  streakSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
