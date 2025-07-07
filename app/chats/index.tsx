import * as React from 'react';
import { FlatList, View } from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem'; // ChatListItem'ı import ediyoruz
import { GlobalStyles } from '../../components/SharedStyles'; // Global stilleri import ediyoruz

// Örnek Sohbet Verileri
const chatsData: Chat[] = [
  {
    id: '1',
    name: 'Ayşe Yılmaz',
    lastMessage: 'Tamamdır, yarın görüşürüz!',
    time: '10:30',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    name: 'Mehmet Demir',
    lastMessage: 'Toplantı ne zaman?',
    time: 'Dün',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '3',
    name: 'Zeynep Kaya',
    lastMessage: 'Harika bir fikir!',
    time: 'Cuma',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    id: '4',
    name: 'Ali Can',
    lastMessage: 'Neredesin?',
    time: '09:15',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    id: '5',
    name: 'Elif Su',
    lastMessage: 'Görüşürüz :)',
    time: '08:00',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: '6',
    name: 'Burak Aslan',
    lastMessage: 'Proje hakkında konuşalım mı?',
    time: 'Pzt',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
];

export default function ChatsScreen() {
  return (
    <View style={GlobalStyles.screenContainer}>
      <FlatList
        data={chatsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatListItem chat={item} />}
        // contentContainerStyle={styles.chatListContent} // Ortak style'a taşıyabiliriz
      />
    </View>
  );
}