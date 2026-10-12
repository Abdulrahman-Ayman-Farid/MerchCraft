export interface SampleLogo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  dataUrl: string;
}

// Helper to convert clean SVG string to data URL
function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_LOGOS: SampleLogo[] = [
  {
    id: 'aura-coffee',
    name: 'Aura Coffee Roasters',
    tagline: 'Artisanal & Botanical',
    category: 'Lifestyle',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <circle cx="250" cy="250" r="230" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-dasharray="14 10" />
        <circle cx="250" cy="250" r="210" fill="none" stroke="#FFFFFF" stroke-width="4" />
        <path d="M250 80 Q290 180 250 250 Q210 180 250 80 Z" fill="#FFFFFF" />
        <path d="M250 250 Q290 320 250 420 Q210 320 250 250 Z" fill="#FFFFFF" opacity="0.8" />
        <circle cx="250" cy="250" r="32" fill="#FFFFFF" />
        <circle cx="250" cy="250" r="18" fill="#18181B" />
        <text x="250" y="215" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">A U R A</text>
        <text x="250" y="300" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">ROASTERS • EST 2024</text>
      </svg>
    `),
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo 2099',
    tagline: 'Cyberpunk & Synthwave',
    category: 'Streetwear',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <polygon points="250,50 430,390 70,390" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round" />
        <polygon points="250,110 390,370 110,370" fill="none" stroke="#FFFFFF" stroke-width="4" />
        <circle cx="250" cy="240" r="75" fill="#FFFFFF" />
        <line x1="120" y1="210" x2="380" y2="210" stroke="#18181B" stroke-width="8" />
        <line x1="140" y1="240" x2="360" y2="240" stroke="#18181B" stroke-width="8" />
        <line x1="160" y1="270" x2="340" y2="270" stroke="#18181B" stroke-width="8" />
        <text x="250" y="440" font-family="'JetBrains Mono', monospace" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="12">NEON // TOKYO</text>
        <text x="250" y="475" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="500" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">SYSTEM OVERRIDE 01</text>
      </svg>
    `),
  },
  {
    id: 'north-peak',
    name: 'North Peak Expeditions',
    tagline: 'Pacific Northwest Heritage',
    category: 'Outdoor',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <rect x="50" y="50" width="400" height="400" rx="36" fill="none" stroke="#FFFFFF" stroke-width="10" />
        <polygon points="250,110 370,310 130,310" fill="#FFFFFF" />
        <polygon points="250,110 210,180 250,210 290,180" fill="#18181B" />
        <polygon points="160,230 230,310 90,310" fill="#FFFFFF" opacity="0.9" />
        <polygon points="340,230 410,310 270,310" fill="#FFFFFF" opacity="0.9" />
        <!-- Pines -->
        <polygon points="250,290 270,330 230,330" fill="#18181B" />
        <polygon points="210,300 225,330 195,330" fill="#18181B" />
        <polygon points="290,300 305,330 275,330" fill="#18181B" />
        <rect x="70" y="340" width="360" height="4" fill="#FFFFFF" />
        <text x="250" y="390" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">NORTH PEAK</text>
        <text x="250" y="420" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">EST. 1984 • OUTDOOR CLUB</text>
      </svg>
    `),
  },
  {
    id: 'hyperion-sound',
    name: 'Hyperion Sound Labs',
    tagline: 'Brutalist Audio Collective',
    category: 'Music',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <g fill="#FFFFFF">
          <!-- Brutalist equalizer waveform -->
          <rect x="80" y="160" width="30" height="180" rx="6" />
          <rect x="130" y="100" width="30" height="300" rx="6" />
          <rect x="180" y="140" width="30" height="220" rx="6" />
          <rect x="235" y="60" width="30" height="380" rx="6" />
          <rect x="290" y="120" width="30" height="260" rx="6" />
          <rect x="340" y="190" width="30" height="120" rx="6" />
          <rect x="390" y="150" width="30" height="200" rx="6" />
        </g>
        <circle cx="250" cy="250" r="160" fill="none" stroke="#FFFFFF" stroke-width="14" />
        <text x="250" y="465" font-family="'JetBrains Mono', monospace" font-size="26" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">HYPERION // LABS</text>
      </svg>
    `),
  },
  {
    id: 'surf-club',
    name: 'Pacific Drift Surf Club',
    tagline: 'Malibu Summer Vibe',
    category: 'Retro',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <circle cx="250" cy="250" r="220" fill="none" stroke="#FFFFFF" stroke-width="10" />
        <!-- Sun rays -->
        <path d="M250 80 A120 120 0 0 1 370 200 L130 200 A120 120 0 0 1 250 80 Z" fill="#FFFFFF" />
        <!-- Waves -->
        <path d="M100 260 Q175 220 250 260 T400 260 L400 340 L100 340 Z" fill="#FFFFFF" />
        <path d="M80 300 Q165 270 250 300 T420 300 L420 380 L80 380 Z" fill="#18181B" />
        <path d="M100 330 Q175 300 250 330 T400 330 L400 370 L100 370 Z" fill="#FFFFFF" />
        <text x="250" y="430" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">PACIFIC DRIFT</text>
        <text x="250" y="460" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">SURF CO. • MALIBU</text>
      </svg>
    `),
  },
  {
    id: 'zenith-geometry',
    name: 'Zenith Architecture',
    tagline: 'Minimalist Spatial Studio',
    category: 'Minimal',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <polygon points="250,70 410,160 410,340 250,430 90,340 90,160" fill="none" stroke="#FFFFFF" stroke-width="12" />
        <line x1="250" y1="70" x2="250" y2="430" stroke="#FFFFFF" stroke-width="6" />
        <line x1="90" y1="160" x2="410" y2="340" stroke="#FFFFFF" stroke-width="6" />
        <line x1="90" y1="340" x2="410" y2="160" stroke="#FFFFFF" stroke-width="6" />
        <circle cx="250" cy="250" r="45" fill="#FFFFFF" />
        <circle cx="250" cy="250" r="25" fill="#18181B" />
        <text x="250" y="475" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="10">ZENITH STUDIO</text>
      </svg>
    `),
  },
];
