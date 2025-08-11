import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import { GlobalStyles } from '../../components/SharedStyles';
import db, { addChat, deleteChat, ensureChatsForUser, getChats, getMessagesBetweenUsers, getMessagesForChat } from '../database';

// Veritabanındaki kayıtlı kullanıcıları göster
function useRegisteredContacts(currentUserId: number) {
  const [contacts, setContacts] = React.useState<any[]>([]);
  React.useEffect(() => {
    try {
      // Önce 'id' sütunu ile dene
      let users = db.getAllSync('SELECT * FROM users');
      console.log('Raw users from database:', users);
      
      // Eğer users boşsa veya hata varsa, 'userId' sütunu ile dene
      if (!users || users.length === 0) {
        try {
          users = db.getAllSync('SELECT * FROM users WHERE userId IS NOT NULL');
          console.log('Users with userId column:', users);
        } catch (err) {
          console.log('Error with userId column:', err);
        }
      }
      
      setContacts(users);
      console.log('Contacts set:', users);
    } catch (err) {
      console.log('Error fetching users:', err);
      setContacts([]);
    }
  }, [currentUserId]);
  return contacts;
}
interface ChatsScreenProps {
  userId: number;
  currentUserId?: string;
  onChatListRefresh?: () => void;
}

export default function ChatsScreen({ userId, currentUserId }: ChatsScreenProps) {
  const contacts = useRegisteredContacts(userId);
  const router = useRouter();
  // Sohbetler state'i
  const [chats, setChats] = React.useState<Chat[]>([]);
  // Kişi seçme modalı açık mı?
  const [modalVisible, setModalVisible] = React.useState(false);
  // ensureChatsForUser'ın çalışıp çalışmadığını takip et
  const [chatsEnsured, setChatsEnsured] = React.useState(false);

  // Contacts yüklendiğinde chat listesini yenile
  React.useEffect(() => {
    if (contacts.length > 0) {
      console.log('Contacts loaded, reloading chats. Contacts count:', contacts.length);
      reloadChats();
    }
  }, [contacts]);

  // Chat listesini günceller: Her chat için son mesajı ve zamanı bulur, mesajı olmayanları filtreler ve en günceli en üste sıralar
  const reloadChats = React.useCallback(() => {
    // Contacts henüz yüklenmemişse bekle
    if (contacts.length === 0) return;

    // Önce mevcut kullanıcı için tüm chat'leri oluştur (mesaj geçmişinden) - sadece bir kez
    if (currentUserId && !chatsEnsured) {
      try {
        const currentUserNumericId = Number(currentUserId.replace('user_', ''));
        if (currentUserNumericId > 0) {
          ensureChatsForUser(currentUserNumericId, currentUserId);
          setChatsEnsured(true);
        }
      } catch (err) {
        console.log('Error ensuring chats for user:', err);
      }
    }

    // Veritabanından tüm chat'leri al
    const allChats = getChats(userId);
    
    // Her chat için son mesajı ve zamanı bul
    const chatsWithMessages = allChats.map(chat => {
      // Chat ismine göre karşı kullanıcıyı bul
      const contact = contacts.find(c => c.name === chat.name);
      const otherUserId = contact ? `user_${contact.userId}` : undefined;
      
      // Mesajları getir
      const messages = (currentUserId && otherUserId)
        ? getMessagesBetweenUsers(currentUserId, otherUserId)
        : getMessagesForChat(Number(chat.id));
      
      // Sadece mevcut kullanıcının gönderdiği veya aldığı mesajları filtrele
      const userMessages = messages.filter((m: any) => {
        if (currentUserId && m.senderId) {
          return m.senderId === currentUserId || m.receiverId === currentUserId || m.receiverId === 'all';
        }
        return true;
      });
      
      // Son mesajı bul
      const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
      const lastMessageText = lastMessage ? lastMessage.text : 'Son Mesaj Yok';
      const lastMessageTime = lastMessage ? format(new Date(lastMessage.time), 'HH:mm') : '';
      
      return {
        ...chat,
        lastMessage: lastMessageText,
        time: lastMessageTime,
      };
    });
    
    // Mesajı olan chat'leri filtrele ve son mesaj zamanına göre sırala
    const sortedChats = chatsWithMessages
      .filter(chat => chat.lastMessage !== 'Son Mesaj Yok')
      .sort((a, b) => {
        if (!a.time || !b.time) return 0;
        const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
        const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
        return timeB - timeA;
      });
    
    setChats(sortedChats);
  }, [contacts, userId, currentUserId, chatsEnsured]);

  // Ekrana her dönüldüğünde chat listesini otomatik güncelle (canlılık için)
  useFocusEffect(
    React.useCallback(() => {
      reloadChats();
      
      // Periyodik olarak chat listesini yenile (gelen mesajlar için)
      const interval = setInterval(() => {
        reloadChats();
      }, 10000); // 10 saniyede bir yenile
      
      return () => clearInterval(interval);
    }, [reloadChats])
  );

  // Bir chat'e tıklanınca detay ekranına yönlendir
  const handleChatPress = (chat: Chat) => {
    const contact = contacts.find((c: any) => c.name === chat.name);
    const otherUserNumericId = contact ? (contact.userId ?? contact.id) : undefined;
    const otherUserId = otherUserNumericId ? `user_${otherUserNumericId}` : undefined;

    router.push({
      pathname: '/chats/[chatId]',
      params: {
        chatId: chat.id,
        userId: chat.userId,
        chatName: chat.name,
        avatarUrl: chat.avatar,
        currentUserId: currentUserId,
        otherUserId: otherUserId,
      },
    });
  };

  // Bir chat'e uzun basınca silme onayı gösterir
  const handleLongPressChat = (chat: Chat) => {
    Alert.alert(
      'Sohbeti Sil',
      `${chat.name} ile olan sohbeti silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteChat(Number(chat.id));
            reloadChats();
          },
        },
      ]
    );
  };

  // Yeni sohbet başlatmak için kişi seçildiğinde çalışır
  const handleStartChat = (contact: { id: string; userId: number; name: string; avatar: string }) => {
    // Eğer bu kişiyle chat yoksa yeni chat ekle
    let chat = chats.find(c => c.name === contact.name);
    if (!chat) {
      // Chat satırı, uygulamada oturum açmış kullanıcıya ait olmalı
      addChat(contact.name, 'Son Mesaj Yok', '', contact.avatar, userId);
      // Yeni eklenen chat'i veritabanından bul
      const allChats = getChats(userId);
      chat = allChats.find(c => c.name === contact.name);
      reloadChats();
    }
    setModalVisible(false);
    setTimeout(() => reloadChats(), 500); // Modal kapandıktan sonra tekrar yükle
    // chat bulunduysa detay ekranına yönlendir
    if (chat) {
      handleChatPress({
        id: chat.id,
        userId: userId,
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
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            onPress={() => handleChatPress(item)}
            onLongPress={() => handleLongPressChat(item)}
          />
        )}
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
              data={contacts}
              keyExtractor={item => (item.id ?? item.userId).toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() =>
                    handleStartChat({
                      id: (item.id ?? item.userId).toString(),
                      userId: item.id ?? item.userId,
                      name: item.name,
                      avatar: ''
                    })
                  }
                >
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