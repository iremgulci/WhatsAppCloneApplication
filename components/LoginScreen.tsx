import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { loginUser } from '../app/database';
import { Colors, GlobalStyles } from './SharedStyles';

type LoginScreenProps = {
  onLogin: (user: any) => void;
  onNavigateToRegister: () => void;
};

export default function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const user = await loginUser(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Giriş başarısız. Bilgileri kontrol edin.');
      }
    } catch (e) {
      setError('Bir hata oluştu.');
    }
  };

  return (
    <View style={[GlobalStyles.screenContainer, styles.container]}>
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor={Colors.chatTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={Colors.chatTime}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.buttonContainer}>
        <Button title="Giriş Yap" color={Colors.whatsappLightGreen} onPress={handleLogin} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Hesabın yok mu? Kayıt Ol" color={Colors.chatTime} onPress={onNavigateToRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.whatsappGreen,
    marginBottom: 32,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  error: {
    color: Colors.errorRed,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
