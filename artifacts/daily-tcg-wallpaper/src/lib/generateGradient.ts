export function generateGradient(mood: string, style: string, id: number) {
  // A deterministic way to generate nice dark jewel tones based on mood/style
  const hash = Array.from(mood + style + id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const hues = [
    [260, 290], // Violets
    [160, 190], // Teals
    [330, 360], // Pinks/Reds
    [40, 60],   // Golds
    [200, 230], // Deep Blues
  ];
  
  const selectedHue = hues[hash % hues.length];
  
  const h1 = selectedHue[0] + (hash % 20);
  const h2 = selectedHue[1] - (hash % 20);
  
  return `linear-gradient(135deg, hsl(${h1}, 80%, 15%) 0%, hsl(${h2}, 90%, 8%) 100%)`;
}
