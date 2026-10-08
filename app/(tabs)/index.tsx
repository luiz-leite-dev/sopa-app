import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [identificacaoUsuario, setIdentificacaoUsuario] = useState<string | null>(null);

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
            <View style={[styles.circulo, selecionado && styles.circuloSelecionado]} />
            <Text style={styles.label}>{opcao.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
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
