// Gerekli kütüphanelerin import edilmesi
import { Ionicons } from '@expo/vector-icons'; // Expo'nun icon kütüphanesi
import { format } from 'date-fns'; // Tarih formatlama kütüphanesi
import { tr } from 'date-fns/locale'; // Türkçe tarih formatı
import * as DocumentPicker from 'expo-document-picker'; // Dosya seçici kütüphanesi
import * as FileSystem from 'expo-file-system'; // Dosya sistemi kütüphanesi
import { useLocalSearchParams, useRouter } from 'expo-router'; // URL parametrelerini okuma hook'u
import * as React from 'react'; // React kütüphanesi
import {
  Alert, // Uyarı mesajları için
  FlatList, // Liste görünümü için
  KeyboardAvoidingView, // Klavye açıldığında içeriği yukarı kaydırma
  Platform, // Platform bilgisi (iOS/Android)
  SafeAreaView, // Güvenli alan görünümü
  StyleSheet, // Stil tanımlama
  Text, // Metin bileşeni
  TextInput, // Metin girişi
  TouchableOpacity, // Dokunulabilir buton
  View // Temel görünüm bileşeni
} from 'react-native';
import AudioRecorder from '../../components/AudioRecorder'; // Ses kayıt bileşeni
import MessageBubble, { Message } from '../../components/MessageBubble'; // Mesaj balonu bileşeni
import { Colors } from '../../components/SharedStyles'; // Paylaşılan renkler
import { addMessage, deleteMessage, ensureChatForIncomingMessage, getMessagesBetweenUsers, getMessagesForChat } from '../database'; // Veritabanı işlemleri

// WebSocket sunucu adresi
const WS_URL = 'ws://192.168.60.14:8080'; // Bilgisayarınızın IP adresini girin

// Chat detay ekranı bileşeni
export default function ChatDetailScreen() {
  // URL'den chat ID'sini al
  const params = useLocalSearchParams();
  const router = useRouter();
  const chatId = Number(params.chatId);
  const currentUserId = params.currentUserId as string;
  const otherUserId = params.otherUserId as string; // <-- add this line

  // State tanımlamaları
  const [messageInput, setMessageInput] = React.useState(''); // Mesaj giriş metni
  const [messages, setMessages] = React.useState<Message[]>([]); // Mesajlar listesi
  const [showAudioRecorder, setShowAudioRecorder] = React.useState(false); // Ses kayıt görünürlüğü
  const [showAttachmentMenu, setShowAttachmentMenu] = React.useState(false); // Dosya ekleme menüsü görünürlüğü
  const [ws, setWs] = React.useState<WebSocket | null>(null); // WebSocket bağlantısı
  const [userId, setUserId] = React.useState<string>(currentUserId || ''); // Kullanıcı kimliği

  // Mesajları yükleme fonksiyonu
  const loadMessages = React.useCallback(() => {
    // Veritabanından mesajları al ve formatla
    let allMessages = getMessagesForChat(chatId);

    // 1-1 sohbet: her iki kullanıcı arasındaki mesajları getir (farklı chatId'lerde kaydedilmiş olsa bile)
    if (userId && otherUserId) {
      allMessages = getMessagesBetweenUsers(userId, otherUserId);
    }
    
    // Sadece mevcut kullanıcının gönderdiği veya aldığı mesajları filtrele
    const userMessages = allMessages.filter((m: any) => {
      if (userId && m.senderId) {
        // Eğer senderId varsa, mevcut kullanıcının gönderdiği veya aldığı mesajlar
        // receiverId 'all' ise tüm kullanıcılar görebilir
        return m.senderId === userId || m.receiverId === userId || m.receiverId === 'all';
      } else {
        // Eski mesajlar için tüm mesajları göster
        return true;
      }
    });
    
    const msgs = userMessages.map((m: any) => {
      let formattedTime = m.time;
      // Tarih formatını kontrol et ve düzenle
      if (m.time) {
        const parsed = Date.parse(m.time);
        if (!isNaN(parsed)) {
          const d = new Date(parsed);
          // Türkçe tarih formatı: gün.ay.yıl saat:dakika
          formattedTime = format(d, 'dd.MM.yy HH:mm', { locale: tr });
        }
      }
      
      // Mesajın kimin tarafından gönderildiğini belirle
      let isMine = false;
      if (m.senderId && userId) {
        // Eğer senderId varsa ve mevcut kullanıcıya aitse
        isMine = m.senderId === userId;
      } else {
        // Eski mesajlar için isMine değerini kullan
        isMine = !!m.isMine;
      }
      
      // Mesaj objesini döndür
      return {
        id: m.id.toString(),
        text: m.text,
        isMine: isMine,
        time: formattedTime,
        type: m.type || 'text', // Varsayılan tip text
        audioUri: m.audioUri,
        audioDuration: m.audioDuration,
        fileUri: m.fileUri,
        fileName: m.fileName,
        fileSize: m.fileSize,
      };
    });
    setMessages(msgs);
  }, [chatId, userId, otherUserId]);

  // Component mount olduğunda çalışacak effect
  React.useEffect(() => {
    loadMessages(); // Mesajları yükle

    // Kullanıcı kimliğini ayarla - her oturum için sabit olmalı
    let finalUserId = userId;
    if (!finalUserId) {
      // Eğer userId yoksa yeni oluştur
      finalUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(finalUserId);
    }

    // WebSocket bağlantısını başlat
    const socket = new WebSocket(WS_URL);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'login', userId: finalUserId }));
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message && data.from !== finalUserId) {
          const time = new Date().toISOString();
          addMessage(chatId, data.message, false, time, 'text', undefined, undefined, undefined, undefined, undefined, data.from, finalUserId);
          
          // Gelen mesaj için chat satırı oluştur (eğer yoksa)
          try {
            const currentUserNumericId = Number(currentUserId?.replace('user_', '') || '0');
            if (currentUserNumericId > 0) {
              ensureChatForIncomingMessage(currentUserNumericId, finalUserId, data.from);
              console.log('Chat row created for incoming message from:', data.from);
            }
          } catch (err) {
            console.log('Error ensuring chat for incoming message:', err);
          }
          
          loadMessages();
        }
      } catch (err) {
        console.log('WebSocket message error:', err);
      }
    };
    setWs(socket);
    return () => {
      socket.close();
    };
  }, [chatId, loadMessages, userId, otherUserId, router]);

  // Mesajları ters çevir (en yeni mesajlar altta görünsün)
  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  // Mesaj gönderme fonksiyonu
  const handleSendMessage = () => {
    if (messageInput.trim()) { // Boş mesaj kontrolü
      const time = new Date().toISOString(); // Şu anki zamanı al
      addMessage(chatId, messageInput.trim(), true, time, 'text', undefined, undefined, undefined, undefined, undefined, userId, otherUserId); // Veritabanına mesaj ekle
      loadMessages(); // Mesajları yeniden yükle
      setMessageInput(''); // Input'u temizle
      // WebSocket ile mesajı gönder - tüm diğer kullanıcılara gönder
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'message',
            from: userId,
            to: otherUserId || 'all', // Birebir sohbet için karşı tarafın ID'si
            message: messageInput.trim(),
          })
        );
      }
    }
  };

  // Ses kaydı tamamlandığında çalışacak fonksiyon
  const handleAudioRecordingComplete = (uri: string, duration: number) => {
    console.log('Audio recording completed:', { uri, duration });
    
    try {
      const time = new Date().toISOString();
      // Ses kaydını veritabanına ekle
      addMessage(chatId, 'Ses kaydı', true, time, 'audio', uri, duration, undefined, undefined, undefined, userId, otherUserId);
      loadMessages(); // Mesajları yeniden yükle
      setShowAudioRecorder(false); // Ses kayıt görünümünü kapat
      
      console.log('Audio message added successfully');
    } catch (error) {
      console.log('Error adding audio message:', error);
      Alert.alert('Hata', 'Ses kaydı gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Ses kaydını iptal etme fonksiyonu
  const handleAudioRecordingCancel = () => {
    setShowAudioRecorder(false); // Ses kayıt görünümünü kapat
  };

  // Dosya seçme fonksiyonu
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Tüm dosya tiplerini kabul et
        copyToCacheDirectory: true, // Dosyayı cache'e kopyala
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);

        // Dosya boyutunu al
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        const fileSize = fileInfo.exists ? fileInfo.size : 0;

        // Dosya mesajını veritabanına ekle
        const time = new Date().toISOString();
        addMessage(
          chatId, 
          `Dosya: ${file.name}`, 
          true, 
          time, 
          'file', 
          undefined, 
          undefined, 
          file.uri, 
          file.name, 
          fileSize,
          userId,
          otherUserId
        );
        
        loadMessages(); // Mesajları yeniden yükle
        setShowAttachmentMenu(false); // Dosya ekleme menüsünü kapat
        console.log('File message added successfully');
      }
    } catch (error) {
      console.log('Error selecting file:', error);
      Alert.alert('Hata', 'Dosya seçilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Mesaja uzun basıldığında çalışacak fonksiyon (silme işlemi)
  const handleLongPressMessage = (messageId: string) => {
    Alert.alert(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' }, // İptal butonu
        {
          text: 'Sil',
          style: 'destructive', // Kırmızı renk
          onPress: () => {
            deleteMessage(Number(messageId)); // Mesajı sil
            loadMessages(); // Mesajları yeniden yükle
          },
        },
      ]
    );
  };

  // Ses kayıt görünümünü açma/kapama fonksiyonu
  const toggleAudioRecorder = () => {
    setShowAudioRecorder(!showAudioRecorder);
  };

  // Dosya ekleme menüsünü açma/kapama fonksiyonu
  const toggleAttachmentMenu = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  // Ana render fonksiyonu
  return (
    <SafeAreaView style={styles.chatDetailContainer}>
      {/* Mesajlar listesi */}
      <FlatList
        data={reversedMessages}
        keyExtractor={(item) => item.id} // Her mesaj için benzersiz key
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleLongPressMessage(item.id)} activeOpacity={0.8}>
            <MessageBubble message={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.messageListContent}
        inverted={true} // Liste ters çevrilmiş (en yeni mesajlar altta)
      />

      {/* Klavye açıldığında içeriği yukarı kaydıran container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS ve Android için farklı davranış
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // iOS için ek offset
        style={styles.messageInputContainerWrapper}
      >
        {/* Ses kayıt görünümü veya mesaj giriş alanı */}
        {showAudioRecorder ? (
          // Ses kayıt bileşeni
          <AudioRecorder
            onRecordingComplete={handleAudioRecordingComplete}
            onCancel={handleAudioRecordingCancel}
          />
        ) : (
          // Mesaj giriş alanı
          <View style={styles.messageInputContainer}>
            {/* Dosya ekleme butonu */}
            <TouchableOpacity onPress={toggleAttachmentMenu} style={styles.attachmentButton}>
              <Ionicons name="add" size={24} color={Colors.whatsappLightGreen} />
            </TouchableOpacity>
            
            {/* Metin giriş alanı */}
            <TextInput
              style={styles.textInput}
              placeholder="Mesaj yazın"
              placeholderTextColor="#667781"
              value={messageInput}
              onChangeText={setMessageInput}
              multiline // Çok satırlı giriş
            />
            
            {/* Mikrofon butonu */}
            <TouchableOpacity onPress={toggleAudioRecorder} style={styles.micButton}>
              <Ionicons name="mic" size={24} color={Colors.whatsappLightGreen} />
            </TouchableOpacity>
            
            {/* Gönder butonu */}
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Dosya ekleme menüsü */}
        {showAttachmentMenu && (
          <View style={styles.attachmentMenu}>
            <TouchableOpacity onPress={handleFileSelection} style={styles.attachmentMenuItem}>
              <Ionicons name="document" size={24} color={Colors.whatsappLightGreen} />
              <Text style={styles.attachmentMenuText}>Dosya</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Stil tanımlamaları
const styles = StyleSheet.create({
  // Ana container stili
  chatDetailContainer: {
    flex: 1, // Tüm ekranı kapla
    backgroundColor: Colors.chatDetailBackground, // Arka plan rengi
  },
  // Mesaj listesi içerik stili
  messageListContent: {
    paddingVertical: 10, // Dikey padding
    paddingHorizontal: 10, // Yatay padding
    flexGrow: 1, // Kalan alanı doldur
    justifyContent: 'flex-end', // İçeriği alta hizala
  },
  // Mesaj giriş container wrapper stili
  messageInputContainerWrapper: {
    width: '100%', // Tam genişlik
    backgroundColor: Colors.inputBorder, // Arka plan rengi
    paddingTop: 5, // Üst padding
    paddingBottom: Platform.OS === 'ios' ? 20 : 5, // iOS için ek alt padding
  },
  // Mesaj giriş container stili
  messageInputContainer: {
    flexDirection: 'row', // Yatay düzenleme
    alignItems: 'center', // Dikey ortala
    backgroundColor: Colors.inputBackground, // Arka plan rengi
    borderRadius: 25, // Yuvarlak köşeler
    marginHorizontal: 10, // Yatay margin
    paddingHorizontal: 10, // Yatay padding
    minHeight: 50, // Minimum yükseklik
  },
  // Metin giriş stili
  textInput: {
    flex: 1, // Kalan alanı doldur
    fontSize: 16, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
    paddingVertical: 8, // Dikey padding
    maxHeight: 100, // Maksimum yükseklik
  },
  // Mikrofon butonu stili
  micButton: {
    width: 40, // Genişlik
    height: 40, // Yükseklik
    borderRadius: 20, // Yuvarlak buton
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
    marginRight: 10, // Sağ margin
  },
  // Gönder butonu stili
  sendButton: {
    backgroundColor: Colors.whatsappLightGreen, // WhatsApp yeşili
    width: 40, // Genişlik
    height: 40, // Yükseklik
    borderRadius: 20, // Yuvarlak buton
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
    marginLeft: 10, // Sol margin
  },
  // Dosya ekleme butonu stili
  attachmentButton: {
    width: 40, // Genişlik
    height: 40, // Yükseklik
    borderRadius: 20, // Yuvarlak buton
    justifyContent: 'center', // İçeriği ortala
    alignItems: 'center', // İçeriği ortala
    marginRight: 10, // Sağ margin
  },
  // Dosya ekleme menüsü stili
  attachmentMenu: {
    backgroundColor: Colors.inputBackground, // Arka plan rengi
    marginHorizontal: 10, // Yatay margin
    marginTop: 5, // Üst margin
    borderRadius: 10, // Yuvarlak köşeler
    padding: 10, // İç boşluk
  },
  // Dosya ekleme menü öğesi stili
  attachmentMenuItem: {
    flexDirection: 'row', // Yatay düzenleme
    alignItems: 'center', // Dikey ortala
    paddingVertical: 10, // Dikey padding
    paddingHorizontal: 15, // Yatay padding
  },
  // Dosya ekleme menü metni stili
  attachmentMenuText: {
    fontSize: 16, // Font boyutu
    color: Colors.textPrimary, // Metin rengi
    marginLeft: 10, // Sol margin
  },
});