import React, { useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 150;
const CARD_HEIGHT = 220;

interface CardFlipProps {
  onFlip?: (isFlipped: boolean) => void;
}

const CardFlip: React.FC<CardFlipProps> = ({ onFlip }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = new Animated.Value(0);

  const handlePress = () => {
    setIsFlipped(!isFlipped);

    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    onFlip?.(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Frente da Carta */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
            { backfaceVisibility: 'hidden' },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.corner}>
              <Text style={styles.suit}>♠</Text>
              <Text style={styles.value}>K</Text>
            </View>

            <View style={styles.centerContent}>
              <Text style={styles.largeSuit}>♠</Text>
            </View>

            <View style={[styles.corner, styles.cornerBottom]}>
              <Text style={styles.value}>K</Text>
              <Text style={styles.suit}>♠</Text>
            </View>
          </View>
        </Animated.View>

        {/* Verso da Carta */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { backfaceVisibility: 'hidden' },
          ]}
        >
          <View style={styles.backPattern}>
            <View style={styles.patternRow}>
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
            </View>
            <View style={styles.patternRow}>
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
            </View>
            <View style={styles.patternRow}>
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
              <View style={styles.patternDot} />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a5c3a',
  },
  cardTouchable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-between',
    padding: 8,
  },
  cardBack: {
    backgroundColor: '#c41e3a',
    borderWidth: 2,
    borderColor: '#8b0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  corner: {
    alignItems: 'center',
  },
  cornerBottom: {
    transform: [{ rotate: '180deg' }],
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  suit: {
    fontSize: 14,
    color: '#c41e3a',
    marginBottom: 4,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeSuit: {
    fontSize: 60,
    color: '#c41e3a',
    fontWeight: 'bold',
  },
  backPattern: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  patternDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffd700',
    marginHorizontal: 8,
  },
});

export default CardFlip;
