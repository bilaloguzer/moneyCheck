// Settings screen - app settings, language, data management, export, account deletion
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { t, locale, setLocale } = useLocalization();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      t('auth.signOut'),
      t('auth.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleLanguageChange = async (newLocale: string) => {
    await setLocale(newLocale);
    setShowLanguageModal(false);
    Alert.alert(t('common.success'), t('settings.languageChanged'));
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>{t('auth.email')}</Text>
            <Text style={styles.settingValue}>{user?.email || t('settings.notLoggedIn')}</Text>
          </View>
          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={24} color="#E03E3E" />
              <Text style={[styles.settingText, { color: '#E03E3E' }]}>{t('auth.signOut')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={24} color="#64748B" />
              <Text style={styles.settingText}>{t('settings.language')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{locale === 'tr' ? 'Türkçe' : 'English'}</Text>
              <Ionicons name="chevron-forward" size={24} color="#64748B" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data')}</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings/data-management')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="folder" size={24} color="#64748B" />
              <Text style={styles.settingText}>{t('settings.dataManagement')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>{t('settings.version')}</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#37352F" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.languageOption, locale === 'en' && styles.languageOptionActive]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageText, locale === 'en' && styles.languageTextActive]}>
                🇬🇧 English
              </Text>
              {locale === 'en' && <Ionicons name="checkmark-circle" size={24} color="#2C9364" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, locale === 'tr' && styles.languageOptionActive]}
              onPress={() => handleLanguageChange('tr')}
            >
              <Text style={[styles.languageText, locale === 'tr' && styles.languageTextActive]}>
                🇹🇷 Türkçe
              </Text>
              {locale === 'tr' && <Ionicons name="checkmark-circle" size={24} color="#2C9364" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E9E9E7',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#787774',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    color: '#37352F',
    fontWeight: '400',
  },
  settingValue: {
    fontSize: 15,
    color: '#787774',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#37352F',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    backgroundColor: '#F7F6F3',
    marginBottom: 12,
  },
  languageOptionActive: {
    backgroundColor: '#2C936410',
    borderColor: '#2C9364',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37352F',
  },
  languageTextActive: {
    color: '#2C9364',
    fontWeight: '600',
  },
});
