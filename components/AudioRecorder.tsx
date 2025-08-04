// Gerekli kütüphanelerin import edilmesi
import { Ionicons } from '@expo/vector-icons'; // Expo'nun icon kütüphanesi
import { Audio } from 'expo-av'; // Expo'nun ses kayıt ve oynatma kütüphanesi
import * as FileSystem from 'expo-file-system'; // Dosya sistemi işlemleri için
import * as React from 'react'; // React kütüphanesi
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // React Native bileşenleri
import { Colors } from './SharedStyles'; // Paylaşılan renkler

// AudioRecorder bileşeninin prop tiplerini tanımlama
interface AudioRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void; // Kayıt tamamlandığında çağrılacak fonksiyon
  onCancel: () => void; // İptal edildiğinde çağrılacak fonksiyon
}

// Ses kayıt bileşeni
const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  // State tanımlamaları
  const [recording, setRecording] = React.useState<Audio.Recording | null>(null); // Aktif kayıt objesi
  const [isRecording, setIsRecording] = React.useState(false); // Kayıt durumu
  const [recordingTime, setRecordingTime] = React.useState(0); // Kayıt süresi (saniye)
  const [hasPermission, setHasPermission] = React.useState(false); // Mikrofon izni durumu

  // Component mount olduğunda mikrofon izni iste
  React.useEffect(() => {
    (async () => {
      try {
        // Mikrofon izni iste
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted'); // İzin durumunu güncelle
      } catch (error) {
        console.log('Permission request failed:', error);
        setHasPermission(false); // Hata durumunda izni false yap
      }
    })();
  }, []);

  // Kayıt süresini takip eden effect
  React.useEffect(() => {
    let interval: number; // Interval ID'si
    if (isRecording) {
      // Her saniye kayıt süresini artır
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    // Component unmount olduğunda interval'i temizle
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Ses kaydını başlatma fonksiyonu
  const startRecording = async () => {
    try {
      // İzin kontrolü
      if (!hasPermission) {
        Alert.alert('İzin Gerekli', 'Ses kaydı için mikrofon izni gereklidir.');
        return;
      }

      // iOS için ses modunu ayarla
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true, // iOS'ta kayıt izni
        playsInSilentModeIOS: true, // Sessiz modda da çalışsın
      });

      // Yüksek kaliteli kayıt başlat
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      // State'leri güncelle
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0); // Süreyi sıfırla
      console.log('Recording started successfully');
    } catch (err) {
      console.log('Recording start error:', err);
      Alert.alert('Hata', 'Ses kaydı başlatılamadı. Lütfen tekrar deneyin.');
    }
  };

  // Ses kaydını durdurma fonksiyonu
  const stopRecording = async () => {
    if (!recording) {
      console.log('No recording to stop');
      return;
    }

    try {
      console.log('Stopping recording...');
      
      // Kaydı durdur ve yükle
      await recording.stopAndUnloadAsync();
      
      // Kayıt dosyasının URI'sini al
      const uri = recording.getURI();
      console.log('Recording URI:', uri);
      
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Süreyi milisaniye cinsinden hesapla (kayıt süresini kullan)
      const duration = recordingTime * 1000;
      console.log('Recording completed, duration:', duration, 'ms');
      
      // Kayıt tamamlandı callback'ini çağır
      onRecordingComplete(uri, duration);
      
    } catch (err) {
      console.log('Recording stop error:', err);
      Alert.alert('Hata', 'Ses kaydı durdurulamadı. Lütfen tekrar deneyin.');
    } finally {
      // State'leri temizle
      setRecording(null);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // Ses kaydını iptal etme fonksiyonu
  const cancelRecording = async () => {
    if (recording) {
      try {
        // Kaydı durdur
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          try {
            // Kayıt dosyasını sil
            await FileSystem.deleteAsync(uri);
          } catch (deleteError) {
            console.log('File delete error:', deleteError);
          }
        }
      } catch (error) {
        console.log('Cancel recording error:', error);
      } finally {
        // State'leri temizle
        setRecording(null);
        setIsRecording(false);
        setRecordingTime(0);
      }
    }
    // İptal callback'ini çağır
    onCancel();
  };

  // Süreyi dakika:saniye formatında formatlama fonksiyonu
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60); // Dakikaları hesapla
    const secs = seconds % 60; // Kalan saniyeleri hesapla
    return `${mins}:${secs.toString().padStart(2, '0')}`; // 00:00 formatında döndür
  };

  // İzin yoksa izin mesajı göster
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Mikrofon izni gerekli</Text>
      </View>
    );
  }

  // Ana render fonksiyonu
  return (
    <View style={styles.container}>
      {/* Kayıt bilgisi alanı */}
      <View style={styles.recordingInfo}>
        <Ionicons name="mic" size={20} color={Colors.whatsappLightGreen} />
        <Text style={styles.recordingText}>
          {isRecording ? `Kaydediliyor... ${formatTime(recordingTime)}` : 'Kayıt için basılı tutun'}
        </Text>
      </View>
      
      {/* Buton container'ı */}
      <View style={styles.buttonContainer}>
        {/* İptal butonu */}
        <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Kayıt butonu - basılı tutma ile çalışır */}
        <TouchableOpacity
          onPressIn={startRecording} // Basıldığında kaydı başlat
          onPressOut={stopRecording} // Bırakıldığında kaydı durdur
          style={[styles.recordButton, isRecording && styles.recordingButton]}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} // Kayıt durumuna göre icon değiştir
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  // Ana container stili
  container: {
    backgroundColor: Colors.inputBackground, // Arka plan rengi
    padding: 15, // İç boşluk
    borderRadius: 25, // Yuvarlak köşeler
    marginHorizontal: 10, // Yatay margin
    marginVertical: 5, // Dikey margin
  },
  // Kayıt bilgisi alanı stili
  recordingInfo: {
    flexDirection: 'row', // Yatay düzenleme
    alignItems: 'center', // Dikey ortala
    justifyContent: 'center', // Yatay ortala
    marginBottom: 10, // Alt margin
  },
  // Kayıt metni stili
  recordingText: {
    marginLeft: 8, // Sol margin
    fontSize: 16, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
  },
  // İzin metni stili
  permissionText: {
    textAlign: 'center', // Metni ortala
    fontSize: 16, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
  },
  // Buton container stili
  buttonContainer: {
    flexDirection: 'row', // Yatay düzenleme
    justifyContent: 'space-between', // Butonları aralıklı yerleştir
    alignItems: 'center', // Dikey ortala
  },
  // Kayıt butonu stili
  recordButton: {
    backgroundColor: Colors.whatsappLightGreen, // WhatsApp yeşili
    width: 50, // Genişlik
    height: 50, // Yükseklik
    borderRadius: 25, // Yuvarlak buton
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
    flex: 1, // Kalan alanı doldur
    marginHorizontal: 20, // Yatay margin
  },
  // Kayıt sırasında buton stili (kırmızı)
  recordingButton: {
    backgroundColor: '#ff4444', // Kırmızı renk
  },
  // İptal butonu stili
  cancelButton: {
    backgroundColor: '#666', // Gri renk
    width: 40, // Genişlik
    height: 40, // Yükseklik
    borderRadius: 20, // Yuvarlak buton
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
  },
});

export default AudioRecorder; 