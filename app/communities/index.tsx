import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';
import { addCommunity, getCommunities, setupDatabase } from '../database';

export default function CommunitiesScreen() {
  // Topluluklar state'i
  const [communities, setCommunities] = React.useState<any[]>([]);

  React.useEffect(() => {
    setupDatabase();
    // İlk açılışta tabloyu oluştur ve örnek toplulukları ekle (eğer boşsa)
    //dropAndRecreateCommunities(); // Tabloyu tamamen sıfırlamak için (geliştirme amaçlı)
    //clearCommunities(); // Tüm toplulukları silmek için (geliştirme amaçlı)

    const communitiesFromDb = getCommunities();
    if (communitiesFromDb.length === 0) {
      // Örnek topluluklar ekleniyor
      addCommunity('React Native Türkiye', 'React Native geliştiricileri için topluluk', 1250, 'https://dummyimage.com/200x200/4A90E2/FFFFFF&text=RN');
      addCommunity('Mobile Dev Istanbul', 'Mobil uygulama geliştiricileri', 890, 'https://dummyimage.com/200x200/50C878/FFFFFF&text=MD');
      addCommunity('Flutter Türkiye', 'Flutter ile mobil uygulama geliştirme', 567, 'https://dummyimage.com/200x200/02569B/FFFFFF&text=FT');
      addCommunity('UI/UX Designers', 'Tasarım ve kullanıcı deneyimi', 432, 'https://dummyimage.com/200x200/FF6B6B/FFFFFF&text=UI');
      setCommunities(getCommunities());
    } else {
      setCommunities(communitiesFromDb);
    }
  }, []);

  // Her topluluk kartını render eden fonksiyon
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.communityCard}>
      {/* Avatar kutusu ve baş harfler */}
      <View style={[styles.avatar, { backgroundColor: getCommunityColor(item.name) }]}> 
        <Text style={styles.avatarText}>{getCommunityInitials(item.name)}</Text>
      </View>
      {/* Topluluk bilgileri */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.memberInfo}>
          <Ionicons name="people" size={16} color={Colors.chatTime} />
          <Text style={styles.memberCount}>{item.memberCount} üye</Text>
        </View>
      </View>
      {/* Sağda ileri ok ikonu */}
      <Ionicons name="chevron-forward" size={20} color={Colors.chatTime} />
    </TouchableOpacity>
  );

  // Topluluk ismine göre renk seçer (her topluluk farklı renk)
  const getCommunityColor = (name: string) => {
    const colors = ['#4A90E2', '#50C878', '#02569B', '#FF6B6B', '#9B59B6', '#E67E22'];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Topluluk isminin baş harflerini döndürür
  const getCommunityInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      {/* Topluluklar listesi */}
      <FlatList
        data={communities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

// Stiller ve kart tasarımları
const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  // Topluluk kartı
  communityCard: {
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
  // Avatar kutusu
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: Colors.inputBorder,
  },
  // Avatar içindeki baş harfler
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  // Topluluk bilgileri kutusu
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // Topluluk adı
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  // Açıklama
  description: {
    fontSize: 14,
    color: Colors.chatTime,
    marginBottom: 8,
    lineHeight: 20,
  },
  // Üye sayısı ve ikon satırı
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Üye sayısı metni
  memberCount: {
    fontSize: 13,
    color: Colors.chatTime,
    marginLeft: 4,
  },
});