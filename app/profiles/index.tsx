// Profil ekranı: Kullanıcıya ait profil bilgilerini gösteren ekran
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';

// Profil ekranı ana fonksiyonu
export default function ProfileScreen() {
  const params = useLocalSearchParams(); // Sayfaya yönlendirilirken gönderilen parametreleri alır

  // Parametrelerin tiplerini belirtiyoruz ve olası undefined durumları için varsayılan değerler sağlıyoruz.
  // Profil adı, ID ve avatar URL'si parametrelerden alınır, yoksa varsayılan değer atanır.
  const chatName = (params.chatName as string) || 'Bilinmeyen Kullanıcı';
  const chatId = (params.chatId as string) || 'N/A';
  const avatarUrl = (params.avatarUrl as string) || '';

  // Örnek bir durum (status) ve hakkında (about) metni
  const userStatus = "Müsait";
  const userAbout = "Hayat kısa, kuşlar uçuyor...";

  return (
    // Ekran kaydırılabilir, böylece içerik taşarsa aşağıya kaydırılabilir
    <ScrollView style={GlobalStyles.screenContainer} contentContainerStyle={styles.scrollContent}>
      {/* Profil üst kısmı: avatar, isim ve ID */}
      <View style={styles.profileHeader}>
        {/* Eğer avatarUrl varsa resmi göster, yoksa ikonlu yer tutucu göster */}
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.profileAvatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Ionicons name="person" size={70} color={Colors.textPrimary} />
          </View>
        )}
        <Text style={styles.profileName}>{chatName}</Text>
        <Text style={styles.profileId}>ID: {chatId}</Text>
      </View>

      {/* Durum ve hakkında bilgisi kartı */}
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <Text style={styles.itemLabel}>Durum ve Hakkımda</Text>
          <Text style={styles.itemValue}>{userStatus}</Text>
          <Text style={styles.itemSubValue}>{userAbout}</Text>
        </View>
      </View>

      {/* Telefon ve e-posta bilgisi kartı */}
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <Text style={styles.itemLabel}>Telefon</Text>
          <Text style={styles.itemValue}>+90 5XX XXX XX XX</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={styles.itemLabel}>E-posta</Text>
          <Text style={styles.itemValue}>example@example.com</Text>
        </View>
      </View>

      {/* Eylem butonları kartı: Sohbet, sesli ve görüntülü arama */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubbles-outline" size={24} color={Colors.whatsappLightGreen} />
          <Text style={styles.actionButtonText}>Sohbet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={24} color={Colors.whatsappLightGreen} />
          <Text style={styles.actionButtonText}>Sesli Ara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="videocam-outline" size={24} color={Colors.whatsappLightGreen} />
          <Text style={styles.actionButtonText}>Görüntülü Ara</Text>
        </TouchableOpacity>
      </View>

      {/* Şikayet et veya engelle butonu kartı */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.reportBlockButton}>
          <Ionicons name="thumbs-down-outline" size={24} color={Colors.errorRed} />
          <Text style={styles.reportBlockText}>Şikayet Et veya Engelle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Stiller: Ekrandaki her bölüm için özel stiller
const styles = StyleSheet.create({
  // ScrollView içeriği için alt boşluk
  scrollContent: {
    paddingBottom: 20, // En alta boşluk bırakmak için
  },
  // Profil üst kısmı (avatar, isim, ID)
  profileHeader: {
    backgroundColor: Colors.messageBackgroundOther, // Beyaz veya hafif gri
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  // Profil avatarı (resim)
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.whatsappLightGreen, // Avatarın etrafında WhatsApp yeşili bir çerçeve
  },
  // Avatar yoksa gösterilen yer tutucu
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.inputBorder, // Yer tutucu avatar rengi
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  // Profil adı
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  // Profil ID'si
  profileId: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  // Kart görünümü (beyaz kutular)
  card: {
    backgroundColor: Colors.messageBackgroundOther, // Beyaz kart arka planı
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Kart içindeki her bir satır
  cardItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, // İnce çizgi
    borderBottomColor: Colors.inputBorder,
  },
  // Son kart öğesi için alt çizgiyi kaldırmak için,
  // eğer dinamik olarak oluşturuyorsan, son öğeye özel stil verebilirsin.
  // Bu örnekte manuel olduğu için her birine alt çizgi ekleniyor.
  // Kart başlığı
  itemLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  // Kart ana değeri
  itemValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  // Kart alt değeri (ör: hakkında)
  itemSubValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  // Eylem butonları (sohbet, arama)
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.inputBorder,
  },
  // Eylem butonu metni
  actionButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  // Şikayet/engelle butonu
  reportBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  // Şikayet/engelle metni
  reportBlockText: {
    marginLeft: 15,
    fontSize: 16,
    color: Colors.errorRed, // Kırmızı renk
  },
});