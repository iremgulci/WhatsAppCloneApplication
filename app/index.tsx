import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router'; // useRouter'ı import ediyoruz
import * as React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ensureChatsForUser, setupDatabase, setupUserTable } from '../app/database';
import { Colors, GlobalStyles } from '../components/SharedStyles';
// Ekran Bileşenlerini import ediyoruz
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
  const [currentUserId, setCurrentUserId] = React.useState<string>('');
  const [chatListRefreshKey, setChatListRefreshKey] = React.useState(0);

  // Chat listesini yenilemek için callback
  const refreshChatList = React.useCallback(() => {
    setChatListRefreshKey(prev => prev + 1);
  }, []);

  // Kullanıcı tablosunu ilk renderda oluştur
  React.useEffect(() => {
    //dropAndRecreateUserTable();
    //dropAndRecreateMessages();
    //dropAndRecreateChats();
    setupUserTable();
    setupDatabase();
  }, []);

  // Custom Header Bileşeni (WhatsApp'ın üst kısmı için)
  const CustomWhatsAppHeader = () => (
    <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>WhatsApp</Text>
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
      <View style={styles.profileCard}>
        {/* Profil Fotoğrafı */}
        <TouchableOpacity style={styles.avatarContainer}>
          {/* Burada profil fotoğrafı varsa göster, yoksa default ikon */}
          <Ionicons name="person-circle" size={80} color={Colors.whatsappLightGreen} />
          <View style={styles.editPhotoOverlay}>
            <Ionicons name="camera" size={24} color={Colors.headerText} />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.name || 'İsim'}</Text>        
        <Text style={styles.profileName}>{user?.username || 'Kullanıcı Adı'}</Text>
        <View style={styles.profileDivider} />
        <TouchableOpacity style={styles.logoutButton} onPress={() => { setUser(null); setShowAccountModal(false); }}>
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
          onRegister={u => { 
            console.log('Register user object:', u);
            setUser(u); 
            setShowRegister(false);
            // Kullanıcı kimliğini oluştur - sabit olmalı
            const userId = `user_${u.userId || u.id}`;
            console.log('Generated userId:', userId);
            setCurrentUserId(userId);
            // Mevcut mesaj tarihine göre chat'leri oluştur
            try { ensureChatsForUser(u.userId || u.id, userId); } catch {}
          }}
          onNavigateToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={u => { 
          console.log('Login user object:', u);
          setUser(u);
          // Kullanıcı kimliğini oluştur - sabit olmalı
          const userId = `user_${u.userId || u.id}`;
          console.log('Generated userId:', userId);
          setCurrentUserId(userId);
          // Mevcut mesaj tarihine göre chat'leri oluştur
          try { ensureChatsForUser(u.userId || u.id, userId); } catch {}
        }}
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
        <Tab.Screen
          name="chats"
          options={{ title: 'Sohbetler' }}
        >
          {() => <ChatsScreen 
            userId={user?.userId || user?.id} 
            currentUserId={currentUserId} 
            onChatListRefresh={refreshChatList}
            key={chatListRefreshKey}
          />}
        </Tab.Screen>
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
  profileCard: {
    backgroundColor: Colors.headerContainer,
    borderRadius: 20,
    padding: 28,
    minWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.whatsappLightGreen,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.headerContainer,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.whatsappGreen,
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  profileDivider: {
    width: '80%',
    height: 1,
    backgroundColor: Colors.chatTime,
    marginVertical: 12,
  },
  logoutButton: {
    backgroundColor: Colors.whatsappLightGreen,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 8,
    width: '80%',
    alignItems: 'center',
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
    width: '80%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});