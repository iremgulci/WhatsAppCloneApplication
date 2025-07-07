import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router'; // Expo Router'dan Stack
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../components/SharedStyles';
// Parametre tiplerini doğrudan Stack.Screen option'larında belirteceğiz.

export default function ChatsStackLayout() {
  return (
    // Stack bileşeni doğrudan tip argümanı almaz
    <Stack>
      <Stack.Screen name="index" options={{
        headerShown: false, // Sohbetler Listesi ekranı, ana header'ı kullanacak
      }} />
      <Stack.Screen
        name="[chatId]"
        options={({ route }) => {
          // Expo Router ile route.params doğrudan gelir,
          // ancak yine de güvenli erişim için tip kontrolü yapalım
          const params = route.params as { chatName: string; chatId: string };
          const chatName = params.chatName;
          // const chatId = params.chatId; // Şu an kullanılmıyor ama kalsın

          return {
            headerShown: true,
            headerTitle: () => (
              <View style={stackHeaderStyles.chatDetailHeader}>
                {/* Chat avatarı da buraya gelebilir, örneğin:
                <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={stackHeaderStyles.chatAvatar} />
                */}
                <Text style={stackHeaderStyles.chatDetailTitle}>{chatName}</Text>
              </View>
            ),
            headerStyle: {
              backgroundColor: Colors.headerContainer,
            },
            headerTintColor: Colors.headerText,
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

const stackHeaderStyles = StyleSheet.create({
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatDetailTitle: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chatAvatar: { // Avatar için yeni stil
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