import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { apiService } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister?: () => void;
}

export const LoginScreen = ({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) => {
  const [email, setEmail] = useState('test@example.com'); // Pre-filled for demo
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: '1087603000982-o9lmlpie9ug9115n90m9aci9ppf9bkgl.apps.googleusercontent.com',
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await apiService.login(email, password);
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        await apiService.googleSignIn(userInfo.data.idToken);
        onLoginSuccess();
      } else {
        Alert.alert('Error', 'Failed to get Google authentication token');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Quick Finance</Text>
        <Text style={styles.subtitle}>Super-fast expense entry</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.demo}>Demo credentials pre-filled</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.googleButtonContainer}>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={styles.googleButton}
            />
          </View>

          {onNavigateToRegister && (
            <TouchableOpacity
              style={styles.registerLink}
              onPress={onNavigateToRegister}
              disabled={loading}>
              <Text style={styles.registerLinkText}>
                Don't have an account? <Text style={styles.registerLinkTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demo: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 16,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#666',
    fontSize: 14,
  },
  registerLinkTextBold: {
    color: '#2196F3',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
  },
  googleButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: 12
  },
});
