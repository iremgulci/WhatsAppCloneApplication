import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router'; // useRouter'ı import ediyoruz
import * as React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, GlobalStyles } from '../components/SharedStyles';

// Ekran Bileşenlerini import ediyoruz
import CallsScreen from './calls';
import ChatsScreen from './chats';
import CommunitiesScreen from './communities';
import UpdatesScreen from './updates';
// import ProfileScreen from './profiles'; // Artık doğrudan yönlendirme yapacağımız için bileşeni burada import etmeye gerek yok

// Bottom Tab Navigator'ı oluşturuyoruz
const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const router = useRouter(); // useRouter hook'unu burada başlatıyoruz

  // Custom Header Bileşeni (WhatsApp'ın üst kısmı için)
  // useRouter'ı kullanabilmek için AppTabs fonksiyonunun içine taşıdık
  const CustomWhatsAppHeader = () => (
    <View style={styles.headerContainer}>
      {/* Başlığa tıklanabilir özellik ekliyoruz */}
      <TouchableOpacity onPress={() => router.push('./profiles')}>
        <Text style={styles.headerTitle}>WhatsApp</Text>
      </TouchableOpacity>
      <View style={styles.headerIcons}>
        {/* Kamera ikonu */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="camera-outline" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        {/* Arama ikonu */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        {/* Üç nokta menü ikonu */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.headerText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <CustomWhatsAppHeader /> {/* Ana Header'ı buraya ekliyoruz */}

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // Her bir sekmenin kendi header'ı olmayacak, ana header'ı kullanıyoruz
          tabBarActiveTintColor: Colors.whatsappLightGreen, // Aktif sekme rengi
          tabBarInactiveTintColor: Colors.chatTime, // Pasif sekme rengi
          tabBarStyle: {
            backgroundColor: Colors.messageBackgroundOther, // Sekme barı arka planı (beyaz)
            height: Platform.OS === 'ios' ? 90 : 60, // iOS için alt boşluk
            paddingBottom: Platform.OS === 'ios' ? 20 : 0, // iOS için padding
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'chats') {
              iconName = 'chatbubbles-sharp';
            } else if (route.name === 'updates') {
              iconName = 'reload-circle-sharp'; // Veya 'sync-circle-sharp'
            } else if (route.name === 'communities') {
              iconName = 'people-sharp';
            } else if (route.name === 'calls') {
              iconName = 'call-sharp';
            } else {
              iconName = 'help-circle-sharp'; // Varsayılan ikon
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* Expo Router ile uyumlu olarak sekmeleri tanımlıyoruz */}
        <Tab.Screen name="chats" component={ChatsScreen} options={{
          title: 'Sohbetler', // Tab bar'daki metin
        }} />
        <Tab.Screen name="updates" component={UpdatesScreen} options={{
          title: 'Güncellemeler',
        }} />
        <Tab.Screen name="communities" component={CommunitiesScreen} options={{
          title: 'Topluluklar',
        }} />
        <Tab.Screen name="calls" component={CallsScreen} options={{
          title: 'Aramalar',
        }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.headerContainer,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Android için durum çubuğu boşluğu
  },
  headerTitle: {
    color: Colors.whatsappLightGreen,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 20, // İkonlar arasında boşluk
  },
});