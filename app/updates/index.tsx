import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';
import { addUpdate, getUpdates, setupDatabase } from '../database';

export default function UpdatesScreen() {
  const [updates, setUpdates] = React.useState<any[]>([]);
  const [sections, setSections] = React.useState<any[]>([]);

  React.useEffect(() => {
    setupDatabase();
    const updatesFromDb = getUpdates();
    if (updatesFromDb.length === 0) {
      // Örnek durum güncellemeleri
      addUpdate('Ayşe Yılmaz', 'Bugün harika bir gün! ☀️', '2 saat önce', 'https://randomuser.me/api/portraits/women/1.jpg');
      addUpdate('Mehmet Demir', 'React Native öğreniyorum 📱', '4 saat önce', 'https://randomuser.me/api/portraits/men/2.jpg');
      addUpdate('Zeynep Kaya', 'Yeni proje üzerinde çalışıyorum 💻', '6 saat önce', 'https://randomuser.me/api/portraits/women/3.jpg');
      addUpdate('Ali Can', 'Kahve molası ☕', '1 gün önce', 'https://randomuser.me/api/portraits/men/4.jpg');
      addUpdate('Elif Su', 'Yeni bir kitap okuyorum 📚', '2 gün önce', 'https://randomuser.me/api/portraits/women/5.jpg');
      setUpdates(getUpdates());
    } else {
      setUpdates(updatesFromDb);
    }
  }, []);

  React.useEffect(() => {
    // SectionList için veri yapısını oluştur
    const sectionsData = [
      {
        title: 'Durumlar',
        data: [
          { type: 'addStatus', id: 'addStatus' },
          ...updates
        ]
      },
      {
        title: 'Kanallar',
        data: [
          { type: 'channel', id: 'channel1', name: 'WhatsApp', description: 'Resmi WhatsApp kanalı', memberCount: '2.5M' },
          { type: 'channel', id: 'channel2', name: 'Teknoloji Haberleri', description: 'Güncel teknoloji haberleri', memberCount: '150K' },
          { type: 'channel', id: 'channel3', name: 'Mobil Geliştirme', description: 'Mobil uygulama geliştirme ipuçları', memberCount: '89K' },
        ]
      }
    ];
    setSections(sectionsData);
  }, [updates]);

  const renderAddStatus = () => (
    <TouchableOpacity style={styles.addStatusCard}>
      <View style={styles.addStatusAvatar}>
        <Ionicons name="add" size={24} color={Colors.whatsappLightGreen} />
      </View>
      <View style={styles.addStatusInfo}>
        <Text style={styles.addStatusText}>Durum ekle</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUpdate = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.updateCard}>
      <View style={[styles.avatar, { backgroundColor: getUpdateColor(item.name) }]}>
        <Text style={styles.avatarText}>{getUpdateInitials(item.name)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status} numberOfLines={2}>{item.status}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.chatTime} />
    </TouchableOpacity>
  );

  const renderChannel = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.channelCard}>
      <View style={[styles.avatar, { backgroundColor: getChannelColor(item.name) }]}>
        <Text style={styles.avatarText}>{getChannelInitials(item.name)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.memberCount}>{item.memberCount} üye</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.chatTime} />
    </TouchableOpacity>
  );

  const renderItem = ({ item, section }: { item: any; section: any }) => {
    if (section.title === 'Durumlar') {
      if (item.type === 'addStatus') {
        return renderAddStatus();
      }
      return renderUpdate({ item });
    } else if (section.title === 'Kanallar') {
      return renderChannel({ item });
    }
    return null;
  };

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const getUpdateColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getChannelColor = (name: string) => {
    const colors = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#FF6B6B', '#4ECDC4'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getUpdateInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  const getChannelInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: Colors.screenBackground,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.messageBackgroundOther,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  addStatusAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: Colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.whatsappLightGreen,
    borderStyle: 'dashed',
  },
  addStatusInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  addStatusText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.whatsappLightGreen,
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.messageBackgroundOther,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.messageBackgroundOther,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
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
  status: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.chatTime,
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: Colors.chatTime,
  },
  memberCount: {
    fontSize: 13,
    color: Colors.chatTime,
  },
});