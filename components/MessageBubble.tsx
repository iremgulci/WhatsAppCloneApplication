import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from './SharedStyles'; // Stilleri import ediyoruz

export interface Message { // Export ettik
  id: string;
  text: string;
  isMine: boolean;
  time: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => (
  <View style={[
    styles.messageBubble,
    message.isMine ? styles.myMessageBubble : styles.otherMessageBubble
  ]}>
    <Text style={message.isMine ? styles.myMessageText : styles.otherMessageText}>
      {message.text}
    </Text>
    <Text style={[styles.messageTime, message.isMine ? styles.myMessageTime : styles.otherMessageTime]}>
      {message.time}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    position: 'relative',
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.messageBackgroundMine,
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.messageBackgroundOther,
  },
  myMessageText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  otherMessageText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.chatTime,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  myMessageTime: {
    color: Colors.blueTick,
  },
  otherMessageTime: {
    color: Colors.chatTime,
  },
});

export default MessageBubble;