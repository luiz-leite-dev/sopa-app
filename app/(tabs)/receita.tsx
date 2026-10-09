
import { ScrollView, Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  ScrollView as NativeScrollView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput
} from 'react-native';

const INGREDIENTS_STORAGE_KEY = '@SOPA:user-ingredients';
const RECIPE_STORAGE_KEY = '@SOPA:recipe';

type SelectedValue = {
  value: string;
  order: number;
};

type Recipe = {
  mainIngredient: string | null;
  secondaryIngredients: string[];
  weeklyGoal: string;
};

const EMPTY_RECIPE: Recipe = {
  mainIngredient: null,
  secondaryIngredients: [],
  weeklyGoal: '',
};

type SelectorType = 'main' | 'secondary' | null;

export default function Receita() {
  const scrollViewRef = useRef<NativeScrollView>(null);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [selectedValues, setSelectedValues] = useState<
    SelectedValue[]
  >([]);
  const [recipe, setRecipe] = useState<Recipe>(EMPTY_RECIPE);
  const [selector, setSelector] = useState<SelectorType>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ingredientsData, recipeData] = await Promise.all([
          AsyncStorage.getItem(INGREDIENTS_STORAGE_KEY),
          AsyncStorage.getItem(RECIPE_STORAGE_KEY),
        ]);

        if (ingredientsData) {
          const ingredients = JSON.parse(ingredientsData);

          setSelectedValues(
            [...ingredients.selectedValues].sort(
              (a, b) => a.order - b.order
            )
          );
        }

        if (recipeData) {
          setRecipe({
            ...EMPTY_RECIPE,
            ...JSON.parse(recipeData),
          });
        }
      } catch (error) {
        console.error('Erro ao carregar receita:', error);
      } finally {
        setHydrated(true);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(
      RECIPE_STORAGE_KEY,
      JSON.stringify(recipe)
    ).catch(error => {
      console.error('Erro ao salvar receita:', error);
    });
  }, [recipe, hydrated]);

  function updateRecipe(updatedRecipe: Recipe) {
    setRecipe(updatedRecipe);
  }

  function selectMainIngredient(value: string) {
    updateRecipe({
      ...recipe,
      mainIngredient: value,
      secondaryIngredients:
        recipe.secondaryIngredients.filter(
          item => item !== value
        ),
    });

    setSelector(null);
  }

  function toggleSecondaryIngredient(value: string) {
    const isSelected =
      recipe.secondaryIngredients.includes(value);

    updateRecipe({
      ...recipe,
      secondaryIngredients: isSelected
        ? recipe.secondaryIngredients.filter(
            item => item !== value
          )
        : [...recipe.secondaryIngredients, value],
    });
  }

  function clearRecipe() {
    const confirmClear = async () => {
      try {
        await AsyncStorage.removeItem(RECIPE_STORAGE_KEY);
        setRecipe(EMPTY_RECIPE);
        setSelector(null);
      } catch (error) {
        console.error('Erro ao limpar receita:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('Deseja limpar todos os dados da receita?')
      ) {
        void confirmClear();
      }
      return;
    }

    Alert.alert(
      'Limpar receita',
      'Deseja apagar todos os dados da receita atual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => void confirmClear(),
        },
      ]
    );
  }

  async function continueToSpoonful() {
    if (!recipe.mainIngredient || !recipe.weeklyGoal.trim()) {
      return;
    }

    try {
      await AsyncStorage.setItem(
        RECIPE_STORAGE_KEY,
        JSON.stringify(recipe)
      );

      router.navigate('/colherada');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      Alert.alert('Erro', 'Não foi possível salvar sua receita.');
    }
  }

  if (!hydrated) return null;

  const secondaryOptions = selectedValues.filter(
    item => item.value !== recipe.mainIngredient
  );

  const mainLabel =
    selectedValues.find(
      item => item.value === recipe.mainIngredient
    )?.value ?? 'Selecione um ingrediente';

  const canContinue =
    !!recipe.mainIngredient &&
    recipe.weeklyGoal.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <NativeScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingrediente principal</Text>

            <Text style={styles.instruction}>
              Qual valor você quer desenvolver nesta semana?
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.selectField,
                pressed && styles.fieldPressed,
              ]}
              onPress={() => setSelector('main')}
              accessibilityRole="button"
              accessibilityLabel={`Ingrediente principal: ${mainLabel}`}
            >
              <Text
                style={[
                  styles.selectText,
                  !recipe.mainIngredient && styles.placeholder,
                ]}
              >
                {mainLabel}
              </Text>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pitadas especiais</Text>

            <Text style={styles.instruction}>
              Quais outros valores podem complementar sua receita?
              (Opcional)
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.selectField,
                pressed && styles.fieldPressed,
              ]}
              onPress={() => setSelector('secondary')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.selectText,
                  recipe.secondaryIngredients.length === 0 &&
                    styles.placeholder,
                ]}
              >
                {recipe.secondaryIngredients.length === 0
                  ? 'Adicionar ingredientes'
                  : `${recipe.secondaryIngredients.length} ingrediente(s) selecionado(s)`}
              </Text>
              <Text style={styles.plus}>＋</Text>
            </Pressable>

            {recipe.secondaryIngredients.length > 0 && (
              <View style={styles.chipsContainer}>
                {recipe.secondaryIngredients.map(value => (
                  <Pressable
                    key={value}
                    style={styles.chip}
                    onPress={() => toggleSecondaryIngredient(value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${value}`}
                  >
                    <Text style={styles.chipText}>{value}</Text>
                    <Text style={styles.chipRemove}>×</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meu objetivo</Text>

            <Text style={styles.instruction}>
              O que você deseja colocar em prática nesta semana?
            </Text>

            <TextInput
              style={styles.goalInput}
              value={recipe.weeklyGoal}
              onChangeText={weeklyGoal =>
                updateRecipe({ ...recipe, weeklyGoal })
              }
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({
                    animated: false,
                  });
                }, 50);
              }}
              placeholder="Ex.: Ter mais paciência com minha família, mesmo nos momentos difíceis."
              placeholderTextColor="#888"
              multiline
              textAlignVertical="top"
              accessibilityLabel="Objetivo da semana"
            />
          </View>

          <Pressable
            style={styles.clearButton}
            onPress={clearRecipe}
            accessibilityRole="button"
          >
            <Text style={styles.clearButtonText}>
              Limpar receita
            </Text>
          </Pressable>
        </NativeScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue && styles.buttonDisabled,
            canContinue && pressed && styles.buttonPressed,
          ]}
          onPress={
            canContinue ? continueToSpoonful : undefined
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </Pressable>

        <Modal
          visible={selector !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelector(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setSelector(null)}
              accessibilityLabel="Fechar seletor"
            />

            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selector === 'main'
                    ? 'Ingrediente principal'
                    : 'Pitadas especiais'}
                </Text>

                <Pressable
                  onPress={() => setSelector(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar"
                >
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.modalSubtitle}>
                {selector === 'main'
                  ? 'Escolha um ingrediente'
                  : 'Selecione quantos quiser'}
              </Text>

              <ScrollView
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              >
                {(selector === 'main'
                  ? selectedValues
                  : secondaryOptions
                ).map(item => {
                  const selected =
                    selector === 'main'
                      ? recipe.mainIngredient === item.value
                      : recipe.secondaryIngredients.includes(
                          item.value
                        );

                  return (
                    <Pressable
                      key={item.value}
                      style={({ pressed }) => [
                        styles.option,
                        selected && styles.optionSelected,
                        pressed && styles.optionPressed,
                      ]}
                      onPress={() => {
                        if (selector === 'main') {
                          selectMainIngredient(item.value);
                        } else {
                          toggleSecondaryIngredient(item.value);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {item.value}
                      </Text>

                      <Text
                        style={[
                          styles.optionMark,
                          selected && styles.optionMarkSelected,
                        ]}
                      >
                        {selected
                          ? selector === 'main'
                            ? '●'
                            : '✓'
                          : selector === 'main'
                            ? '○'
                            : '□'}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {selector === 'secondary' && (
                <Pressable
                  style={styles.modalDoneButton}
                  onPress={() => setSelector(null)}
                >
                  <Text style={styles.modalDoneText}>Concluir</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
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
  contentContainer: {
    paddingBottom: 16,
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
  instruction: {
    fontSize: Platform.select({
      ios: 14,
      android: 10,
      web: 14,
      default: 14,
    }),
    lineHeight: 20,
    color: '#777',
  },
  selectField: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldPressed: {
    opacity: 0.7,
  },
  selectText: {
    fontSize: 15,
    flex: 1,
  },
  placeholder: {
    color: '#888',
  },
  chevron: {
    fontSize: 24,
    color: '#777',
    marginBottom: 10,
  },
  plus: {
    fontSize: 22,
    color: '#cd933e',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 7,
    paddingLeft: 12,
    paddingRight: 9,
    backgroundColor: '#cd933e22',
  },
  chipText: {
    color: '#cd933e',
    fontSize: 14,
  },
  chipRemove: {
    color: '#cd933e',
    fontSize: 19,
    lineHeight: 20,
  },
  goalInput: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    lineHeight: 21,
    color: '#333',
  },
  clearButton: {
    alignSelf: 'center',
  },
  clearButtonText: {
    color: '#b33a3a',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  continueButton: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    backgroundColor: '#f3a040ff',
  },
  continueButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalClose: {
    fontSize: 22,
    color: '#777',
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 6,
    marginBottom: 12,
  },
  optionsList: {
    flexGrow: 0,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionSelected: {
    backgroundColor: '#cd933e18',
  },
  optionPressed: {
    opacity: 0.65,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#a66f21',
    fontWeight: '600',
  },
  optionMark: {
    fontSize: 19,
    color: '#888',
    width: 24,
    textAlign: 'center',
  },
  optionMarkSelected: {
    color: '#cd933e',
  },
  modalDoneButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#cd933e',
    marginTop: 12,
  },
  modalDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});