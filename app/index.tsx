import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Platform,
  Alert
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { GoogleSigninButton, GoogleSignin } from '@react-native-google-signin/google-signin';
import signInWithGoogle from '../services/googleSignIn';
import signIn from '../services/googleSignIn';

interface AuthError {
  code: string;
  message: string;
}

const getReadableError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Authentication error. Please try again.';
  }
};

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'none' | 'signin' | 'signup'>('none');
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const welcomeSlide = useRef(new Animated.Value(0)).current;
  
  const auth = getAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1053555661405-l23661mf8tmhf3dt1k3d2gv2cu0f1dug.apps.googleusercontent.com',
    });
  }, []);


  const animateTransition = (mode: 'none' | 'signin' | 'signup') => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: mode === 'signin' ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeSlide, {
        toValue: mode === 'none' ? 0 : -100,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      setAuthMode(mode);
      if (mode !== 'none') {
        slideAnimation.setValue(mode === 'signin' ? 50 : -50);
      }

      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(getAuth(), email, password);
      } else {
        await createUserWithEmailAndPassword(getAuth(), email, password);
      }
    } catch (error: any) {
      const readableError = getReadableError(error);
      Alert.alert(
        authMode === 'signin' ? 'Sign In Failed' : 'Sign Up Failed',
        readableError,
        [{ text: 'OK' }]
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Animated.View style={[
          styles.welcomeContainer,
          {
            transform: [{ translateY: welcomeSlide }]
          }
        ]}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Begin your mindfulness journey</Text>
        </Animated.View>

        {authMode === 'none' ? (
          <Animated.View
            style={[
              styles.authButtonsContainer,
              {
                opacity: fadeAnimation,
                transform: [{ translateX: slideAnimation }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => animateTransition('signin')}
            >
              <Text style={styles.authButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, styles.authButtonOutline]}
              onPress={() => animateTransition('signup')}
            >
              <Text style={[styles.authButtonText, styles.authButtonTextOutline]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnimation,
                transform: [{ translateX: slideAnimation }]
              }
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => animateTransition('none')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <TextInput
              value={email}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A5B4FC"
              autoCapitalize="none"
              onChangeText={setEmail}
            />

            <TextInput
              secureTextEntry
              value={password}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A5B4FC"
              autoCapitalize="none"
              onChangeText={setPassword}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#8B5CF6" />
            ) : (
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSigninButton
          style={styles.googleButton}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={signInWithGoogle}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A5B4FC',
    marginBottom: 48,
    textAlign: 'center',
  },
  authButtonsContainer: {
    marginBottom: 24,
  },
  authButton: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  authButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authButtonTextOutline: {
    color: '#8B5CF6',
  },
  formContainer: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#A5B4FC',
    fontSize: 16,
  },
  input: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  submitButton: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#A5B4FC',
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    width: '100%',
    height: 48,
  },
  welcomeContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
});
