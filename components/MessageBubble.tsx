import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from './SharedStyles';

export interface Message {
  id: string;
  text: string;
  isMine: boolean;
  time: string;
  type?: string;
  audioUri?: string;
  audioDuration?: number;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    if (!message.audioUri) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.stopAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Ses dosyası oynatılamadı.');
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderMessageContent = () => {
    if (message.type === 'audio' && message.audioUri) {
      return (
        <View style={styles.audioContainer}>
          <TouchableOpacity onPress={playSound} style={styles.audioButton}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color={message.isMine ? Colors.textPrimary : Colors.textPrimary} 
            />
          </TouchableOpacity>
          <View style={styles.audioInfo}>
            <View style={styles.audioWaveform}>
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
              <View style={[styles.audioBar, isPlaying && styles.audioBarPlaying]} />
            </View>
            <Text style={styles.audioDuration}>
              {formatDuration(message.audioDuration || 0)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text style={message.isMine ? styles.myMessageText : styles.otherMessageText}>
        {message.text}
      </Text>
    );
  };

  return (
    <View style={[
      styles.messageBubble,
      message.isMine ? styles.myMessageBubble : styles.otherMessageBubble
    ]}>
      {renderMessageContent()}
      <Text style={[styles.messageTime, message.isMine ? styles.myMessageTime : styles.otherMessageTime]}>
        {message.time}
      </Text>
    </View>
  );
};

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
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioInfo: {
    flex: 1,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginBottom: 5,
  },
  audioBar: {
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  audioBarPlaying: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  audioDuration: {
    fontSize: 12,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
});

export default MessageBubble;