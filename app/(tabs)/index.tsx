import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BORDER_RADIUS } from '@/constants/Components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

const STORAGE_KEY = '@SOPA:user-type';

const opcoes = [
  { id: 'christian', label: 'Sou cristão(ã) e quero crescer na fé.' },
  { id: 'toknow', label: 'Tenho interesse em conhecer mais sobre Jesus.' },
  { id: 'nonchristian', label: 'Não sou cristão(ã), mas busco mais sentido e paz.' },
  { id: 'undecided', label: 'Ainda não sei bem o que acredito.' },
];

export default function Inicio() {
  const colorScheme = useColorScheme();
  const [identificacaoUsuario, setIdentificacaoUsuario] = useState<string | null>(null);
  const router = useRouter();

// Carrega a escolha salva ao montar a tela
  useEffect(() => {
    async function carregarValor() {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          setIdentificacaoUsuario(salvo);
        } else {
          setIdentificacaoUsuario(null);
        }
      } catch (e) {
        console.warn('Erro ao ler AsyncStorage:', e);
      }
    }
    carregarValor();
  }, []);

  // Salva sempre que o valor mudar
  useEffect(() => {
    if (identificacaoUsuario === null) return; // evita salvar antes de carregar
    async function salvarValor() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, identificacaoUsuario);
      } catch (e) {
        console.warn('Erro ao salvar em AsyncStorage:', e);
      }
    }
    salvarValor();
  }, [identificacaoUsuario]);

  function handleSelecionar(id: string) {
    setIdentificacaoUsuario(id);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.paragraph}>Bem-vindo à Sopa.</Text>
        <Text style={styles.paragraph}>Este é um espaço para alimentar sua alma com valores, sentido e esperança.</Text>
        <Text style={styles.paragraph}>Sopa é inspirado nos ensinamentos de Jesus, que disse: ‘Vós sois o sal da terra’.</Text>
        <Text style={styles.paragraph}>Se você é cristão, vai encontrar aqui um apoio para viver sua fé no dia a dia.</Text>
        <Text style={styles.paragraph}>Se você não é cristão, mas busca mais sentido, paz e direção, este lugar também é para você.</Text>
        <Text style={styles.paragraph}>Como você se identifica hoje?</Text>
        {opcoes.map((opcao) => {
          const selecionado = identificacaoUsuario === opcao.id;
          return (
            <Pressable
              key={opcao.id}
              onPress={() => handleSelecionar(opcao.id)}
              style={styles.opcao}
              accessibilityRole="radio"
              accessibilityState={{ checked: selecionado }}
            >
              <View style={[styles.circulo, selecionado && styles.circuloSelecionado && { backgroundColor: Colors[colorScheme].primaryButton }]} />
              <Text style={styles.label}>{opcao.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].primaryButton },
          ]}
          onPress={() => router.navigate('/ingredientes')}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    padding: 12,
    textAlign: 'center',
    fontWeight: '600',
    maxHeight: 50,
    minHeight: 50,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  container: {
    padding: 16,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  paragraph: {
    marginTop: 15,
    fontSize: Platform.select({
      ios: 21.8,
      android: 14.5,
      web: 22,
      default: 20,
    }),
    textAlign: 'justify',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 16,
  },
  circulo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    marginRight: 10,
  },
  circuloSelecionado: {
    backgroundColor: '#e59346ff',
  },
  label: {
    fontSize: 16,
  },
});
