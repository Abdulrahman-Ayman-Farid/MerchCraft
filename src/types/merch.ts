export type ProductCategory = 'apparel' | 'accessories' | 'drinkware' | 'prints';

export interface ProductColor {
  name: string;
  hex: string;
  pantone?: string;
}

export interface PrintArea {
  // Percentage coordinates relative to 1000x1000 base canvas
  x: number; // Center X % (0-100)
  y: number; // Center Y % (0-100)
  width: number; // Max print width %
  height: number; // Max print height %
  maxPrintWidthInches: number;
  maxPrintHeightInches: number;
  warpType?: 'flat' | 'cylinder' | 'curved';
  displacementFactor?: number;
}

export interface ProductView {
  id: string;
  name: string;
  label: string;
  printArea: PrintArea;
  svgTemplate: string; // Key to SVG renderer
  description: string;
}

export interface ProductSpecs {
  material: string;
  weightGsm?: number;
  recommendedPrintMethod: 'DTG' | 'Screenprint' | 'Embroidery' | 'Sublimation' | 'UV Print';
  standardPrintDimensions: string;
  suggestedMarginFromCollar?: string;
  targetResolutionDpi: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  badge?: string;
  description: string;
  baseColor: string;
  availableColors: ProductColor[];
  views: ProductView[];
  specs: ProductSpecs;
}

export interface LogoConfig {
  dataUrl: string;
  name: string;
  originalWidth: number;
  originalHeight: number;
  scale: number; // 0.1 to 2.0
  rotation: number; // -180 to 180 deg
  offsetX: number; // -50 to 50 %
  offsetY: number; // -50 to 50 %
  opacity: number; // 0.1 to 1.0
  blendMode: 'multiply' | 'normal' | 'screen' | 'overlay';
  invertColor: boolean; // turn dark logo white
  isEmbroidery: boolean; // simulated 3D thread relief
  isDistressed: boolean; // vintage cracked screenprint texture
  removeWhiteBg: boolean; // chroma-key white removal
  tintColor?: string; // Optional single-color ink override
  fabricDisplacement: number; // 0 to 1: warp logo according to fabric fold ripples
  fabricKnitTexture: number; // 0 to 1: cotton/fleece knit texture bump mapped through ink
  lightingSpecular: number; // 0 to 1: lighting highlights hitting folds reflect on ink
  edgeSoftness: number; // 0 to 2: natural ink fiber bleed instead of razor-sharp digital edge
  ambientBounce: boolean; // subtle garment color reflection onto graphic
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface TrendTopic {
  title: string;
  category: string;
  summary: string;
  recommendedColorHex: string;
  recommendedColorName: string;
  recommendedPlacement: 'center' | 'left-pocket' | 'large-front' | 'collar';
  recommendedScale: number;
  printMethodRecommendation: string;
  sources: GroundingSource[];
}

export interface AiGeneratedScene {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  productType: string;
  productName: string;
  isAiCreated: boolean;
}

export interface ExportSettings {
  dpi: 150 | 300 | 600;
  format: 'png' | 'pdf' | 'svg';
  includeBleed: boolean;
  includeCropMarks: boolean;
  includeDimensionsGuide: boolean;
  colorProfile: 'sRGB' | 'CMYK_Simulated';
}
