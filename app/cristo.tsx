import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, useColorScheme } from 'react-native';

import { ScrollView, Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { BORDER_RADIUS } from '@/constants/Components';

const YOUVERSION_APP_URL = 'youversion://';
const IOS_STORE_URL = 'https://apps.apple.com/br/app/b%C3%ADblia/id282935706';
const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.sirma.mobile.bible.android';
const YOUVERSION_WEB_URL = 'https://www.bible.com/';

async function abrirYouVersion() {
  if (Platform.OS === 'web') {
    window.open(YOUVERSION_WEB_URL, '_blank');
    return;
  }
  const loja =
    Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_STORE_URL;
  try {
    const podeAbrir = await Linking.canOpenURL(YOUVERSION_APP_URL);

    if (podeAbrir) {
      await Linking.openURL(YOUVERSION_APP_URL);
      return;
    }
    await Linking.openURL(loja);
  } catch {
    await Linking.openURL(loja);
  }
}

export function BotaoYouVersion() {
  const colorScheme = useColorScheme();
  return (
    <Pressable onPress={abrirYouVersion} style={[
        styles.botao,
        { backgroundColor: Colors[colorScheme].primaryButton },
      ]}>
      <Text style={styles.botao_text}>Conhecer Jesus através da Bíblia.</Text>
    </Pressable>
  );
}

export default function ModalScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Conhecendo a Jesus</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.title}>Uma vida que mudou a história</Text>
      <Text style={styles.paragraph}>A vida de Jesus foi tão singular que seu nascimento se tornou a referência para a divisão tradicional dos anos em antes de Cristo e depois de Cristo.</Text>
      <Text style={styles.paragraph}>Entretanto, sua influência vai muito além do calendário.</Text>
      <Text style={styles.paragraph}>Seus ensinamentos sobre amor, perdão, misericórdia, humildade, serviço e fé atravessaram gerações e continuam transformando vidas ao redor do mundo.</Text>
      <Text style={styles.paragraph}>Além disso, para os cristãos, Jesus não é apenas alguém que marcou a história.</Text>
      <Text style={styles.paragraph}>Ele é o Filho de Deus, o Cristo, o Salvador.</Text>
      <Text style={styles.paragraph}>Conhecê-lo é conhecer sua história, suas palavras, seus ensinamentos e aquilo que Ele fez por nós.</Text>
      <Text style={styles.title}>Quem é Jesus?</Text>
      <Text style={styles.paragraph}>Jesus nasceu em Belém, viveu na região da Galileia e da Judeia e dedicou sua vida a ensinar, servir, acolher e amar as pessoas.</Text>
      <Text style={styles.paragraph}>Para a fé cristã, Ele é o Filho de Deus, enviado ao mundo para revelar o amor de Deus e reconciliar a humanidade com Ele.</Text>
      <Text style={styles.paragraph}>“Eu sou o caminho, a verdade e a vida.” João 14:6</Text>
      <Text style={styles.title}>O que Jesus ensinou?</Text>
      <Text style={styles.paragraph}>Entre seus principais ensinamentos estão:</Text>
      <Text style={styles.list}>• Amar a Deus</Text>
      <Text style={styles.list}>• Amar o próximo</Text>
      <Text style={styles.list}>• Perdoar</Text>
      <Text style={styles.list}>• Servir</Text>
      <Text style={styles.list}>• Praticar a misericórdia</Text>
      <Text style={styles.list}>• Cuidar de quem sofre</Text>
      <Text style={styles.list}>• Confiar em Deus</Text>
      <Text style={styles.paragraph}>Jesus resumiu seus ensinamentos em dois grandes mandamentos:</Text>
      <Text style={styles.paragraph}>“Amar a Deus acima de tudo e amar o próximo como a si mesmo.” Mateus 22:37-39</Text>
      <Text style={styles.title}>E o que aconteceu com Jesus?</Text>
      <Text style={styles.paragraph}>Jesus foi condenado à morte e crucificado.</Text>
      <Text style={styles.paragraph}>Para a fé cristã, porém, a história não termina na cruz.</Text>
      <Text style={styles.bold}>Jesus ressuscitou ao terceiro dia.</Text>
      <Text style={styles.paragraph}>A ressurreição é o centro da esperança cristã e representa a vitória sobre a morte.</Text>
      <Text style={styles.title}>Como posso conhecê-lo melhor?</Text>
      <Text style={styles.paragraph}>Você pode começar pelos relatos da sua vida nos quatro Evangelhos: <Text style={styles.bold}>Mateus, Marcos, Lucas e João.</Text></Text>
      <Text style={styles.paragraph}>Uma boa forma de começar é pelo <Text style={styles.bold}>Evangelho de João.</Text></Text>
      <Text style={styles.paragraph}>Para ler a Bíblia, acompanhar planos de leitura e aprofundar seus estudos, recomendamos o <Text style={styles.bold}>YouVersion</Text>.</Text>
      <BotaoYouVersion/>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    marginVertical: 15,
    height: 1,
    width: '80%',
  },
  paragraph: {
    marginTop: 15,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
    marginTop: 15,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  list: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  botao: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
  },
  botao_text: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
});
