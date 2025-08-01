import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from './SharedStyles';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [recording, setRecording] = React.useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [hasPermission, setHasPermission] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.log('Permission request failed:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('İzin Gerekli', 'Ses kaydı için mikrofon izni gereklidir.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);
      console.log('Recording started successfully');
    } catch (err) {
      console.log('Recording start error:', err);
      Alert.alert('Hata', 'Ses kaydı başlatılamadı. Lütfen tekrar deneyin.');
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log('No recording to stop');
      return;
    }

    try {
      console.log('Stopping recording...');
      
      // Kaydı durdur
      await recording.stopAndUnloadAsync();
      
      // URI'yi al
      const uri = recording.getURI();
      console.log('Recording URI:', uri);
      
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Basit süre hesaplama (kayıt süresini kullan)
      const duration = recordingTime * 1000;
      console.log('Recording completed, duration:', duration, 'ms');
      
      // Başarılı kayıt
      onRecordingComplete(uri, duration);
      
    } catch (err) {
      console.log('Recording stop error:', err);
      Alert.alert('Hata', 'Ses kaydı durdurulamadı. Lütfen tekrar deneyin.');
    } finally {
      setRecording(null);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          try {
            await FileSystem.deleteAsync(uri);
          } catch (deleteError) {
            console.log('File delete error:', deleteError);
          }
        }
      } catch (error) {
        console.log('Cancel recording error:', error);
      } finally {
        setRecording(null);
        setIsRecording(false);
        setRecordingTime(0);
      }
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Mikrofon izni gerekli</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.recordingInfo}>
        <Ionicons name="mic" size={20} color={Colors.whatsappLightGreen} />
        <Text style={styles.recordingText}>
          {isRecording ? `Kaydediliyor... ${formatTime(recordingTime)}` : 'Kayıt için basılı tutun'}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={[styles.recordButton, isRecording && styles.recordingButton]}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBackground,
    padding: 15,
    borderRadius: 25,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  recordingText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: Colors.whatsappLightGreen,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  cancelButton: {
    backgroundColor: '#666',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioRecorder; 