
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type TimePickerProps = {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return { hours: '08', minutes: '00' };
  }

  return {
    hours: match[1],
    minutes: match[2],
  };
}

function clamp(value: string, max: number) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Math.min(max, parsed));
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function TimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'HH:mm',
}: TimePickerProps) {
  const colorScheme = useColorScheme();
  const [visible, setVisible] = useState(false);
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');
  const hoursRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hoursRef.current?.focus();
        if (Platform.OS !== 'web') {
          hoursRef.current?.setNativeProps({
            selection: { start: 0, end: 2 },
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  function openPicker() {
    if (disabled) return;

    const time = parseTime(value);

    setHours(time.hours);
    setMinutes(time.minutes);
    setVisible(true);
  }

  function adjustHours(amount: number) {
    const current = clamp(hours, 23);
    setHours(pad((current + amount + 24) % 24));
  }

  function adjustMinutes(amount: number) {
    const current = clamp(minutes, 59);
    setMinutes(pad((current + amount + 60) % 60));
  }

  function saveTime() {
    const h = clamp(hours, 23);
    const m = clamp(minutes, 59);

    onChange(`${pad(h)}:${pad(m)}`);
    setVisible(false);
  }

  function normalizeHours(text: string) {
    setHours(text.replace(/\D/g, '').slice(0, 2));
  }

  function normalizeMinutes(text: string) {
    setMinutes(text.replace(/\D/g, '').slice(0, 2));
  }

  return (
    <>
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Horário ${value || placeholder}`}
        style={({ pressed }) => [
          styles.input,
          pressed && styles.pressed,
          disabled && styles.disabled,
          { borderColor: Colors[colorScheme].border },
          { backgroundColor: Colors[colorScheme].inputBackground }
        ]}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>

        <View style={styles.clockIcon}>
          <View style={styles.clockHandVertical} />
          <View style={styles.clockHandHorizontal} />
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={styles.dialog}
            onPress={() => {}}
          >
            <Text style={styles.title}>Selecionar horário</Text>

            <View style={styles.pickerRow}>
              <View style={styles.unit}>
                <Pressable
                  style={styles.stepButton}
                  onPress={() => adjustHours(1)}
                  accessibilityLabel="Aumentar hora"
                >
                  <Text style={styles.arrow}>▲</Text>
                </Pressable>

                <TextInput
                  ref={hoursRef}
                  value={hours}
                  onChangeText={normalizeHours}
                  onBlur={() => setHours(pad(clamp(hours, 23)))}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  accessibilityLabel="Hora"
                  style={styles.numberInput}
                />

                <Pressable
                  style={styles.stepButton}
                  onPress={() => adjustHours(-1)}
                  accessibilityLabel="Diminuir hora"
                >
                  <Text style={styles.arrow}>▼</Text>
                </Pressable>

                <Text style={styles.unitLabel}>Hora</Text>
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.unit}>
                <Pressable
                  style={styles.stepButton}
                  onPress={() => adjustMinutes(1)}
                  accessibilityLabel="Aumentar minuto"
                >
                  <Text style={styles.arrow}>▲</Text>
                </Pressable>

                <TextInput
                  value={minutes}
                  onChangeText={normalizeMinutes}
                  onBlur={() => setMinutes(pad(clamp(minutes, 59)))}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  accessibilityLabel="Minuto"
                  style={styles.numberInput}
                />

                <Pressable
                  style={styles.stepButton}
                  onPress={() => adjustMinutes(-1)}
                  accessibilityLabel="Diminuir minuto"
                >
                  <Text style={styles.arrow}>▼</Text>
                </Pressable>

                <Text style={styles.unitLabel}>Minuto</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => setVisible(false)}
                style={styles.actionButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={saveTime}
                style={[styles.actionButton, styles.confirmButton]}
              >
                <Text style={styles.confirmText}>OK</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    width: '100%',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  inputText: {
    fontSize: 16,
    color: '#222222',
  },
  placeholder: {
    color: '#757575',
  },
  clockIcon: {
    width: 17,
    height: 17,
    borderWidth: 1.5,
    borderColor: '#555555',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHandVertical: {
    position: 'absolute',
    width: 1.5,
    height: 5,
    backgroundColor: '#555555',
    top: 3,
  },
  clockHandHorizontal: {
    position: 'absolute',
    width: 4,
    height: 1.5,
    backgroundColor: '#555555',
    left: 7,
    top: 7,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    elevation: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.18)',
    userSelect: 'none',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  unit: {
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 64,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  arrow: {
    fontSize: 13,
    color: '#444444',
  },
  numberInput: {
    width: 64,
    height: 54,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 4,
    fontSize: 27,
    textAlign: 'center',
    color: '#222222',
    padding: 0,
  },
  separator: {
    fontSize: 28,
    color: '#333333',
    marginBottom: 22,
  },
  unitLabel: {
    fontSize: 12,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
  actionButton: {
    minWidth: 80,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 14,
    color: '#444444',
  },
  confirmButton: {
    backgroundColor: '#cd933e',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
