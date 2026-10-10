const tintColorLight = '#E67E22'; // Laranja queimado - Espírito Santo
const tintColorDark = '#F39C12';  // Laranja dourado

export default {
  light: {
    text: '#3E2723',        // Marrom café escuro
    subText: '#806C52',     // Marrom claro
    placeholder: '#888',    // Cinza
    background: '#FDF5E6',  // Creme/off-white quente
    inputBackground: '#fff', // Branco
    border: '#E6D8C1',
    tint: tintColorLight,
    tabIconDefault: '#A1887F', // Marrom médio
    tabIconSelected: tintColorLight,
    primaryButton: '#e59346ff', // Laranjado
    secondaryButton: '#ffe8bdff', // Laranjado claro
  },
  dark: {
    text: '#FDF5E6',        // Creme
    subText: '#cbc4b7ff',   // Creme acinzentado
    placeholder: '#888',    // Cinza
    background: '#4E342E',  // Marrom escuro
    inpugBackground: '#000', // Preto
    border: '#cbc4b7ff',
    tint: tintColorDark,
    tabIconDefault: '#8D6E63', // Marrom claro
    tabIconSelected: tintColorDark,
    primaryButton: '#e59346ff', // Laranjado
    secondaryButton: '#5b3c35ff', // Laranjado claro
  },
};