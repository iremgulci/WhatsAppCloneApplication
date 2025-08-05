
// Gerekli kütüphaneleri ve stilleri içe aktar
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { registerUser } from '../app/database';
import { Colors, GlobalStyles } from './SharedStyles';


// RegisterScreen bileşeninin props tipleri
type RegisterScreenProps = {
  onRegister: (user: any) => void; // Başarılı kayıt sonrası çağrılır
  onNavigateToLogin: () => void; // Giriş ekranına geçiş için çağrılır
};


// Kayıt ekranı bileşeni
export default function RegisterScreen({ onRegister, onNavigateToLogin }: RegisterScreenProps) {
  // Kullanıcı adı, isim, şifre ve hata mesajı için state'ler
  const [username, setUsername] = useState(''); // Kullanıcı adı
  const [name, setName] = useState(''); // Kullanıcının gerçek adı
  const [password, setPassword] = useState(''); // Şifre
  const [error, setError] = useState(''); // Hata mesajı

  // Kayıt ol butonuna basıldığında çalışır
  const handleRegister = async () => {
    try {
      // registerUser fonksiyonu ile yeni kullanıcı oluştur
      const user = await registerUser(username, name, password);
      if (user) {
        // Kayıt başarılıysa ana ekrana yönlendir
        onRegister(user);
      } else {
        // Kayıt başarısızsa hata mesajı göster
        setError('Kayıt başarısız. Kullanıcı adı zaten kullanılıyor olabilir.');
      }
    } catch (e: any) {
      // Sunucu veya ağ hatası olursa genel hata mesajı göster
      setError('Bir hata oluştu: ' + (e?.message || JSON.stringify(e)));
    }
  };

  // Ekran arayüzü
  return (
    <View style={[GlobalStyles.screenContainer, styles.container]}>
      {/* Başlık */}
      <Text style={styles.title}>Kayıt Ol</Text>

      {/* Kullanıcı adı girişi */}
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor={Colors.chatTime}
      />

      {/* İsim girişi */}
      <TextInput
        style={styles.input}
        placeholder="İsim"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
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

      {/* Kayıt ol butonu */}
      <View style={styles.buttonContainer}>
        <Button title="Kayıt Ol" color={Colors.whatsappLightGreen} onPress={handleRegister} />
      </View>

      {/* Giriş ekranına geçiş butonu */}
      <View style={styles.buttonContainer}>
        <Button title="Zaten hesabın var mı? Giriş Yap" color={Colors.chatTime} onPress={onNavigateToLogin} />
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
