import { Chip } from '@/components/Chip';
import { SortableItem, SortableList } from '@/components/SortableList';
import { ScrollView, Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

const STORAGE_KEY = '@SOPA:user-ingredients';

type IngredientStage =
  | 'selection'
  | 'ranking'
  | 'completed';

type Value = string;

const AVAILABLE_VALUES: Value[] = [
  'Alegria',
  'Altruísmo',
  'Amizade',
  'Amor',
  'Autocontrole',
  'Bondade',
  'Cidadania',
  'Castidade',
  'Compaixão',
  'Comunhão',
  'Conhecimento',
  'Confiança',
  'Contentamento',
  'Coragem',
  'Criatividade',
  'Dedicação',
  'Desapego',
  'Deus',
  'Discernimento',
  'Disciplina',
  'Entusiasmo',
  'Esperança',
  'Espiritualidade',
  'Estabilidade',
  'Fé',
  'Família',
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
  'Perdão',
  'Perseverança',
  'Perspicácia',
  'Prudência',
  'Propósito',
  'Pureza',
  'Retidão',
  'Responsabilidade',
  'Sacrifício',
  'Santidade',
  'Saúde',
  'Sabedoria',
  'Serviço',
  'Submissão',
  'Temperança',
  'Trabalho',
  'Unidade',
  'Verdade',
  'Zelo',
];

type UserIngredients = {
  selectedValues: Value[];
  topValues: Value[];
  stage: IngredientStage;
};

const EMPTY_INGREDIENTS: UserIngredients = {
  selectedValues: [],
  topValues: [],
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
    setIngredients(current => {
      const updated = {
        ...current,
        ...update,
      };

      saveUserIngredients(updated);

      return updated;
    });
  }

  function toggleValue(value: Value) {
    setIngredients(current => {
      const isSelected = current.selectedValues.includes(value);

      const selectedValues = isSelected
        ? current.selectedValues.filter(item => item !== value)
        : [...current.selectedValues, value];

      const topValues = isSelected
        ? current.topValues.filter(item => item !== value)
        : current.topValues;

      return {
        ...current,
        selectedValues,
        topValues,
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

  function confirmTopValues(topValues: Value[], completed: Boolean) {
    if (topValues.length < 7) {
      return;
    }

    updateIngredients({
      topValues,
      stage: completed ? 'completed' : 'ranking',
    });
  }

  function editSelection() {
    updateIngredients({
      stage: 'selection',
    });
  }

  function editRanking() {
    updateIngredients({
      stage: 'ranking',
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
      return <IngredientRanking 
          selectedValues={ingredients.selectedValues}
          topValues={ingredients.topValues}
          onBack={editSelection}
          onConfirm={confirmTopValues}
      />;

    case 'completed':
      return <MyIngredients />;
  }
}

type IngredientSelectionProps = {
  selectedValues: Value[];
  onToggleValue: (value: Value) => void;
  onConfirm: () => void;
};

function IngredientSelection({
  selectedValues,
  onToggleValue,
  onConfirm
}: IngredientSelectionProps) {
  const sortedSelectedValues = selectedValues && [...selectedValues].sort((a, b) =>
    a?.localeCompare(b, 'pt-BR')
  );

  const canContinue = selectedValues.length === 7;

  return (    
    <View style={styles.container}>
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
          {sortedSelectedValues.map(value => (
            <Chip
              key={value}
              label={value}
              selected
              onPress={() => onToggleValue(value)}
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
          const selected = selectedValues.includes(value);

          return (
            <Chip
              key={value}
              label={value}
              selected={selectedValues.includes(value)}
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
      <Pressable
        style={({ hovered }) => [
          styles.button,
          !canContinue && styles.buttonDisabled,
          canContinue && hovered && styles.buttonHover,
        ]}
        onPress={canContinue ? onConfirm : undefined}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </Pressable>
    </View>
  )
}

type IngredientRankingProps = {
  selectedValues: Value[];
  topValues: Value[];
  onBack: () => void;
  onConfirm: (topValues: Value[], completed: Boolean) => void;
};

function IngredientRanking({
  selectedValues,
  topValues,
  onBack,
  onConfirm,
}: IngredientRankingProps) {
  const [sortableValues, setSortableValues] = useState<SortableItem[]>(
    () =>
      selectedValues.map((value) => ({
        id: value,
        label: value,
      }))
  );
  function onReorder(data: SortableItem[]) {
    setSortableValues(data);
  };
  return (
    <View  style={styles.container}>
      <Text>Agora coloque em ordem de importância para você.</Text>
      <Text> </Text>
      <SortableList
        data={sortableValues}
        onReorder={onReorder}
      />
      <View style={styles.buttonsContainer}>
        <Pressable style={({ hovered }) => [
          styles.button,
          hovered && styles.buttonHover
        ]} onPress={onBack}>
          <Text style={styles.buttonText}>Voltar</Text>
        </Pressable>
        <Pressable style={({ hovered }) => [
          styles.button,
          hovered && styles.buttonHover
        ]} onPress={onConfirm}>
          <Text style={styles.buttonText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  )
}

function MyIngredients() {
  return <Text>Meus Ingredientes</Text>
}

const styles = StyleSheet.create({  
  buttonHover: {
    backgroundColor: '#f3a040ff',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    margin: 12,
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