const tintColorLight = '#E67E22'; // Laranja queimado - Espírito Santo
const tintColorDark = '#F39C12';  // Laranja dourado

export default {
  light: {
    text: '#3E2723',        // Marrom café escuro
    background: '#FDF5E6',  // Creme/off-white quente
    tint: tintColorLight,
    tabIconDefault: '#A1887F', // Marrom médio
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FDF5E6',        // Creme
    background: '#4E342E',  // Marrom escuro
    tint: tintColorDark,
    tabIconDefault: '#8D6E63', // Marrom claro
    tabIconSelected: tintColorDark,
  },
};