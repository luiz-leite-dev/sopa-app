import { Pressable, StyleSheet, Text } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

export type SortableItem = {
  id: string;
  label: string;
};

type SortableListProps = {
  data: SortableItem[];
  onReorder: (data: SortableItem[]) => void;
};

export function SortableList({
  data,
  onReorder,
}: SortableListProps) {
  const renderItem = ({
    item,
    drag,
    // isActive,
  }: RenderItemParams<SortableItem>) => {
    return (
      <Pressable
        key={item.id}
        onLongPress={drag}
        delayLongPress={300}
        style={[
            styles.item,
            // isActive && styles.itemActive,
        ]}
        >
        <Text style={styles.handle}>⋮⋮</Text>
        <Text style={styles.label}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <DraggableFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onDragEnd={({ data }) => onReorder(data)}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },

  itemActive: {
    opacity: 0.85,
    // transform: [{ scale: 1.02 }],
  },

  handle: {
    width: 24,
    marginRight: 12,
    fontSize: 20,
    textAlign: 'center',
  },

  label: {
    flex: 1,
    fontSize: 16,
  },
});