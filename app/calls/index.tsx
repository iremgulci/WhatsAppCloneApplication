// Arama geçmişi ekranı: Kullanıcıya yapılan/giden çağrıları listeler
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

// Çağrı tipine göre ikon döndüren yardımcı fonksiyon
const typeIcon = (type: string) => {
  if (type === 'incoming') return <Ionicons name="call" size={20} color={Colors.whatsappLightGreen} style={styles.icon} />;
  if (type === 'outgoing') return <Ionicons name="call-outline" size={20} color={Colors.blueTick} style={styles.icon} />;
  if (type === 'missed') return <Ionicons name="call" size={20} color={Colors.errorRed} style={styles.icon} />;
  return null;
};

// Ana arama geçmişi ekranı bileşeni
export default function CallsScreen() {
  const [calls, setCalls] = React.useState<any[]>([]); // Çağrı listesini tutan state

  // Bileşen yüklendiğinde veritabanını hazırla ve çağrıları çek
  React.useEffect(() => {
    setupDatabase(); // Veritabanı tablolarını oluşturur (eğer yoksa)
    const callsFromDb = getCalls(); // Veritabanından çağrıları al
    if (callsFromDb.length === 0) {
      // Eğer hiç çağrı yoksa örnek veriler ekle
      addCall('Ayşe Yılmaz', '10:30', 'incoming');
      addCall('Mehmet Demir', 'Dün', 'outgoing');
      addCall('Zeynep Kaya', 'Cuma', 'missed');
      setCalls(getCalls()); // Ekledikten sonra tekrar çağrıları al
    } else {
      setCalls(callsFromDb); // Varsa doğrudan göster
    }
  }, []);

  // Her bir çağrı kartını render eden fonksiyon
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.callCard}>
      {/* Avatar resmi, yoksa lego avatarı */}
      <Image
        source={{ uri: avatarMap[item.name] || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          {typeIcon(item.type)}
          {/* Çağrı tipi ve zamanı */}
          <Text style={[styles.type, item.type === 'missed' ? styles.missedType : null]}>{item.type}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={GlobalStyles.screenContainer}>
      {/* Çağrı listesini yatay ayraçlarla gösteren FlatList */}
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

// Stiller: Ekrandaki her bölüm için özel stiller
const styles = StyleSheet.create({
  // Liste içeriği için padding
  listContent: {
    padding: 16,
  },
  // Her bir çağrı kartı
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
  // Avatar resmi
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: Colors.inputBorder,
  },
  // Bilgi konteyneri (isim, tip, saat)
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // Kullanıcı adı
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  // Tip ve saat satırı
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Tip ikonunun sağında boşluk
  icon: {
    marginRight: 6,
  },
  // Çağrı tipi metni
  type: {
    fontSize: 14,
    color: Colors.whatsappLightGreen,
    marginRight: 12,
    textTransform: 'capitalize',
  },
  // Kaçırılan çağrı tipi için kırmızı ve kalın
  missedType: {
    color: Colors.errorRed,
    fontWeight: 'bold',
  },
  // Saat metni
  time: {
    fontSize: 13,
    color: Colors.chatTime,
  },
});