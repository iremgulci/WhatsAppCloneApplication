import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';
import { addCall, getCalls, setupDatabase } from '../database';

// Örnek avatarlar (gerçek uygulamada veritabanında da tutulabilir)
const avatarMap: Record<string, string> = {
  'Ayşe Yılmaz': 'https://randomuser.me/api/portraits/women/1.jpg',
  'Mehmet Demir': 'https://randomuser.me/api/portraits/men/2.jpg',
  'Zeynep Kaya': 'https://randomuser.me/api/portraits/women/3.jpg',
};

const typeIcon = (type: string) => {
  if (type === 'incoming') return <Ionicons name="call" size={20} color={Colors.whatsappLightGreen} style={styles.icon} />;
  if (type === 'outgoing') return <Ionicons name="call-outline" size={20} color={Colors.blueTick} style={styles.icon} />;
  if (type === 'missed') return <Ionicons name="call" size={20} color={Colors.errorRed} style={styles.icon} />;
  return null;
};

export default function CallsScreen() {
  const [calls, setCalls] = React.useState<any[]>([]);

  React.useEffect(() => {
    setupDatabase();
    const callsFromDb = getCalls();
    if (callsFromDb.length === 0) {
      addCall('Ayşe Yılmaz', '10:30', 'incoming');
      addCall('Mehmet Demir', 'Dün', 'outgoing');
      addCall('Zeynep Kaya', 'Cuma', 'missed');
      setCalls(getCalls());
    } else {
      setCalls(callsFromDb);
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.callCard}>
      <Image
        source={{ uri: avatarMap[item.name] || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          {typeIcon(item.type)}
          <Text style={[styles.type, item.type === 'missed' && styles.missedType]}>{item.type}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={GlobalStyles.screenContainer}>
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.messageBackgroundOther,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: Colors.inputBorder,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  type: {
    fontSize: 14,
    color: Colors.whatsappLightGreen,
    marginRight: 12,
    textTransform: 'capitalize',
  },
  missedType: {
    color: Colors.errorRed,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 13,
    color: Colors.chatTime,
  },
});