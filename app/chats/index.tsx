import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import { GlobalStyles } from '../../components/SharedStyles';
import { addChat, getChats, getMessagesForChat, setupDatabase } from '../database';

// Örnek kişiler listesi (yeni sohbet başlatmak için)
const CONTACTS = [
  { id: '101', name: 'Zeynep Kaya', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '102', name: 'Ali Can', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { id: '103', name: 'Elif Su', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '104', name: 'Burak Aslan', avatar: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { id: '105', name: 'Deniz Yıldız', avatar: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { id: '106', name: 'Mert Kılıç', avatar: 'https://randomuser.me/api/portraits/men/8.jpg' },
  { id: '107', name: 'Selin Aksoy', avatar: 'https://randomuser.me/api/portraits/women/9.jpg' },
  { id: '108', name: 'Baran Güneş', avatar: 'https://randomuser.me/api/portraits/men/10.jpg' },
];

export default function ChatsScreen() {
  const router = useRouter();
  // Sohbetler state'i
  const [chats, setChats] = React.useState<Chat[]>([]);
  // Kişi seçme modalı açık mı?
  const [modalVisible, setModalVisible] = React.useState(false);

  // Chat listesini günceller: Her chat için son mesajı ve zamanı bulur, mesajı olmayanları filtreler ve en günceli en üste sıralar
  const reloadChats = () => {
    const chatsWithLastMessage = getChats().map((chat: any) => {
      const messages = getMessagesForChat(Number(chat.id));
      let lastMessage = 'Son Mesaj Yok';
      let lastTime = '';
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        lastMessage = lastMsg.text;
        let msgDate: Date | null = null;
        if (lastMsg.time) {
          const parsed = Date.parse(lastMsg.time);
          if (!isNaN(parsed)) {
            msgDate = new Date(parsed);
          }
        }
        if (msgDate) {
          const now = new Date();
          if (
            now.getDate() === msgDate.getDate() &&
            now.getMonth() === msgDate.getMonth() &&
            now.getFullYear() === msgDate.getFullYear()
          ) {
            // Bugünkü mesajsa sadece saat göster
            lastTime = format(msgDate, 'HH:mm', { locale: tr });
          } else {
            // Eski mesajsa tarih göster
            lastTime = format(msgDate, 'dd/MM/yyyy', { locale: tr });
          }
        }
      }
      return { ...chat, lastMessage, time: lastTime, hasMessages: messages.length > 0 };
    });
    // Sadece mesajı olan chatleri göster ve son mesaj zamanına göre sırala (en güncel en üstte)
    const sortedChats = chatsWithLastMessage
      .filter(c => c.hasMessages)
      .sort((a, b) => {
        const aMsg = getMessagesForChat(Number(a.id));
        const bMsg = getMessagesForChat(Number(b.id));
        const aTime = aMsg.length > 0 ? Date.parse(aMsg[aMsg.length - 1].time) : 0;
        const bTime = bMsg.length > 0 ? Date.parse(bMsg[bMsg.length - 1].time) : 0;
        return bTime - aTime;
      });
    setChats(sortedChats);
  };

  // Uygulama ilk açıldığında örnek chatleri ekle ve chat listesini yükle
  React.useEffect(() => {
    setupDatabase();
    const chatsFromDb = getChats();
    if (chatsFromDb.length === 0) {
      addChat('Ayşe Yılmaz', 'Son Mesaj Yok', '', 'https://randomuser.me/api/portraits/women/1.jpg');
      addChat('Mehmet Demir', 'Son Mesaj Yok', '', 'https://randomuser.me/api/portraits/men/2.jpg');
      addChat('Zeynep Kaya', 'Son Mesaj Yok', '', 'https://randomuser.me/api/portraits/women/3.jpg');
      addChat('Ali Can', 'Son Mesaj Yok', '', 'https://randomuser.me/api/portraits/men/4.jpg');
      addChat('Elif Su', 'Son Mesaj Yok', '', 'https://randomuser.me/api/portraits/women/5.jpg');
      addChat('Burak Aslan', 'Son Mesaj Yok', '', 'https://randomuser.me/api/portraits/men/6.jpg');
    }
    reloadChats();
  }, []);

  // Ekrana her dönüldüğünde chat listesini otomatik güncelle (canlılık için)
  useFocusEffect(
    React.useCallback(() => {
      reloadChats();
    }, [])
  );

  // Bir chat'e tıklanınca detay ekranına yönlendir
  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/chats/[chatId]',
      params: {
        chatId: chat.id,
        chatName: chat.name,
        avatarUrl: chat.avatar,
      },
    });
  };

  // Yeni sohbet başlatmak için kişi seçildiğinde çalışır
  const handleStartChat = (contact: { id: string; name: string; avatar: string }) => {
    // Eğer bu kişiyle chat yoksa yeni chat ekle
    let chat = chats.find(c => c.name === contact.name);
    if (!chat) {
      addChat(contact.name, 'Son Mesaj Yok', '', contact.avatar);
      // Yeni eklenen chat'i veritabanından bul
      const allChats = getChats();
      chat = allChats.find(c => c.name === contact.name);
      reloadChats();
    }
    setModalVisible(false);
    setTimeout(() => reloadChats(), 500); // Modal kapandıktan sonra tekrar yükle
    // chat bulunduysa detay ekranına yönlendir
    if (chat) {
      handleChatPress({
        id: chat.id,
        name: contact.name,
        avatar: contact.avatar,
        lastMessage: '',
        time: ''
      });
    }
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      {/* Chat listesi */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChatListItem chat={item} onPress={() => handleChatPress(item)} />}
      />
      {/* Sağ altta yeni sohbet başlatma butonu (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
      </TouchableOpacity>
      {/* Kişi seçme modalı */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kişi Seç</Text>
            <FlatList
              data={CONTACTS}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.contactItem} onPress={() => handleStartChat(item)}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{item.name[0]}</Text>
                  </View>
                  <Text style={styles.contactName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Stiller
const styles = StyleSheet.create({
  newChatButton: {
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    margin: 12,
  },
  newChatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECE5DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  contactName: {
    fontSize: 16,
    color: '#222',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#25D366',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});