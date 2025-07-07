import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useLocalSearchParams } from 'expo-router'; // Expo Router'dan useParams yerine useLocalSearchParams
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
import MessageBubble, { Message } from '../../components/MessageBubble'; // MessageBubble'ı import ediyoruz
import { Colors } from '../../components/SharedStyles'; // Stilleri import ediyoruz

// RootStackParamList'i buraya da kopyalamamız gerekiyor, veya ortak bir yere taşıyabiliriz.
// Şimdilik buraya kopyalayalım, daha sonra daha iyi bir yere taşırız.
type RootStackParamList = {
  ChatsList: undefined;
  ChatDetail: { chatName: string; chatId: string };
};
type ChatDetailScreenProps = StackScreenProps<RootStackParamList, 'ChatDetail'>;

// Örnek Mesaj Verileri (En ESKİDEN en YENİYE doğru sıralanır)
const initialMessagesData: Message[] = [
  { id: 'm1', text: 'Merhaba!', isMine: false, time: '10:00' },
  { id: 'm2', text: 'Nasılsın?', isMine: true, time: '10:01' },
  { id: 'm3', text: 'İyiyim, sen nasılsın?', isMine: false, time: '10:02' },
  { id: 'm4', text: 'Ben de iyiyim. Bugün ne yapıyorsun?', isMine: true, time: '10:03' },
  { id: 'm5', text: 'Şu an React Native öğreniyorum :)', isMine: false, time: '10:05' },
  { id: 'm6', text: 'Harika! Kolay gelsin.', isMine: true, time: '10:06' },
  { id: 'm7', text: 'Teşekkürler!', isMine: false, time: '10:07' },
];

export default function ChatDetailScreen() { // Props'u useLocalSearchParams ile alacağız
  const params = useLocalSearchParams();
  const chatName = params.chatName as string; // tip dönüşümü
  const chatId = params.chatId as string; // tip dönüşümü

  const [messageInput, setMessageInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>(initialMessagesData);

  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: `m${messages.length + 1}-${Date.now()}`, // Daha benzersiz ID
        text: messageInput.trim(),
        isMine: true,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
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
          <Ionicons name="happy-outline" size={24} color="#667781" style={styles.inputIcon} />
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
    backgroundColor: Colors.inputBorder, // hafif gri
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
  inputIcon: {
    marginRight: 10,
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