import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, GlobalStyles } from '../../components/SharedStyles';

export default function UpdatesScreen() {
  return (
    <View style={GlobalStyles.screenContainer}>
      <Text style={styles.title}>Güncellemeler Ekranı</Text>
      <Text style={styles.subtitle}>Burada durum güncellemeleri ve kanallar olacak.</Text>
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