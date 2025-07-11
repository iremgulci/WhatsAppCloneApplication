// Bu dosya, chats stack'inin layout'unu ve header'ını özelleştirir.
// Chat detay ekranı için özel başlık (avatar, isim, header butonları) ve navigasyon ayarları içerir.

import { Ionicons } from '@expo/vector-icons';
import { Stack, useNavigation, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../components/SharedStyles';

export default function ChatsStackLayout() {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <Stack>
      {/* Chat ana ekranı (liste) için header gizli */}
      <Stack.Screen name="index" options={{
        headerShown: false,
      }} />
      {/* Chat detay ekranı için özel header */}
      <Stack.Screen
        name="[chatId]"
        options={({ route }) => {
          // Parametrelerden chat adı ve avatarı al
          const params = route.params as { chatName: string; chatId: string; avatarUrl: string };
          const chatName = params.chatName;
          const avatarUrl = params.avatarUrl;

          // Header'a tıklanınca profil ekranına yönlendir
          const handleHeaderPress = () => {
            // Kişi kartına gitmek için router.push kullanıyoruz
            router.push({
              pathname: '../profiles',
              params: {
                chatId: params.chatId,
                chatName: chatName,
                avatarUrl: avatarUrl,
              },
            });
            console.log(`Kişi kartına git: ${chatName} (ID: ${params.chatId}, Avatar: ${avatarUrl})`);
          };

          return {
            headerShown: true,
            // Header'da avatar ve isim göster, tıklanınca profile git
            headerTitle: () => (
              <TouchableOpacity
                onPress={handleHeaderPress}
                style={stackHeaderStyles.chatDetailHeader}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={stackHeaderStyles.chatAvatar} />
                ) : (
                  <View style={stackHeaderStyles.placeholderAvatar} />
                )}
                <Text style={stackHeaderStyles.chatDetailTitle}>{chatName}</Text>
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: Colors.headerContainer,
            },
            headerTintColor: Colors.headerText,
            // Sağ üstte video, arama ve menü ikonları
            headerRight: () => (
              <View style={stackHeaderStyles.headerRightContainer}>
                <TouchableOpacity style={stackHeaderStyles.iconButton}>
                  <Ionicons name="videocam" size={24} color={Colors.headerText} />
                </TouchableOpacity>
                <TouchableOpacity style={stackHeaderStyles.iconButton}>
                  <Ionicons name="call" size={24} color={Colors.headerText} />
                </TouchableOpacity>
                <TouchableOpacity style={stackHeaderStyles.iconButton}>
                  <Ionicons name="ellipsis-vertical" size={24} color={Colors.headerText} />
                </TouchableOpacity>
              </View>
            ),
          };
        }}
      />
    </Stack>
  );
}

// Header stilleri
const stackHeaderStyles = StyleSheet.create({
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: Colors.inputBorder,
    marginRight: 10,
  },
  chatDetailTitle: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chatAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  iconButton: {
    paddingHorizontal: 8,
  },
});