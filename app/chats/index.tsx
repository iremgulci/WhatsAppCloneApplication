import { useRouter } from 'expo-router';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import { GlobalStyles } from '../../components/SharedStyles';
import { addChat, getChats, setupDatabase } from '../database';

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = React.useState<Chat[]>([]);

  React.useEffect(() => {
    setupDatabase();
    const chatsFromDb = getChats();
    if (chatsFromDb.length === 0) {
      // Sadece tablo boşsa örnek verileri ekle
      addChat('Ayşe Yılmaz', 'Tamamdır, yarın görüşürüz!', '10:30', 'https://randomuser.me/api/portraits/women/1.jpg');
      addChat('Mehmet Demir', 'Toplantı ne zaman?', 'Dün', 'https://randomuser.me/api/portraits/men/2.jpg');
      addChat('Zeynep Kaya', 'Harika bir fikir!', 'Cuma', 'https://randomuser.me/api/portraits/women/3.jpg');
      addChat('Ali Can', 'Neredesin?', '09:15', 'https://randomuser.me/api/portraits/men/4.jpg');
      addChat('Elif Su', 'Görüşürüz :)', '08:00', 'https://randomuser.me/api/portraits/women/5.jpg');
      addChat('Burak Aslan', 'Proje hakkında konuşalım mı?', 'Pzt', 'https://randomuser.me/api/portraits/men/6.jpg');
      setChats(getChats()); // Eklemeden sonra tekrar oku
    } else {
      setChats(chatsFromDb);
    }
  }, []);

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

  return (
    <View style={GlobalStyles.screenContainer}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChatListItem chat={item} onPress={() => handleChatPress(item)} />}
      />
    </View>
  );
}