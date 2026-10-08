import { Text } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.selected,
      ]}
    >
      <MaterialIcons name="check" size={16} color="#fff" style={[ styles.icon, !selected && styles.hiddenIcon, ]} />  
      <Text
        style={[
          styles.label,
          selected && styles.selectedLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    userSelect: 'none',
  },

  hiddenIcon: { 
    opacity: 0, 
  },

  icon: { 
    // marginRight: 4,
  },

  selected: {
    backgroundColor: '#cd933eff',
    borderColor: '#cd933eff',
  },

  label: {
    fontSize: 14,
    color: '#444',
    width: 112,
  },

  selectedLabel: {
    color: '#fff',
  },
});