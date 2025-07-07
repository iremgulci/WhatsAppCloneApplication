import { Platform, StatusBar, StyleSheet } from 'react-native';

export const Colors = {
  whatsappGreen: '#075E54', // Koyu WhatsApp yeşili
  whatsappLightGreen: '#1dab61', // Daha açık WhatsApp yeşili
  messageBackgroundMine: '#DCF8C6', // Benim mesajım için açık yeşil
  messageBackgroundOther: 'white', // Diğer mesajlar için beyaz
  chatTime: '#667781', // Sohbet zamanı ve son mesaj rengi
  headerContainer: 'white', // Header arka plan rengi
  headerText: 'black',
  screenBackground: '#F5F5F5', // Genel ekran arka planı
  chatDetailBackground: '#ECE5DD', // Sohbet detay ekranı arka planı
  inputBackground: 'white',
  inputBorder: '#F0F0F0',
  textPrimary: '#1F2C34', // Koyu gri metin
  blueTick: '#34B7F1', // Mavi tik rengi
};

export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerContainer,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Avatar ve isim arasındaki boşluk
  },
  chatDetailTitle: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatAvatar: { // YENİ EKLEDİĞİMİZ STİL
    width: 35,
    height: 35,
    borderRadius: 35 / 2, // Yuvarlak avatar için
    backgroundColor: '#ccc', // Placeholder renk
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  iconButton: {
    padding: 5,
  },
});