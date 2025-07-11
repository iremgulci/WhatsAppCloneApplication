// Durumlar ve Kanallar ekranı: WhatsApp'taki "Güncellemeler" sekmesini taklit eder
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';
import { addUpdate, getUpdates, setupDatabase } from '../database';

export default function UpdatesScreen() {
  const [updates, setUpdates] = React.useState<any[]>([]); // Durum güncellemeleri state'i
  const [sections, setSections] = React.useState<any[]>([]); // SectionList için veri

  // Bileşen yüklendiğinde veritabanını hazırla ve güncellemeleri çek
  React.useEffect(() => {
    setupDatabase(); // Veritabanı tablolarını oluşturur (eğer yoksa)
    const updatesFromDb = getUpdates(); // Veritabanından güncellemeleri al
    if (updatesFromDb.length === 0) {
      // Örnek durum güncellemeleri ekle
      addUpdate('Ayşe Yılmaz', 'Bugün harika bir gün! ☀️', '2 saat önce', 'https://randomuser.me/api/portraits/women/1.jpg');
      addUpdate('Mehmet Demir', 'React Native öğreniyorum 📱', '4 saat önce', 'https://randomuser.me/api/portraits/men/2.jpg');
      addUpdate('Zeynep Kaya', 'Yeni proje üzerinde çalışıyorum 💻', '6 saat önce', 'https://randomuser.me/api/portraits/women/3.jpg');
      addUpdate('Ali Can', 'Kahve molası ☕', '1 gün önce', 'https://randomuser.me/api/portraits/men/4.jpg');
      addUpdate('Elif Su', 'Yeni bir kitap okuyorum 📚', '2 gün önce', 'https://randomuser.me/api/portraits/women/5.jpg');
      setUpdates(getUpdates()); // Ekledikten sonra tekrar güncellemeleri al
    } else {
      setUpdates(updatesFromDb); // Varsa doğrudan göster
    }
  }, []);

  // updates değiştiğinde SectionList için veri yapısını oluştur
  React.useEffect(() => {
    // SectionList için veri yapısı: Durumlar ve Kanallar olarak iki bölüm
    const sectionsData = [
      {
        title: 'Durumlar',
        data: [
          { type: 'addStatus', id: 'addStatus' }, // Durum ekle butonu
          ...updates // Diğer durumlar
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

  // Durum ekle butonunu render eden fonksiyon
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

  // Bir kullanıcı güncellemesini render eden fonksiyon
  const renderUpdate = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.updateCard}>
      {/* Avatar: Arka plan rengi ve baş harfler */}
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

  // Kanal kartını render eden fonksiyon
  const renderChannel = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.channelCard}>
      {/* Kanal avatarı: Arka plan rengi ve baş harfler */}
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

  // SectionList'in her bir satırını render eden fonksiyon
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

  // Section başlıklarını render eden fonksiyon
  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  // Kullanıcı adına göre avatar rengi döndürür
  const getUpdateColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Kanal adına göre avatar rengi döndürür
  const getChannelColor = (name: string) => {
    const colors = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#FF6B6B', '#4ECDC4'];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Kullanıcı adının baş harflerini döndürür
  const getUpdateInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  // Kanal adının baş harflerini döndürür
  const getChannelInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      {/* Durumlar ve Kanallar için SectionList */}
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

// Stiller: Ekrandaki her bölüm için özel stiller
const styles = StyleSheet.create({
  // Liste içeriği için padding
  listContent: {
    padding: 16,
  },
  // Section başlığı
  sectionHeader: {
    backgroundColor: Colors.screenBackground,
    paddingVertical: 8,
    marginBottom: 8,
  },
  // Section başlık metni
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  // Durum ekle kartı
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
  // Durum ekle avatarı
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
  // Durum ekle bilgi alanı
  addStatusInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  // Durum ekle metni
  addStatusText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.whatsappLightGreen,
  },
  // Durum kartı
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
  // Kanal kartı
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
  // Avatar (durum/kanal)
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Avatar baş harfleri
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  // Bilgi konteyneri (isim, açıklama, durum)
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // Kullanıcı veya kanal adı
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  // Durum metni
  status: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  // Kanal açıklaması
  description: {
    fontSize: 14,
    color: Colors.chatTime,
    marginBottom: 4,
  },
  // Zaman/metin
  time: {
    fontSize: 13,
    color: Colors.chatTime,
  },
  // Üye sayısı
  memberCount: {
    fontSize: 13,
    color: Colors.chatTime,
  },
});