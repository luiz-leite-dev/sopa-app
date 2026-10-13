import { ScrollView, SubText, Text, View } from '@/components/Themed';
import TimePicker from '@/components/TimePicker';
import Colors from '@/constants/Colors';
import { BORDER_RADIUS } from '@/constants/Components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme
} from 'react-native';

const STORAGE_KEY = '@SOPA/colherada';
const COLOR_GOLD = '#C18B40';
const COLOR_BACKGROUND = '#FFF8EA';
const COLOR_CARD = '#FFFFFF';
const COLOR_BORDER = '#E6D8C1';

const ALERT_OPTIONS = [5, 10, 15, 30];

type Colherada = {
  action: string;
  time: string;
  alertEnabled: boolean;
  alertMinutes: number;
  notificationId?: string;
};

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function getScheduledDate(time: string, minutesBefore = 0) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() - minutesBefore);

  return date;
}

export default function ColheradaScreen() {
  const colorScheme = useColorScheme();
  const [action, setAction] = useState('');
  const [time, setTime] = useState('');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertMinutes, setAlertMinutes] = useState<number | null>(null);

  const [colherada, setColherada] = useState<Colherada | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadColherada = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: Colherada = JSON.parse(saved);
        setColherada(parsed);
      } else {
        setColherada(null);
      }
    } catch (error) {
      console.error('Erro ao carregar colherada:', error);
      showAlert(
        'Ops!',
        'Não foi possível carregar sua colherada.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColherada();
  }, [loadColherada]);

  async function requestNotificationPermission() {
    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  }

  async function scheduleReminder(
    actionText: string,
    actionTime: string,
    minutesBefore: number,
  ) {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'sopa-reminders',
        {
          name: 'Lembretes do SOPA',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        },
      );
    }

    const reminderDate = getScheduledDate(
      actionTime,
      minutesBefore,
    );

    if (reminderDate.getTime() <= Date.now()) {
      throw new Error(
        'O horário do alerta já passou. Escolha um horário futuro ou desative o alerta.',
      );
    }

    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      throw new Error(
        'A permissão para notificações não foi concedida.',
      );
    }

    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sua colherada está chegando!',
        body: actionText,
        data: { screen: 'colherada' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
        ...(Platform.OS === 'android'
          ? { channelId: 'sopa-reminders' }
          : {}),
      },
    });
  }

  async function handleSave() {
    if (!action.trim()) {
      showAlert('Ação obrigatória', 'Descreva sua colherada.');
      return;
    }

    if (!isValidTime(time)) {
      showAlert(
        'Horário inválido',
        'Informe um horário válido no formato HH:mm, por exemplo, 18:30.',
      );
      return;
    }

    setSaving(true);

    try {
      let notificationId: string | undefined;

      if (alertMinutes !== null) {
        notificationId = await scheduleReminder(
          action.trim(),
          time,
          alertMinutes,
        );
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        console.log('Notificações agendadas:', scheduled);
      }

      const newColherada: Colherada = {
        action: action.trim(),
        time,
        alertEnabled: alertMinutes !== null,
        alertMinutes: alertMinutes ?? 0,
        notificationId,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newColherada),
      );

      setColherada(newColherada);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar sua colherada.';

      showAlert('Não foi possível salvar', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (saving || !colherada) return;

    setSaving(true);

    try {
      if (colherada.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          colherada.notificationId,
        );
      }

      await AsyncStorage.removeItem(STORAGE_KEY);

      setColherada(null);
      setAction('');
      setTime('');
      setAlertEnabled(false);
      setAlertMinutes(null);
    } catch (error) {
      console.error('Erro ao concluir colherada:', error);
      showAlert(
        'Ops!',
        'Não foi possível concluir sua colherada. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primaryButton} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {colherada ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Sua colherada de hoje
              </Text>

              <Text style={styles.actionText}>
                {colherada.action}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>◷</Text>
                <View style={styles.infoText}>
                  <Text style={styles.fieldLabel}>HORÁRIO</Text>
                  <Text style={styles.infoValue}>
                    {colherada.time}
                  </Text>
                </View>
              </View>

              {colherada.alertEnabled && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>♧</Text>
                  <View style={styles.infoText}>
                    <Text style={styles.fieldLabel}>LEMBRETE</Text>
                    <Text style={styles.infoValue}>
                      {colherada.alertMinutes} minutos antes
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sua próxima colherada</Text>

              <SubText style={styles.helperText}>
                Qual atitude você deseja colocar em prática hoje?
              </SubText>

              <TextInput
                style={[
                    styles.input, 
                    styles.actionInput,
                    { borderColor: Colors[colorScheme].border },
                    { backgroundColor: Colors[colorScheme].inputBackground }
                  ]}
                value={action}
                onChangeText={setAction}
                placeholder="Ex.: Ligar para alguém da família"
                placeholderTextColor={ Colors[colorScheme].placeholder }
                multiline
                maxLength={500}
                textAlignVertical="top"
              />

              <SubText style={styles.helperText}>
                Que horas fará isso hoje?
              </SubText>
              <TimePicker
                value={time}
                onChange={setTime}
              />
              { Platform.OS !== 'web' && (
                <View>
                  <SubText style={styles.helperText}>
                    Quer ser lembrado quantos minutos antes? (Opcional)
                  </SubText>

                  <View style={styles.chipContainer}>
                    {ALERT_OPTIONS.map((minutes) => {
                      const selected = alertMinutes === minutes;

                      return (
                        <Pressable
                          key={minutes}
                          onPress={() =>
                            setAlertMinutes((current) =>
                              current === minutes ? null : minutes
                            )
                          }
                          style={[
                            styles.chip,
                            selected && { backgroundColor: Colors[colorScheme].primaryButton },
                            !selected && { backgroundColor: Colors[colorScheme].secondaryButton },
                          ]}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              selected && styles.chipTextSelected,
                            ]}
                          >
                            {minutes} min
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor:
                  Colors[colorScheme].primaryButton,
              },
            ]}
            onPress={colherada ? handleComplete : handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {colherada ? '✓  Concluir' : 'Salvar colherada'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    minHeight: 50,
    borderRadius: BORDER_RADIUS,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    gap: Platform.select({
      ios: 6,
      android: 3,
      web: 6,
      default: 6,
    }),
  },
  sectionTitle: {
    fontSize: Platform.select({
      ios: 16,
      android: 15,
      web: 16,
      default: 16,
    }),
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  actionInput: {
    minHeight: 100,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLOR_CARD,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    gap: 10,
  },
  actionText: {
    fontSize: 18,
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#F3E5C9',
    color: COLOR_GOLD,
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    gap: 3,
  },
  infoValue: {
    fontSize: 16,
  },
  reminderCard: {
    padding: 16,
    gap: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reminderDescription: {
    flex: 1,
    gap: 4,
  },
  alertOptions: {
    gap: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderColor: COLOR_BORDER,
    backgroundColor: COLOR_BACKGROUND,
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
