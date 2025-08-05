
// Gerekli kütüphaneleri ve stilleri içe aktar
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { loginUser } from '../app/database';
import { Colors, GlobalStyles } from './SharedStyles';


// LoginScreen bileşeninin props tipleri
type LoginScreenProps = {
  onLogin: (user: any) => void; // Başarılı girişte çağrılır
  onNavigateToRegister: () => void; // Kayıt ekranına geçiş için çağrılır
};


// Login ekranı bileşeni
export default function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
  // Kullanıcı adı, şifre ve hata mesajı için state'ler
  const [username, setUsername] = useState(''); // Kullanıcı adı
  const [password, setPassword] = useState(''); // Şifre
  const [error, setError] = useState(''); // Hata mesajı

  // Giriş butonuna basıldığında çalışır
  const handleLogin = async () => {
    try {
      // loginUser fonksiyonu ile giriş bilgilerini kontrol et
      const user = await loginUser(username, password);
      if (user) {
        // Giriş başarılıysa ana ekrana yönlendir
        onLogin(user);
      } else {
        // Giriş başarısızsa hata mesajı göster
        setError('Giriş başarısız. Bilgileri kontrol edin.');
      }
    } catch (e) {
      // Sunucu veya ağ hatası olursa genel hata mesajı göster
      setError('Bir hata oluştu.');
    }
  };

  // Ekran arayüzü
  return (
    <View style={[GlobalStyles.screenContainer, styles.container]}>
      {/* Başlık */}
      <Text style={styles.title}>Giriş Yap</Text>

      {/* Kullanıcı adı girişi */}
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor={Colors.chatTime}
      />

      {/* Şifre girişi */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={Colors.chatTime}
      />

      {/* Hata mesajı gösterimi */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Giriş butonu */}
      <View style={styles.buttonContainer}>
        <Button title="Giriş Yap" color={Colors.whatsappLightGreen} onPress={handleLogin} />
      </View>

      {/* Kayıt olma butonu */}
      <View style={styles.buttonContainer}>
        <Button title="Hesabın yok mu? Kayıt Ol" color={Colors.chatTime} onPress={onNavigateToRegister} />
      </View>
    </View>
  );
}


// Ekran için stiller
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', // Dikeyde ortala
    padding: 24, // Kenar boşluğu
  },
  title: {
    fontSize: 28, // Başlık font boyutu
    fontWeight: 'bold', // Kalın başlık
    color: Colors.whatsappGreen, // Başlık rengi
    marginBottom: 32, // Alt boşluk
    alignSelf: 'center', // Ortala
  },
  input: {
    backgroundColor: Colors.inputBackground, // Giriş alanı arka planı
    borderColor: Colors.inputBorder, // Kenarlık rengi
    borderWidth: 1, // Kenarlık kalınlığı
    borderRadius: 8, // Kenar yuvarlaklığı
    padding: 12, // İç boşluk
    marginBottom: 16, // Alt boşluk
    fontSize: 16, // Yazı boyutu
    color: Colors.textPrimary, // Yazı rengi
  },
  error: {
    color: Colors.errorRed, // Hata rengi
    marginBottom: 16, // Alt boşluk
    textAlign: 'center', // Ortala
    fontWeight: 'bold', // Kalın yazı
  },
  buttonContainer: {
    marginBottom: 12, // Alt boşluk
    borderRadius: 8, // Kenar yuvarlaklığı
    overflow: 'hidden', // Taşanları gizle
  },
});
