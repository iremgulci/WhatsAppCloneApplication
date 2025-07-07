import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';

export default function CommunitiesScreen() {
  return (
    <View style={GlobalStyles.screenContainer}>
      <Text style={styles.title}>Topluluklar Ekranı</Text>
      <Text style={styles.subtitle}>Burada WhatsApp Toplulukları yer alacak.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.chatTime,
    textAlign: 'center',
    marginTop: 10,
  },
});