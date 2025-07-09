import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MessageBubble, { Message } from '../../components/MessageBubble';
import { Colors } from '../../components/SharedStyles';
import { addMessage, getMessagesForChat, setupMessagesTable } from '../database';

export default function ChatDetailScreen() {
  const params = useLocalSearchParams();
  const chatId = Number(params.chatId); // chatId artık sayı

  const [messageInput, setMessageInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    setupMessagesTable();
    // Mesajları veritabanından yükle
    const msgs = getMessagesForChat(chatId).map((m: any) => ({
      id: m.id.toString(),
      text: m.text,
      isMine: !!m.isMine,
      time: m.time,
    }));
    setMessages(msgs);
  }, [chatId]);

  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      addMessage(chatId, messageInput.trim(), true, time);
      // Mesajları tekrar yükle
      const msgs = getMessagesForChat(chatId).map((m: any) => ({
        id: m.id.toString(),
        text: m.text,
        isMine: !!m.isMine,
        time: m.time,
      }));
      setMessages(msgs);
      setMessageInput('');
    }
  };

  return (
    <SafeAreaView style={styles.chatDetailContainer}>
      <FlatList
        data={reversedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messageListContent}
        inverted={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.messageInputContainerWrapper}
      >
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Mesaj yazın"
            placeholderTextColor="#667781"
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatDetailContainer: {
    flex: 1,
    backgroundColor: Colors.chatDetailBackground,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageInputContainerWrapper: {
    width: '100%',
    backgroundColor: Colors.inputBorder,
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 25,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.whatsappLightGreen,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});