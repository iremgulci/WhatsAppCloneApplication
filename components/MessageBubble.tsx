// Gerekli kütüphanelerin import edilmesi
import { Ionicons } from '@expo/vector-icons'; // Expo'nun icon kütüphanesi
import { Audio } from 'expo-av'; // Expo'nun ses oynatma kütüphanesi
import * as FileSystem from 'expo-file-system'; // Expo'nun dosya sistemi kütüphanesi
import * as Sharing from 'expo-sharing'; // Expo'nun paylaşım kütüphanesi
import * as React from 'react'; // React kütüphanesi
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // React Native bileşenleri
import { Colors } from './SharedStyles'; // Paylaşılan renkler

// Mesaj veri yapısını tanımlama
export interface Message {
  id: string; // Mesaj benzersiz ID'si
  text: string; // Mesaj metni
  isMine: boolean; // Mesajın bana ait olup olmadığı
  time: string; // Mesaj gönderilme zamanı
  type?: string; // Mesaj tipi (text, audio, file, vb.)
  audioUri?: string; // Ses dosyası URI'si (ses mesajları için)
  audioDuration?: number; // Ses dosyası süresi (milisaniye)
  fileUri?: string; // Dosya URI'si (dosya mesajları için)
  fileName?: string; // Dosya adı
  fileSize?: number; // Dosya boyutu (byte)
}

// MessageBubble bileşeninin prop tiplerini tanımlama
interface MessageBubbleProps {
  message: Message; // Gösterilecek mesaj objesi
}

// Mesaj balonu bileşeni - metin ve ses mesajlarını gösterir
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  // State tanımlamaları
  const [sound, setSound] = React.useState<Audio.Sound | null>(null); // Ses oynatma objesi
  const [isPlaying, setIsPlaying] = React.useState(false); // Ses oynatma durumu
  const [duration, setDuration] = React.useState(0); // Ses dosyası süresi

  // Component unmount olduğunda ses dosyasını temizle
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // Ses dosyasını bellekten kaldır
        }
      : undefined;
  }, [sound]);

  // Ses dosyasını oynatma/duraklatma fonksiyonu
  const playSound = async () => {
    if (!message.audioUri) return; // Ses URI'si yoksa çık

    try {
      if (sound) {
        // Ses objesi zaten varsa oynat/duraklat
        if (isPlaying) {
          await sound.stopAsync(); // Oynatmayı durdur
          setIsPlaying(false);
        } else {
          await sound.playAsync(); // Oynatmaya devam et
          setIsPlaying(true);
        }
      } else {
        // Yeni ses objesi oluştur ve oynat
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.audioUri }, // Ses dosyası URI'si
          { shouldPlay: true } // Hemen oynatmaya başla
        );
        setSound(newSound);
        setIsPlaying(true);

        // Ses oynatma durumunu takip et
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0); // Süreyi güncelle
            if (status.didJustFinish) {
              setIsPlaying(false); // Oynatma bittiğinde durumu güncelle
            }
          }
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Ses dosyası oynatılamadı.');
    }
  };

  // Milisaniyeyi dakika:saniye formatına çevirme fonksiyonu
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000); // Milisaniyeyi saniyeye çevir
    const minutes = Math.floor(seconds / 60); // Dakikaları hesapla
    const remainingSeconds = seconds % 60; // Kalan saniyeleri hesapla
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`; // 00:00 formatında döndür
  };

  // Dosya boyutunu formatlama fonksiyonu
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Dosya uzantısını alma fonksiyonu
  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  // Dosya tipine göre icon belirleme fonksiyonu
  const getFileIcon = (fileName: string) => {
    const extension = getFileExtension(fileName);
    switch (extension) {
      case 'pdf':
        return 'document-text';
      case 'doc':
      case 'docx':
        return 'document';
      case 'xls':
      case 'xlsx':
        return 'grid';
      case 'ppt':
      case 'pptx':
        return 'easel';
      case 'txt':
        return 'text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'videocam';
      case 'mp3':
      case 'wav':
      case 'm4a':
        return 'musical-notes';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'document';
    }
  };

  // Dosyayı açma/paylaşma fonksiyonu
  const handleFilePress = async () => {
    if (!message.fileUri) return;

    try {
      // Dosyanın var olup olmadığını kontrol et
      const fileInfo = await FileSystem.getInfoAsync(message.fileUri);
      if (!fileInfo.exists) {
        Alert.alert('Hata', 'Dosya bulunamadı.');
        return;
      }

      // Dosyayı paylaş
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(message.fileUri);
      } else {
        Alert.alert('Bilgi', 'Paylaşım özelliği bu cihazda mevcut değil.');
      }
    } catch (error) {
      console.log('Error handling file:', error);
      Alert.alert('Hata', 'Dosya açılamadı.');
    }
  };

  // Mesaj içeriğini render etme fonksiyonu
  const renderMessageContent = () => {
    if (message.type === 'audio' && message.audioUri) {
      // Ses mesajı için özel görünüm
      return (
        <View style={styles.audioContainer}>
          {/* Ses oynatma/duraklatma butonu */}
          <TouchableOpacity onPress={playSound} style={styles.audioButton}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} // Oynatma durumuna göre icon değiştir
              size={24} 
              color={message.isMine ? Colors.textPrimary : Colors.textPrimary} 
            />
          </TouchableOpacity>
          {/* Ses bilgisi alanı */}
          <View style={styles.audioInfo}>
            {/* Ses dalga formu animasyonu */}
            <View style={styles.audioWaveform}>
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
            </View>
            {/* Ses süresi */}
            <Text style={styles.audioDuration}>
              {formatDuration(message.audioDuration || 0)}
            </Text>
          </View>
        </View>
      );
    }

    if (message.type === 'file' && message.fileUri && message.fileName) {
      // Dosya mesajı için özel görünüm
      return (
        <TouchableOpacity onPress={handleFilePress} style={styles.fileContainer}>
          {/* Dosya icon'u */}
          <View style={styles.fileIconContainer}>
            <Ionicons 
              name={getFileIcon(message.fileName) as any} 
              size={32} 
              color={message.isMine ? Colors.textPrimary : Colors.textPrimary} 
            />
          </View>
          {/* Dosya bilgileri */}
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, message.isMine ? styles.myMessageText : styles.otherMessageText]}>
              {message.fileName}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(message.fileSize || 0)}
            </Text>
          </View>
          {/* İndirme icon'u */}
          <View style={styles.downloadIcon}>
            <Ionicons 
              name="download" 
              size={20} 
              color={message.isMine ? Colors.textPrimary : Colors.textPrimary} 
            />
          </View>
        </TouchableOpacity>
      );
    }

    // Metin mesajı için normal görünüm
    return (
      <Text style={message.isMine ? styles.myMessageText : styles.otherMessageText}>
        {message.text}
      </Text>
    );
  };

  // Ana render fonksiyonu
  return (
    <View style={[
      styles.messageBubble,
      message.isMine ? styles.myMessageBubble : styles.otherMessageBubble // Mesaj sahibine göre stil
    ]}>
      {/* Mesaj içeriği */}
      {renderMessageContent()}
      {/* Mesaj zamanı */}
      <Text style={[styles.messageTime, message.isMine ? styles.myMessageTime : styles.otherMessageTime]}>
        {message.time}
      </Text>
    </View>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  // Ana mesaj balonu stili
  messageBubble: {
    maxWidth: '75%', // Maksimum genişlik
    padding: 10, // İç boşluk
    borderRadius: 8, // Yuvarlak köşeler
    marginBottom: 5, // Alt margin
    position: 'relative', // Pozisyon referansı
  },
  // Benim mesajım için stil
  myMessageBubble: {
    alignSelf: 'flex-end', // Sağa hizala
    backgroundColor: Colors.messageBackgroundMine, // Benim mesaj rengi
  },
  // Diğer kişinin mesajı için stil
  otherMessageBubble: {
    alignSelf: 'flex-start', // Sola hizala
    backgroundColor: Colors.messageBackgroundOther, // Diğer mesaj rengi
  },
  // Benim mesaj metni stili
  myMessageText: {
    fontSize: 16, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
  },
  // Diğer kişinin mesaj metni stili
  otherMessageText: {
    fontSize: 16, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
  },
  // Mesaj zamanı genel stili
  messageTime: {
    fontSize: 10, // Küçük font boyutu
    color: Colors.chatTime, // Zaman rengi
    alignSelf: 'flex-end', // Sağa hizala
    marginTop: 5, // Üst margin
  },
  // Benim mesaj zamanı stili
  myMessageTime: {
    color: Colors.blueTick, // Mavi tik rengi
  },
  // Diğer kişinin mesaj zamanı stili
  otherMessageTime: {
    color: Colors.chatTime, // Normal zaman rengi
  },
  // Ses mesajı container stili
  audioContainer: {
    flexDirection: 'row', // Yatay düzenleme
    alignItems: 'center', // Dikey ortala
    minWidth: 120, // Minimum genişlik
  },
  // Ses oynatma butonu stili
  audioButton: {
    width: 40, // Genişlik
    height: 40, // Yükseklik
    borderRadius: 20, // Yuvarlak buton
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Yarı şeffaf arka plan
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
    marginRight: 10, // Sağ margin
  },
  // Ses bilgisi alanı stili
  audioInfo: {
    flex: 1, // Kalan alanı doldur
  },
  // Ses dalga formu container stili
  audioWaveform: {
    flexDirection: 'row', // Yatay düzenleme
    alignItems: 'flex-end', // Alt hizala
    height: 30, // Yükseklik
    marginBottom: 5, // Alt margin
  },
  // Ses dalga çubuğu stili
  audioBar: {
    width: 3, // Genişlik
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Yarı şeffaf renk
    marginHorizontal: 1, // Yatay margin
    borderRadius: 2, // Yuvarlak köşeler
  },
  // Oynatma sırasında ses dalga çubuğu stili
  audioBarPlaying: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Daha parlak renk
  },
  // Ses süresi metni stili
  audioDuration: {
    fontSize: 12, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
    opacity: 0.8, // Şeffaflık
  },
  // Dosya container stili
  fileContainer: {
    flexDirection: 'row', // Yatay düzenleme
    alignItems: 'center', // Dikey ortala
    minWidth: 200, // Minimum genişlik
    padding: 8, // İç boşluk
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Yarı şeffaf arka plan
    borderRadius: 8, // Yuvarlak köşeler
  },
  // Dosya icon container stili
  fileIconContainer: {
    width: 48, // Genişlik
    height: 48, // Yükseklik
    borderRadius: 8, // Yuvarlak köşeler
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Yarı şeffaf arka plan
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
    marginRight: 12, // Sağ margin
  },
  // Dosya bilgisi alanı stili
  fileInfo: {
    flex: 1, // Kalan alanı doldur
    justifyContent: 'center', // İçeriği ortala
  },
  // Dosya adı stili
  fileName: {
    fontSize: 14, // Font boyutu
    fontWeight: '500', // Font kalınlığı
    marginBottom: 2, // Alt margin
  },
  // Dosya boyutu stili
  fileSize: {
    fontSize: 12, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
    opacity: 0.7, // Şeffaflık
  },
  // İndirme icon stili
  downloadIcon: {
    width: 32, // Genişlik
    height: 32, // Yükseklik
    borderRadius: 16, // Yuvarlak buton
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Yarı şeffaf arka plan
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
  },
});

export default MessageBubble;