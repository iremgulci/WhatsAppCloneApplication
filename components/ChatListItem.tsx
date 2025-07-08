import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from './SharedStyles'; // Stilleri import ediyoruz

// Sohbet verisi için arayüz tanımlaması
export interface Chat { // Export ettik, çünkü başka dosyalarda da kullanacağız
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
}

type ChatListItemProps = {
  chat: Chat;
  onPress: () => void; // onPress prop'u ekledik
};

// Ana Stack Navigator için rota listesi (Bu tanım her yerde aynı olmalı!)
type RootStackParamList = {
  ChatsList: undefined;
  ChatDetail: { chatName: string; chatId: string }; // chat id'yi de ekleyelim
};

// ChatsScreen içinde useNavigation hook'u için tip
type ChatsScreenNavigationProp = NavigationProp<RootStackParamList, 'ChatsList'>;

const ChatListItem: React.FC<ChatListItemProps> = ({ chat }) => {
  const navigation = useNavigation<ChatsScreenNavigationProp>();

const router = useRouter();
const handlePress = () => {
  router.push({ pathname: "/chats/[chatId]", params: { chatId: chat.id, chatName: chat.name } });
};

  return (
    <TouchableOpacity style={styles.chatListItem} onPress={handlePress}>
      <Image source={{ uri: chat.avatar }} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{chat.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
      </View>
      <Text style={styles.chatTime}>{chat.time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.messageBackgroundOther, // White
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECE5DD', // Hafif gri
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.headerText,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.chatTime,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.chatTime,
  },
});

export default ChatListItem;