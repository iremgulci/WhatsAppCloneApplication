import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { registerUser } from '../app/database';
import { Colors, GlobalStyles } from './SharedStyles';

type RegisterScreenProps = {
  onRegister: (user: any) => void;
  onNavigateToLogin: () => void;
};

export default function RegisterScreen({ onRegister, onNavigateToLogin }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const user = await registerUser(email, password);
      if (user) {
        onRegister(user);
      } else {
        setError('Kayıt başarısız. Email zaten kullanılıyor olabilir.');
      }
    } catch (e) {
      setError('Bir hata oluştu.');
    }
  };

  return (
    <View style={[GlobalStyles.screenContainer, styles.container]}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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
        <Button title="Kayıt Ol" color={Colors.whatsappLightGreen} onPress={handleRegister} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Zaten hesabın var mı? Giriş Yap" color={Colors.chatTime} onPress={onNavigateToLogin} />
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
