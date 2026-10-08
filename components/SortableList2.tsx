import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

export type SortableItem = {
  id: string;
  label: string;
};

type SortableListProps = {
  data: SortableItem[];
  onReorder: (data: SortableItem[]) => void;
};

const ITEM_HEIGHT = 56;
const ITEM_GAP = 8;
const ITEM_STEP = ITEM_HEIGHT + ITEM_GAP;

export function SortableList({
  data,
  onReorder,
}: SortableListProps) {
  const positions = useSharedValue<Record<string, number>>({});
  const activeId = useSharedValue<string | null>(null);
  const dragStartIndex = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const translationY = useSharedValue(0);

  useEffect(() => {
    const nextPositions: Record<string, number> = {};

    data.forEach((item, index) => {
      nextPositions[item.id] = index;
    });

    positions.value = nextPositions;
  }, [data]);

  function commitOrder() {
    const ordered = [...data].sort(
      (a, b) =>
        positions.value[a.id] - positions.value[b.id]
    );

    onReorder(ordered);
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <SortableRow
          key={item.id}
          item={item}
          index={index}
          positions={positions}
          activeId={activeId}
          dragStartIndex={dragStartIndex}
          currentIndex={currentIndex}
          translationY={translationY}
          onReorder={commitOrder}
        />
      ))}
    </View>
  );
}

type SortableRowProps = {
  item: SortableItem;
  index: number;
  positions: Animated.SharedValue<Record<string, number>>;
  activeId: Animated.SharedValue<string | null>;
  dragStartIndex: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  translationY: Animated.SharedValue<number>;
  onReorder: () => void;
};

function SortableRow({
  item,
  positions,
  activeId,
  dragStartIndex,
  currentIndex,
  translationY,
  onReorder,
}: SortableRowProps) {
  const gesture = useMemo(
    () => {
      const pan = Gesture.Pan();

      if (Platform.OS === 'web') {
        pan.minDistance(0);
      } else {
        pan.activateAfterLongPress(300);
      }

      return pan
        .onStart(() => {
          const index = positions.value[item.id];

          activeId.value = item.id;
          dragStartIndex.value = index;
          currentIndex.value = index;
          translationY.value = 0;
        })
        .onUpdate((event) => {
          translationY.value = event.translationY;

          const start = dragStartIndex.value;

          const nextIndex = Math.max(
            0,
            Math.min(
              Object.keys(positions.value).length - 1,
              start +
                Math.round(
                  event.translationY / ITEM_STEP
                )
            )
          );

          if (nextIndex === currentIndex.value) {
            return;
          }

          const oldIndex = currentIndex.value;

          const nextPositions = {
            ...positions.value,
          };

          Object.keys(nextPositions).forEach((id) => {
            const position = nextPositions[id];

            if (id === item.id) {
              return;
            }

            if (
              nextIndex > oldIndex &&
              position > oldIndex &&
              position <= nextIndex
            ) {
              nextPositions[id] = position - 1;
            }

            if (
              nextIndex < oldIndex &&
              position >= nextIndex &&
              position < oldIndex
            ) {
              nextPositions[id] = position + 1;
            }
          });

          nextPositions[item.id] = nextIndex;

          positions.value = nextPositions;
          currentIndex.value = nextIndex;
        })
        .onEnd(() => {
          translationY.value = withSpring(0);

          activeId.value = null;

          runOnJS(onReorder)();
        })
        .onFinalize(() => {
          activeId.value = null;
        })},
    [
      item.id,
      positions,
      activeId,
      dragStartIndex,
      currentIndex,
      translationY,
      onReorder,
    ]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const position = positions.value[item.id] ?? 0;

    const isActive = activeId.value === item.id;

    const extraOffset = isActive
      ? translationY.value +
        (dragStartIndex.value - currentIndex.value) * ITEM_STEP
      : 0;

    return {
      transform: [
        {
          translateY: position * ITEM_STEP + extraOffset,
        },
      ],

      zIndex: isActive ? 100 : 0,

      // Android
      elevation: isActive ? 8 : 0,

      // iOS
      shadowColor: '#000',
      shadowOpacity: isActive ? 0.2 : 0,
      shadowRadius: isActive ? 8 : 0,
      shadowOffset: {
        width: 0,
        height: isActive ? 4 : 0,
      },

      // WEB
      boxShadow: Platform.OS === 'web'
        ? isActive
            ? '0px 4px 12px rgba(0, 0, 0, 0.20)'
            : 'none'
        : undefined,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.item,
          animatedStyle,
        ]}
      >
        <Text style={styles.handle}>⋮⋮</Text>

        <Text style={styles.label}>
          {item.label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 7 * ITEM_STEP,
    position: 'relative',
  },

  item: {
    position: 'absolute',
    left: 0,
    right: 0,

    height: ITEM_HEIGHT,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    borderRadius: 12,
    backgroundColor: '#FFF',
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