import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import { GlobalStyles } from '../../components/SharedStyles';
import { addChat, getChats, getMessagesForChat, setupDatabase } from '../database';


//clearMessages();

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = React.useState<Chat[]>([]);

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
    // Her chat için son mesajı ve zamanını bul
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
            lastTime = format(msgDate, 'HH:mm', { locale: tr });
          } else {
            lastTime = format(msgDate, 'dd/MM/yyyy', { locale: tr });
          }
        }
      }
      return { ...chat, lastMessage, time: lastTime };
    });
    setChats(chatsWithLastMessage);
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