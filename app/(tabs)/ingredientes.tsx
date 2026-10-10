import { Chip } from '@/components/Chip';
import { SortableItem, SortableList } from '@/components/SortableList';
import { ScrollView, Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BORDER_RADIUS } from '@/constants/Components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

const STORAGE_KEY = '@SOPA:ingredients';

type IngredientStage =
  | 'selection'
  | 'ranking'
  | 'completed';

type Value = string;

type SelectedValue = {
  value: Value;
  order: number;
};

const AVAILABLE_VALUES: Value[] = [
  'Alegria',
  'Altruísmo',
  'Amizade',
  'Amor',
  'Autocontrole',
  'Bondade',
  'Cidadania',
  'Compaixão',
  'Conhecimento',
  'Confiança',
  'Coragem',
  'Criatividade',
  'Dedicação',
  'Desafio',
  'Desapego',
  'Deus',
  'Discernimento',
  'Disciplina',
  'Entusiasmo',
  'Esperança',
  'Espiritualidade',
  'Estabilidade',
  'Excelência',
  'Família',
  'Fé',
  'Fidelidade',
  'Força',
  'Fraternidade',
  'Generosidade',
  'Gentileza',
  'Gratidão',
  'Harmonia',
  'Honestidade',
  'Hospitalidade',
  'Humanidade',
  'Humildade',
  'Igualdade',
  'Imparcialidade',
  'Inovação',
  'Integridade',
  'Justiça',
  'Lealdade',
  'Liderança',
  'Longanimidade',
  'Mansidão',
  'Moderação',
  'Obediência',
  'Paciência',
  'Paz',
  'Perseverança',
  'Perspicácia',
  'Prudência',
  'Propósito',
  'Retidão',
  'Responsabilidade',
  'Saúde',
  'Sabedoria',
  'Serviço',
  'Temperança',
  'Trabalho',
  'Verdade',
  'Zelo',
];

type UserIngredients = {
  selectedValues: SelectedValue[];
  stage: IngredientStage;
};

const EMPTY_INGREDIENTS: UserIngredients = {
  selectedValues: [],
  stage: 'selection',
};

async function loadUserIngredients(): Promise<UserIngredients> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    return EMPTY_INGREDIENTS;
  }

  const saved = JSON.parse(data);

  return {
    ...EMPTY_INGREDIENTS,
    ...saved,
  };
}

async function saveUserIngredients(
  ingredients: UserIngredients
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(ingredients)
  );
}

export default function Ingredientes() {
  const [hydrated, setHydrated] = useState(false);
  const [ingredients, setIngredients] = useState<UserIngredients>(EMPTY_INGREDIENTS);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserIngredients()
      .then(data => {
        setIngredients(data);
        setHydrated(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    saveUserIngredients(ingredients);
  }, [ingredients, hydrated]);

  if (loading) {
    return null;
  }

  function updateIngredients(
    update: Partial<UserIngredients>
  ) {
    setIngredients(current => ({
      ...current,
      ...update,
    }));
  }

  function toggleValue(value: Value) {
    setIngredients(current => {
      const isSelected = current.selectedValues.some(
        item => item.value === value
      );

      const updatedValues = isSelected
        ? current.selectedValues.filter(item => item.value !== value)
        : [
            ...current.selectedValues,
            { value, order: current.selectedValues.length + 1 },
          ];

      const selectedValues = updatedValues.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      return {
        ...current,
        selectedValues,
      };
    });
  }

  function confirmSelection() {
    if (ingredients.selectedValues.length !== 7) {
      return;
    }

    updateIngredients({
      stage: 'ranking',
    });
  }

  function confirmRanking(selectedValues: SelectedValue[], completed: boolean) {
    if (selectedValues.length !== 7) {
      return;
    }

    updateIngredients({
      selectedValues: selectedValues,
      stage: completed ? 'completed' : 'ranking',
    });
  }

  function editSelection() {
    updateIngredients({
      stage: 'selection',
    });
  }

  switch (ingredients.stage) {
    case 'selection':
      return <IngredientSelection 
          selectedValues={ingredients.selectedValues}
          onToggleValue={toggleValue}
          onConfirm={confirmSelection}
      />;

    case 'ranking':
    case 'completed':
      return <IngredientRanking 
          selectedValues={ingredients.selectedValues}
          onBack={editSelection}
          onConfirm={confirmRanking}
      />;
  }
}

type IngredientSelectionProps = {
  selectedValues: SelectedValue[];
  onToggleValue: (value: Value) => void;
  onConfirm: () => void;
};

function IngredientSelection({
  selectedValues,
  onToggleValue,
  onConfirm
}: IngredientSelectionProps) {
  const colorScheme = useColorScheme();
  const sortedSelectedValues = [...selectedValues].sort(
    (a, b) => a.value.localeCompare(b.value, 'pt-BR')
  );

  const canContinue = selectedValues.length === 7;

  return (    
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.paragraph}>Quais ingredientes você gostaria de colocar na sua sopa?</Text>
        <Text style={styles.paragraph}>Escolha 7 que fazem sentido para você.</Text>
        <Text style={styles.sectionTitle}>Seus ingredientes ({selectedValues.length}/7)</Text>
        {selectedValues.length === 0 ? (
          <Text style={styles.instruction}>
            Selecione 7 para continuar.
          </Text>
        ) : (
        <>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            style={styles.selectedScroll}
            contentContainerStyle={styles.selectedChips}
          >
            {sortedSelectedValues.map(item => (
              <Chip
                key={item.value}
                label={item.value}
                selected
                onPress={() => onToggleValue(item.value)}
              />
            ))}
          </ScrollView>
        </>
        )}
        <Text style={styles.sectionTitle}>Ingredientes disponíveis</Text>
        <ScrollView 
          style={styles.chips}
          contentContainerStyle={styles.chipsContent}
        >
          {AVAILABLE_VALUES.map(value => {
            const selected = selectedValues.some(
                item => item.value === value
              );
            return (
              <Chip
                key={value}
                label={value}
                selected={selected}
                onPress={() => {
                  if (selected || selectedValues.length < 7) {
                    onToggleValue(value);
                  }
                }
                }
              />
            )
          })}
        </ScrollView>
      </View>
      <Pressable
        style={[
          styles.button,
          !canContinue && styles.buttonDisabled,
          { backgroundColor: Colors[colorScheme].primaryButton },
        ]}
        onPress={canContinue ? onConfirm : undefined}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </Pressable>
    </View>
  )
}

type IngredientRankingProps = {
  selectedValues: SelectedValue[];
  onBack: () => void;
  onConfirm: (selectedValues: SelectedValue[], completed: boolean) => void;
};

function IngredientRanking({
  selectedValues,
  onBack,
  onConfirm,
}: IngredientRankingProps) {
  const colorScheme = useColorScheme();
  const [sortableValues, setSortableValues] = useState<SortableItem[]>(
    () =>
      [...selectedValues]
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          id: item.value,
          label: item.value,
        }))
  );
  const router = useRouter();

  function handleReorder(data: SortableItem[]) {
    setSortableValues(data);

    const rankedValues: SelectedValue[] = data.map(
      (item, index) => ({
        value: item.id,
        order: index + 1,
      })
    );

    onConfirm(rankedValues, false);
  }

  function handleConfirm() {
    onConfirm(sortableValues.map((item, index) => ({
      value: item.id,
      order: index + 1,
    })), true);
    router.navigate('/receita')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Coloque em ordem de importância para você.</Text>
        <Text> </Text>

        <SortableList
          data={sortableValues}
          onReorder={handleReorder}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].secondaryButton },
          ]}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].primaryButton },
          ]}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    padding: 12,
    textAlign: 'center',
    fontWeight: '600',
    maxHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  chips: {
    flex: 1,
    marginBottom: 12,
  },
  chipsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  container: {
    padding: 16,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  instruction: {
    fontSize: 14,
    color: '#777',
    marginLeft: 9,
    marginTop: 9,
    marginBottom: 24,
  },
  paragraph: {
    marginTop: 15,
    fontSize: Platform.select({
      ios: 22,
      android: 16,
      web: 20,
      default: 20,
    }),
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  selectedScroll: {
    minHeight: 50,
    maxHeight: 50,
    height: 50,
  },
  selectedChips: {
    gap: 8,
    alignItems: 'center',
  },
})