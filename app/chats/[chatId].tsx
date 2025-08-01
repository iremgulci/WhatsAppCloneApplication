import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AudioRecorder from '../../components/AudioRecorder';
import MessageBubble, { Message } from '../../components/MessageBubble';
import { Colors } from '../../components/SharedStyles';
import { addMessage, deleteMessage, getMessagesForChat, setupMessagesTable } from '../database';

export default function ChatDetailScreen() {
  const params = useLocalSearchParams();
  const chatId = Number(params.chatId);

  const [messageInput, setMessageInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [showAudioRecorder, setShowAudioRecorder] = React.useState(false);

  const loadMessages = React.useCallback(() => {
    const msgs = getMessagesForChat(chatId).map((m: any) => {
      let formattedTime = m.time;
      if (m.time) {
        const parsed = Date.parse(m.time);
        if (!isNaN(parsed)) {
          const d = new Date(parsed);
          formattedTime = format(d, 'dd.MM.yy HH:mm', { locale: tr });
        }
      }
      return {
        id: m.id.toString(),
        text: m.text,
        isMine: !!m.isMine,
        time: formattedTime,
        type: m.type || 'text',
        audioUri: m.audioUri,
        audioDuration: m.audioDuration,
      };
    });
    setMessages(msgs);
  }, [chatId]);

  React.useEffect(() => {
    setupMessagesTable();
    loadMessages();
  }, [chatId, loadMessages]);

  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const time = new Date().toISOString();
      addMessage(chatId, messageInput.trim(), true, time, 'text');
      loadMessages();
      setMessageInput('');
    }
  };

  const handleAudioRecordingComplete = (uri: string, duration: number) => {
    console.log('Audio recording completed:', { uri, duration });
    
    try {
      const time = new Date().toISOString();
      addMessage(chatId, 'Ses kaydı', true, time, 'audio', uri, duration);
      loadMessages();
      setShowAudioRecorder(false);
      
      console.log('Audio message added successfully');
    } catch (error) {
      console.log('Error adding audio message:', error);
      Alert.alert('Hata', 'Ses kaydı gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleAudioRecordingCancel = () => {
    setShowAudioRecorder(false);
  };

  const handleLongPressMessage = (messageId: string) => {
    Alert.alert(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteMessage(Number(messageId));
            loadMessages();
          },
        },
      ]
    );
  };

  const toggleAudioRecorder = () => {
    setShowAudioRecorder(!showAudioRecorder);
  };

  return (
    <SafeAreaView style={styles.chatDetailContainer}>
      <FlatList
        data={reversedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleLongPressMessage(item.id)} activeOpacity={0.8}>
            <MessageBubble message={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.messageListContent}
        inverted={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.messageInputContainerWrapper}
      >
        {showAudioRecorder ? (
          <AudioRecorder
            onRecordingComplete={handleAudioRecordingComplete}
            onCancel={handleAudioRecordingCancel}
          />
        ) : (
          <View style={styles.messageInputContainer}>
            <TouchableOpacity onPress={toggleAudioRecorder} style={styles.micButton}>
              <Ionicons name="mic" size={24} color={Colors.whatsappLightGreen} />
            </TouchableOpacity>
            
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
        )}
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
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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