import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router'; // useRouter'ı import ediyoruz
import * as React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, GlobalStyles } from '../components/SharedStyles';

// Ekran Bileşenlerini import ediyoruz
import { setupUserTable } from '../app/database';
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';
import CallsScreen from './calls';
import ChatsScreen from './chats';
import CommunitiesScreen from './communities';
import UpdatesScreen from './updates';
// import ProfileScreen from './profiles'; // Artık doğrudan yönlendirme yapacağımız için bileşeni burada import etmeye gerek yok

// Bottom Tab Navigator'ı oluşturuyoruz
const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [showRegister, setShowRegister] = React.useState(false);
  const [showAccountModal, setShowAccountModal] = React.useState(false);

  // Kullanıcı tablosunu ilk renderda oluştur
  React.useEffect(() => {
    setupUserTable();
  }, []);

  // Custom Header Bileşeni (WhatsApp'ın üst kısmı için)
  const CustomWhatsAppHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.push('./profiles')}>
        <Text style={styles.headerTitle}>WhatsApp</Text>
      </TouchableOpacity>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="camera-outline" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color={Colors.headerText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowAccountModal(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.headerText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Hesap modalı
  const AccountModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Hesap Bilgileri</Text>
        <Text style={styles.modalLabel}>Email:</Text>
        <Text style={styles.modalValue}>{user?.email}</Text>
        <View style={styles.modalButtonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => { setUser(null); setShowAccountModal(false); }}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowAccountModal(false)}>
          <Text style={styles.closeButtonText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Oturum kontrolü: Giriş yapılmadıysa login/register ekranlarını göster
  if (!user) {
    if (showRegister) {
      return (
        <RegisterScreen
          onRegister={u => { setUser(u); setShowRegister(false); }}
          onNavigateToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={u => setUser(u)}
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }
  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <CustomWhatsAppHeader />
      {showAccountModal && <AccountModal />}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: Colors.whatsappLightGreen,
          tabBarInactiveTintColor: Colors.chatTime,
          tabBarStyle: {
            backgroundColor: Colors.messageBackgroundOther,
            height: Platform.OS === 'ios' ? 90 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
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
              iconName = 'reload-circle-sharp';
            } else if (route.name === 'communities') {
              iconName = 'people-sharp';
            } else if (route.name === 'calls') {
              iconName = 'call-sharp';
            } else {
              iconName = 'help-circle-sharp';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="chats" component={ChatsScreen} options={{ title: 'Sohbetler' }} />
        <Tab.Screen name="updates" component={UpdatesScreen} options={{ title: 'Güncellemeler' }} />
        <Tab.Screen name="communities" component={CommunitiesScreen} options={{ title: 'Topluluklar' }} />
        <Tab.Screen name="calls" component={CallsScreen} options={{ title: 'Aramalar' }} />
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    marginLeft: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: Colors.headerContainer,
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.whatsappGreen,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    color: Colors.chatTime,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: Colors.whatsappLightGreen,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.chatTime,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});