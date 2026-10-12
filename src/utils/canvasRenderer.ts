import { Product, ProductView, LogoConfig, ExportSettings } from '../types/merch';

// Utility to load an HTMLImageElement from a URL or data URL
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Convert hex to RGB components
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate relative luminance of a color
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Pre-process logo image for inversion, background removal, or tinting
export function processLogoImage(
  sourceImg: HTMLImageElement,
  config: LogoConfig
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImg.naturalWidth || sourceImg.width || 500;
  canvas.height = sourceImg.naturalHeight || sourceImg.height || 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

  if (!config.invertColor && !config.removeWhiteBg && !config.tintColor) {
    return canvas;
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // Background removal: if pixel is near white/light-gray and option is enabled
    if (config.removeWhiteBg) {
      if (r > 235 && g > 235 && b > 235) {
        data[i + 3] = 0;
        continue;
      } else if (r > 200 && g > 200 && b > 200) {
        const factor = (255 - Math.max(r, g, b)) / 55;
        data[i + 3] = Math.floor(a * factor);
      }
    }

    // Invert color (e.g. black logo to pure white for dark shirts)
    if (config.invertColor) {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    }

    // Single-color ink tint override
    if (config.tintColor) {
      const tint = hexToRgb(config.tintColor);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      data[i] = Math.floor(tint.r * lum);
      data[i + 1] = Math.floor(tint.g * lum);
      data[i + 2] = Math.floor(tint.b * lum);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// Draw realistic product silhouettes and fabric shading
function drawProductBase(
  ctx: CanvasRenderingContext2D,
  view: ProductView,
  garmentHex: string,
  width: number,
  height: number
) {
  const isDark = getLuminance(garmentHex) < 0.45;

  // Background subtle gradient
  const bgGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    width * 0.1,
    width * 0.5,
    height * 0.5,
    width * 0.75
  );
  bgGrad.addColorStop(0, '#1a1e29');
  bgGrad.addColorStop(1, '#0b0f19');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft studio pedestal / floor shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.88, width * 0.38, height * 0.06, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.filter = 'blur(20px)';
  ctx.fill();
  ctx.restore();

  // Draw specific product template
  switch (view.svgTemplate) {
    case 'tee-front':
    case 'tee-back':
      drawTShirt(ctx, garmentHex, width, height, view.svgTemplate === 'tee-back');
      break;
    case 'hoodie-front':
    case 'hoodie-back':
      drawHoodie(ctx, garmentHex, width, height, view.svgTemplate === 'hoodie-back');
      break;
    case 'tote-front':
      drawToteBag(ctx, garmentHex, width, height);
      break;
    case 'mug-front':
      drawCeramicMug(ctx, garmentHex, width, height);
      break;
    case 'cap-front':
      drawBaseballCap(ctx, garmentHex, width, height);
      break;
    case 'tumbler-front':
      drawTumbler(ctx, garmentHex, width, height);
      break;
    case 'frame-front':
      drawFramedPrint(ctx, garmentHex, width, height);
      break;
    case 'sticker-front':
      drawDieCutSticker(ctx, garmentHex, width, height);
      break;
    default:
      drawTShirt(ctx, garmentHex, width, height, false);
      break;
  }
}

// 1. T-Shirt drawing function
function drawTShirt(
  ctx: CanvasRenderingContext2D,
  color: string,
  w: number,
  h: number,
  isBack: boolean
) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Garment Path
  ctx.beginPath();
  ctx.moveTo(370 * sx, 130 * sy); // Collar left
  // Neck curve
  if (!isBack) {
    ctx.quadraticCurveTo(500 * sx, 205 * sy, 630 * sx, 130 * sy); // front scoop
  } else {
    ctx.quadraticCurveTo(500 * sx, 160 * sy, 630 * sx, 130 * sy); // back higher neck
  }
  ctx.lineTo(820 * sx, 220 * sy); // Right shoulder
  ctx.quadraticCurveTo(870 * sx, 340 * sy, 840 * sx, 380 * sy); // Right sleeve outer
  ctx.lineTo(730 * sx, 360 * sy); // Sleeve cuff
  ctx.quadraticCurveTo(720 * sx, 330 * sy, 700 * sx, 340 * sy); // Armpit
  ctx.quadraticCurveTo(710 * sx, 550 * sy, 725 * sx, 840 * sy); // Right side body
  ctx.quadraticCurveTo(500 * sx, 855 * sy, 275 * sx, 840 * sy); // Bottom hem
  ctx.quadraticCurveTo(290 * sx, 550 * sy, 300 * sx, 340 * sy); // Left side body
  ctx.quadraticCurveTo(280 * sx, 330 * sy, 270 * sx, 360 * sy); // Left armpit
  ctx.lineTo(160 * sx, 380 * sy); // Left sleeve outer
  ctx.quadraticCurveTo(130 * sx, 340 * sy, 180 * sx, 220 * sy); // Left shoulder
  ctx.closePath();

  // Fill base color
  ctx.fillStyle = color;
  ctx.fill();

  // Subtle fabric texture / shading overlay
  const shadeGrad = ctx.createLinearGradient(200 * sx, 150 * sy, 800 * sx, 850 * sy);
  shadeGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  shadeGrad.addColorStop(0.3, 'rgba(255,255,255,0.02)');
  shadeGrad.addColorStop(0.7, 'rgba(0,0,0,0.12)');
  shadeGrad.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = shadeGrad;
  ctx.fill();

  // Creases & fabric ripple lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 3 * sx;
  ctx.beginPath();
  // Left arm fold
  ctx.moveTo(310 * sx, 350 * sy);
  ctx.quadraticCurveTo(340 * sx, 420 * sy, 330 * sx, 490 * sy);
  // Right arm fold
  ctx.moveTo(690 * sx, 350 * sy);
  ctx.quadraticCurveTo(660 * sx, 420 * sy, 670 * sx, 490 * sy);
  // Body vertical wave
  ctx.moveTo(330 * sx, 560 * sy);
  ctx.quadraticCurveTo(360 * sx, 680 * sy, 345 * sx, 820 * sy);
  ctx.moveTo(670 * sx, 560 * sy);
  ctx.quadraticCurveTo(640 * sx, 680 * sy, 655 * sx, 820 * sy);
  ctx.stroke();

  // Collar Ribbing
  ctx.beginPath();
  if (!isBack) {
    ctx.moveTo(370 * sx, 130 * sy);
    ctx.quadraticCurveTo(500 * sx, 205 * sy, 630 * sx, 130 * sy);
    ctx.quadraticCurveTo(500 * sx, 225 * sy, 370 * sx, 130 * sy);
  } else {
    ctx.moveTo(370 * sx, 130 * sy);
    ctx.quadraticCurveTo(500 * sx, 160 * sy, 630 * sx, 130 * sy);
    ctx.quadraticCurveTo(500 * sx, 175 * sy, 370 * sx, 130 * sy);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2 * sx;
  ctx.stroke();

  // Inside neck collar backing (front view only)
  if (!isBack) {
    ctx.beginPath();
    ctx.moveTo(370 * sx, 130 * sy);
    ctx.quadraticCurveTo(500 * sx, 160 * sy, 630 * sx, 130 * sy);
    ctx.quadraticCurveTo(500 * sx, 205 * sy, 370 * sx, 130 * sy);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    // Woven collar size tag
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(485 * sx, 155 * sy, 30 * sx, 20 * sy);
    ctx.fillStyle = '#18181b';
    ctx.font = `${8 * sx}px 'JetBrains Mono', monospace`;
    ctx.fillText('M', 497 * sx, 169 * sy);
  }

  // Double stitch hems on sleeves and bottom
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.setLineDash([4 * sx, 3 * sx]);
  ctx.beginPath();
  ctx.moveTo(275 * sx, 825 * sy);
  ctx.quadraticCurveTo(500 * sx, 840 * sy, 725 * sx, 825 * sy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// 2. Hoodie drawing function
function drawHoodie(
  ctx: CanvasRenderingContext2D,
  color: string,
  w: number,
  h: number,
  isBack: boolean
) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Draw Hood back
  ctx.beginPath();
  ctx.moveTo(350 * sx, 160 * sy);
  ctx.quadraticCurveTo(500 * sx, 60 * sy, 650 * sx, 160 * sy);
  ctx.quadraticCurveTo(500 * sx, 130 * sy, 350 * sx, 160 * sy);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  // Body Path
  ctx.beginPath();
  ctx.moveTo(340 * sx, 160 * sy);
  ctx.quadraticCurveTo(500 * sx, 210 * sy, 660 * sx, 160 * sy);
  ctx.lineTo(840 * sx, 240 * sy);
  ctx.quadraticCurveTo(890 * sx, 380 * sy, 830 * sx, 460 * sy); // Sleeve outer
  ctx.lineTo(760 * sx, 430 * sy); // Ribbed cuff
  ctx.quadraticCurveTo(720 * sx, 370 * sy, 700 * sx, 380 * sy);
  ctx.quadraticCurveTo(710 * sx, 600 * sy, 720 * sx, 820 * sy); // Right torso
  ctx.quadraticCurveTo(500 * sx, 835 * sy, 280 * sx, 820 * sy); // Bottom waistband
  ctx.quadraticCurveTo(290 * sx, 600 * sy, 300 * sx, 380 * sy);
  ctx.quadraticCurveTo(280 * sx, 370 * sy, 240 * sx, 430 * sy);
  ctx.lineTo(170 * sx, 460 * sy);
  ctx.quadraticCurveTo(110 * sx, 380 * sy, 160 * sx, 240 * sy);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  // Fabric shading
  const shade = ctx.createLinearGradient(200 * sx, 100 * sy, 800 * sx, 800 * sy);
  shade.addColorStop(0, 'rgba(255,255,255,0.06)');
  shade.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = shade;
  ctx.fill();

  // Draw Hood collar front
  ctx.beginPath();
  ctx.moveTo(350 * sx, 160 * sy);
  ctx.quadraticCurveTo(500 * sx, 240 * sy, 650 * sx, 160 * sy);
  ctx.quadraticCurveTo(500 * sx, 170 * sy, 350 * sx, 160 * sy);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // Draw Kangaroo pocket (front only)
  if (!isBack) {
    ctx.beginPath();
    ctx.moveTo(370 * sx, 560 * sy);
    ctx.lineTo(630 * sx, 560 * sy);
    ctx.quadraticCurveTo(670 * sx, 640 * sy, 690 * sx, 760 * sy);
    ctx.lineTo(310 * sx, 760 * sy);
    ctx.quadraticCurveTo(330 * sx, 640 * sy, 370 * sx, 560 * sy);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2 * sx;
    ctx.stroke();

    // Drawstrings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4 * sx;
    ctx.beginPath();
    ctx.moveTo(460 * sx, 220 * sy);
    ctx.quadraticCurveTo(450 * sx, 290 * sy, 455 * sx, 350 * sy);
    ctx.moveTo(540 * sx, 220 * sy);
    ctx.quadraticCurveTo(550 * sx, 290 * sy, 545 * sx, 350 * sy);
    ctx.stroke();

    // Metal drawstring aglets
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(452 * sx, 345 * sy, 6 * sx, 12 * sy);
    ctx.fillRect(542 * sx, 345 * sy, 6 * sx, 12 * sy);
  }

  // Thick ribbed waistband
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(280 * sx, 770 * sy, 440 * sx, 50 * sy);

  ctx.restore();
}

// 3. Canvas Tote Bag
function drawToteBag(ctx: CanvasRenderingContext2D, color: string, w: number, h: number) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Handles
  ctx.beginPath();
  ctx.moveTo(380 * sx, 420 * sy);
  ctx.quadraticCurveTo(380 * sx, 130 * sy, 500 * sx, 130 * sy);
  ctx.quadraticCurveTo(620 * sx, 130 * sy, 620 * sx, 420 * sy);
  ctx.lineTo(590 * sx, 420 * sy);
  ctx.quadraticCurveTo(590 * sx, 165 * sy, 500 * sx, 165 * sy);
  ctx.quadraticCurveTo(410 * sx, 165 * sy, 410 * sx, 420 * sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();

  // Tote Main Body
  ctx.beginPath();
  ctx.moveTo(270 * sx, 400 * sy);
  ctx.quadraticCurveTo(500 * sx, 405 * sy, 730 * sx, 400 * sy);
  ctx.quadraticCurveTo(745 * sx, 640 * sy, 720 * sx, 850 * sy);
  ctx.quadraticCurveTo(500 * sx, 860 * sy, 280 * sx, 850 * sy);
  ctx.quadraticCurveTo(255 * sx, 640 * sy, 270 * sx, 400 * sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Natural canvas weave shading
  const shade = ctx.createLinearGradient(250 * sx, 400 * sy, 750 * sx, 850 * sy);
  shade.addColorStop(0, 'rgba(255,255,255,0.08)');
  shade.addColorStop(0.5, 'rgba(0,0,0,0.02)');
  shade.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = shade;
  ctx.fill();

  // Top hem fold & handle box stitching
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(270 * sx, 400 * sy, 460 * sx, 25 * sy);

  // Handle cross stitch boxes
  drawStitchBox(ctx, 380 * sx, 405 * sy, 30 * sx, 25 * sy);
  drawStitchBox(ctx, 590 * sx, 405 * sy, 30 * sx, 25 * sy);

  ctx.restore();
}

function drawStitchBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
}

// 4. Ceramic Coffee Mug
function drawCeramicMug(ctx: CanvasRenderingContext2D, color: string, w: number, h: number) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Handle (behind or side)
  ctx.beginPath();
  ctx.moveTo(630 * sx, 380 * sy);
  ctx.quadraticCurveTo(800 * sx, 380 * sy, 790 * sx, 520 * sy);
  ctx.quadraticCurveTo(775 * sx, 650 * sy, 630 * sx, 640 * sy);
  ctx.lineWidth = 42 * sx;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = 42 * sx;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.stroke();

  // Mug Body
  ctx.beginPath();
  ctx.ellipse(450 * sx, 350 * sy, 190 * sx, 32 * sy, 0, 0, Math.PI * 2); // Rim top
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();

  // Mug Cylinder
  ctx.beginPath();
  ctx.ellipse(450 * sx, 350 * sy, 190 * sx, 32 * sy, 0, Math.PI, 0); // Top rim front
  ctx.lineTo(640 * sx, 720 * sy); // Right wall
  ctx.ellipse(450 * sx, 720 * sy, 190 * sx, 32 * sy, 0, 0, Math.PI); // Bottom round
  ctx.lineTo(260 * sx, 350 * sy); // Left wall
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Glossy ceramic highlight gradient
  const gloss = ctx.createLinearGradient(260 * sx, 0, 640 * sx, 0);
  gloss.addColorStop(0, 'rgba(0,0,0,0.3)');
  gloss.addColorStop(0.15, 'rgba(255,255,255,0.45)'); // sharp specular glare
  gloss.addColorStop(0.35, 'rgba(255,255,255,0.05)');
  gloss.addColorStop(0.8, 'rgba(0,0,0,0.05)');
  gloss.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = gloss;
  ctx.fill();

  // Rim inner shadow
  ctx.beginPath();
  ctx.ellipse(450 * sx, 350 * sy, 175 * sx, 25 * sy, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  ctx.restore();
}

// 5. Baseball Cap
function drawBaseballCap(ctx: CanvasRenderingContext2D, color: string, w: number, h: number) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Crown Dome
  ctx.beginPath();
  ctx.moveTo(270 * sx, 520 * sy);
  ctx.quadraticCurveTo(310 * sx, 220 * sy, 500 * sx, 210 * sy);
  ctx.quadraticCurveTo(690 * sx, 220 * sy, 730 * sx, 520 * sy);
  ctx.quadraticCurveTo(500 * sx, 545 * sy, 270 * sx, 520 * sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Panel Seams
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2 * sx;
  ctx.beginPath();
  ctx.moveTo(500 * sx, 210 * sy);
  ctx.quadraticCurveTo(500 * sx, 370 * sy, 500 * sx, 535 * sy); // Center front seam
  ctx.moveTo(500 * sx, 210 * sy);
  ctx.quadraticCurveTo(380 * sx, 330 * sy, 350 * sx, 525 * sy); // Left seam
  ctx.moveTo(500 * sx, 210 * sy);
  ctx.quadraticCurveTo(620 * sx, 330 * sy, 650 * sx, 525 * sy); // Right seam
  ctx.stroke();

  // Top button
  ctx.beginPath();
  ctx.arc(500 * sx, 210 * sy, 14 * sx, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  // Curved Visor / Bill
  ctx.beginPath();
  ctx.moveTo(240 * sx, 525 * sy);
  ctx.quadraticCurveTo(500 * sx, 555 * sy, 760 * sx, 525 * sy);
  ctx.quadraticCurveTo(800 * sx, 640 * sy, 500 * sx, 650 * sy);
  ctx.quadraticCurveTo(200 * sx, 640 * sy, 240 * sx, 525 * sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Visor shading
  const visorShade = ctx.createLinearGradient(0, 520 * sy, 0, 650 * sy);
  visorShade.addColorStop(0, 'rgba(0,0,0,0.25)');
  visorShade.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = visorShade;
  ctx.fill();

  // Visor stitch lines
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5 * sx;
  ctx.beginPath();
  ctx.arc(500 * sx, 540 * sy, 85 * sx, 0.2, Math.PI - 0.2);
  ctx.arc(500 * sx, 540 * sy, 100 * sx, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.restore();
}

// 6. Stainless Steel Tumbler
function drawTumbler(ctx: CanvasRenderingContext2D, color: string, w: number, h: number) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Cap / Lid
  ctx.fillStyle = '#334155';
  ctx.fillRect(400 * sx, 160 * sy, 200 * sx, 60 * sy);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(430 * sx, 140 * sy, 140 * sx, 20 * sy);

  // Tumbler Body
  ctx.beginPath();
  ctx.moveTo(370 * sx, 220 * sy);
  ctx.lineTo(630 * sx, 220 * sy);
  ctx.lineTo(605 * sx, 820 * sy);
  ctx.quadraticCurveTo(500 * sx, 835 * sy, 395 * sx, 820 * sy);
  ctx.lineTo(370 * sx, 220 * sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Brushed metallic highlight gradient
  const metal = ctx.createLinearGradient(370 * sx, 0, 630 * sx, 0);
  metal.addColorStop(0, 'rgba(0,0,0,0.35)');
  metal.addColorStop(0.2, 'rgba(255,255,255,0.4)'); // sleek metal reflection
  metal.addColorStop(0.4, 'rgba(255,255,255,0.05)');
  metal.addColorStop(0.8, 'rgba(0,0,0,0.1)');
  metal.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = metal;
  ctx.fill();

  // Silver base ring
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(400 * sx, 800 * sy, 200 * sx, 20 * sy);

  ctx.restore();
}

// 7. Framed Wall Print
function drawFramedPrint(ctx: CanvasRenderingContext2D, frameColor: string, w: number, h: number) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Wall drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.filter = 'blur(16px)';
  ctx.fillRect(200 * sx, 140 * sy, 600 * sx, 740 * sy);
  ctx.filter = 'none';

  // Wooden Frame
  ctx.fillStyle = frameColor;
  ctx.fillRect(190 * sx, 130 * sy, 620 * sx, 740 * sy);

  // Acid-free Mat Board (white passe-partout)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(220 * sx, 160 * sy, 560 * sx, 680 * sy);

  // Bevel cut inner mat shadow
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 3 * sx;
  ctx.strokeRect(240 * sx, 180 * sy, 520 * sx, 640 * sy);

  ctx.restore();
}

// 8. Die Cut Sticker
function drawDieCutSticker(ctx: CanvasRenderingContext2D, _color: string, w: number, h: number) {
  ctx.save();
  const sx = w / 1000;
  const sy = h / 1000;

  // Sticker shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.filter = 'blur(12px)';
  ctx.beginPath();
  ctx.arc(500 * sx, 510 * sy, 220 * sx, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';

  // White vinyl contour boundary
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(500 * sx, 500 * sy, 220 * sx, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw the logo onto the designated print area with accurate scale, rotation, warping, and blending
function drawLogoOnPrintArea(
  ctx: CanvasRenderingContext2D,
  view: ProductView,
  processedLogoCanvas: HTMLCanvasElement,
  config: LogoConfig,
  w: number,
  h: number,
  garmentHex: string = '#18181b'
) {
  ctx.save();
  const print = view.printArea;

  // Calculate target print box center & max dimensions
  const centerX = (print.x / 100) * w + (config.offsetX / 100) * w;
  const centerY = (print.y / 100) * h + (config.offsetY / 100) * h;
  const maxW = (print.width / 100) * w * config.scale;
  const maxH = (print.height / 100) * h * config.scale;

  // Aspect ratio preservation
  const logoAspect = processedLogoCanvas.width / processedLogoCanvas.height;
  let drawW = maxW;
  let drawH = maxW / logoAspect;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = maxH * logoAspect;
  }

  ctx.translate(centerX, centerY);
  ctx.rotate((config.rotation * Math.PI) / 180);
  ctx.globalAlpha = config.opacity;

  // Apply blend mode
  if (config.blendMode === 'multiply') {
    ctx.globalCompositeOperation = 'multiply';
  } else if (config.blendMode === 'screen') {
    ctx.globalCompositeOperation = 'screen';
  } else if (config.blendMode === 'overlay') {
    ctx.globalCompositeOperation = 'overlay';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  // Cylindrical wrap for Mugs and Tumblers!
  if (print.warpType === 'cylinder') {
    drawCylinderWarpedImage(ctx, processedLogoCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    // 1. Organic Ink Edge Softening (simulates ink fiber bleed into cotton)
    if (config.edgeSoftness && config.edgeSoftness > 0) {
      ctx.filter = `blur(${config.edgeSoftness * (w / 1000)}px)`;
    }

    // 2. Realistic Fabric Ripple Conformal Displacement
    const displacementFactor = (config.fabricDisplacement ?? 0.6) * (print.displacementFactor ?? 0.12);
    if (displacementFactor > 0.02) {
      // Draw displaced vertical strips across fabric ripples
      const slices = 35;
      const sliceW = drawW / slices;
      const srcSliceW = processedLogoCanvas.width / slices;
      const startX = -drawW / 2;
      const startY = -drawH / 2;

      for (let i = 0; i < slices; i++) {
        const norm = (i / slices) * Math.PI * 3.5;
        // Ripple displacement curve matching natural fabric drape
        const rippleX = Math.sin(norm) * (drawW * displacementFactor * 0.15);
        const rippleY = Math.cos(norm) * (drawH * displacementFactor * 0.2);

        ctx.drawImage(
          processedLogoCanvas,
          i * srcSliceW,
          0,
          srcSliceW,
          processedLogoCanvas.height,
          startX + i * sliceW + rippleX,
          startY + rippleY,
          sliceW,
          drawH
        );
      }
    } else {
      // Direct draw
      ctx.drawImage(processedLogoCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
    }

    // Reset filter
    ctx.filter = 'none';

    // 3. Simulated 3D Embroidery Thread Grain
    if (config.isEmbroidery) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      // Thread stitch lines
      ctx.beginPath();
      for (let s = -drawH / 2; s < drawH / 2; s += 6) {
        ctx.moveTo(-drawW / 2, s);
        ctx.lineTo(drawW / 2, s);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Microscopic Cotton Weave & Knit Texture Bump Overlay
    const knitIntensity = config.fabricKnitTexture ?? 0.5;
    if (knitIntensity > 0.1) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      const knitCanvas = document.createElement('canvas');
      knitCanvas.width = 16;
      knitCanvas.height = 16;
      const kctx = knitCanvas.getContext('2d');
      if (kctx) {
        kctx.fillStyle = 'rgba(255,255,255,0.06)';
        kctx.fillRect(0, 0, 8, 8);
        kctx.fillRect(8, 8, 8, 8);
        kctx.fillStyle = 'rgba(0,0,0,0.08)';
        kctx.fillRect(8, 0, 8, 8);
        kctx.fillRect(0, 8, 8, 8);
        const knitPattern = ctx.createPattern(knitCanvas, 'repeat');
        if (knitPattern) {
          ctx.fillStyle = knitPattern;
          ctx.globalAlpha = knitIntensity * 0.45;
          ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        }
      }
      ctx.restore();
    }

    // 5. Lighting Specular & Deep Crease Shadow Multipliers
    const specular = config.lightingSpecular ?? 0.4;
    if (specular > 0.1) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const foldShade = ctx.createLinearGradient(-drawW / 2, -drawH / 2, drawW / 2, drawH / 2);
      foldShade.addColorStop(0, `rgba(255,255,255,${0.25 * specular})`);
      foldShade.addColorStop(0.3, 'rgba(0,0,0,0.05)');
      foldShade.addColorStop(0.7, `rgba(0,0,0,${0.35 * specular})`);
      foldShade.addColorStop(1, `rgba(255,255,255,${0.18 * specular})`);
      ctx.fillStyle = foldShade;
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 6. Ambient Garment Color Bounce
    if (config.ambientBounce) {
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = garmentHex;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 7. Vintage distressed screenprint texture
    if (config.isDistressed) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let i = 0; i < 55; i++) {
        const speckX = -drawW / 2 + Math.random() * drawW;
        const speckY = -drawH / 2 + Math.random() * drawH;
        const radius = 1 + Math.random() * 3.5;
        ctx.beginPath();
        ctx.arc(speckX, speckY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// Horizontal cylindrical warp projection for ceramic mugs & bottles
function drawCylinderWarpedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const slices = 40;
  const sliceW = w / slices;
  const srcSliceW = img.width / slices;

  for (let i = 0; i < slices; i++) {
    // Normalized position from -1 (left edge) to 1 (right edge)
    const normX = ((i + 0.5) / slices) * 2 - 1;
    // Cylindrical compression factor (cosine)
    const factor = Math.cos((normX * Math.PI) / 2.6);
    // Vertical perspective bow
    const yShift = (1 - factor) * (h * 0.08);

    const targetX = x + i * sliceW;
    const targetY = y + yShift;
    const targetH = h - yShift * 2;

    ctx.drawImage(
      img,
      i * srcSliceW,
      0,
      srcSliceW,
      img.height,
      targetX,
      targetY,
      sliceW,
      targetH
    );
  }

  // Cylindrical shading overlay
  const shadeGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  shadeGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
  shadeGrad.addColorStop(0.2, 'rgba(255,255,255,0.25)');
  shadeGrad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
  shadeGrad.addColorStop(0.85, 'rgba(0,0,0,0.15)');
  shadeGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = shadeGrad;
  ctx.fillRect(x, y, w, h);
}

// Master preview canvas render
export function renderPreviewCanvas(
  canvas: HTMLCanvasElement,
  product: Product,
  view: ProductView,
  garmentHex: string,
  logoImg: HTMLImageElement | null,
  logoConfig: LogoConfig
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // 1. Draw realistic product silhouette, folds, and highlights
  drawProductBase(ctx, view, garmentHex, w, h);

  // 2. Draw user logo / graphic with advanced realism integration
  if (logoImg) {
    const processed = processLogoImage(logoImg, logoConfig);
    drawLogoOnPrintArea(ctx, view, processed, logoConfig, w, h, garmentHex);
  }
}


// Export high resolution 2000x2000 mockup for e-commerce stores (Shopify, Etsy)
export async function exportHighResMockup(
  product: Product,
  view: ProductView,
  garmentHex: string,
  logoImg: HTMLImageElement | null,
  logoConfig: LogoConfig,
  resolution = 2000
): Promise<string> {
  const offscreen = document.createElement('canvas');
  offscreen.width = resolution;
  offscreen.height = resolution;

  renderPreviewCanvas(offscreen, product, view, garmentHex, logoImg, logoConfig);
  return offscreen.toDataURL('image/png', 1.0);
}

// Export true 300 DPI print-ready production file for apparel decorators / screen printers
export function exportPrintReadyGraphic(
  product: Product,
  view: ProductView,
  logoImg: HTMLImageElement,
  logoConfig: LogoConfig,
  settings: ExportSettings
): string {
  const print = view.printArea;
  const dpi = settings.dpi || 300;
  const bleedInches = settings.includeBleed ? 0.125 : 0.0;

  const totalWidthInches = print.maxPrintWidthInches + bleedInches * 2;
  const totalHeightInches = print.maxPrintHeightInches + bleedInches * 2;

  const pixelWidth = Math.round(totalWidthInches * dpi);
  const pixelHeight = Math.round(totalHeightInches * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Transparent master background
  ctx.clearRect(0, 0, pixelWidth, pixelHeight);

  // Bleed guide margin in pixels
  const bleedPx = Math.round(bleedInches * dpi);
  const printableW = pixelWidth - bleedPx * 2;
  const printableH = pixelHeight - bleedPx * 2;

  // Process logo
  const processed = processLogoImage(logoImg, logoConfig);

  // Fit logo inside printable boundary according to logoConfig.scale
  const logoAspect = processed.width / processed.height;
  let targetW = printableW * (logoConfig.scale > 1.2 ? 1.0 : logoConfig.scale);
  let targetH = targetW / logoAspect;
  if (targetH > printableH) {
    targetH = printableH;
    targetW = printableH * logoAspect;
  }

  const posX = bleedPx + (printableW - targetW) / 2;
  const posY = bleedPx + (printableH - targetH) / 2;

  ctx.save();
  ctx.translate(posX + targetW / 2, posY + targetH / 2);
  ctx.rotate((logoConfig.rotation * Math.PI) / 180);
  ctx.drawImage(processed, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();

  // Draw crop marks / crosshairs if requested
  if (settings.includeCropMarks) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(dpi / 150));
    const markLength = Math.round(0.25 * dpi);

    // Top-left
    ctx.beginPath();
    ctx.moveTo(bleedPx, 0);
    ctx.lineTo(bleedPx, markLength);
    ctx.moveTo(0, bleedPx);
    ctx.lineTo(markLength, bleedPx);
    // Top-right
    ctx.moveTo(pixelWidth - bleedPx, 0);
    ctx.lineTo(pixelWidth - bleedPx, markLength);
    ctx.moveTo(pixelWidth, bleedPx);
    ctx.lineTo(pixelWidth - markLength, bleedPx);
    // Bottom-left
    ctx.moveTo(bleedPx, pixelHeight);
    ctx.lineTo(bleedPx, pixelHeight - markLength);
    ctx.moveTo(0, pixelHeight - bleedPx);
    ctx.lineTo(markLength, pixelHeight - bleedPx);
    // Bottom-right
    ctx.moveTo(pixelWidth - bleedPx, pixelHeight);
    ctx.lineTo(pixelWidth - bleedPx, pixelHeight - markLength);
    ctx.moveTo(pixelWidth, pixelHeight - bleedPx);
    ctx.lineTo(pixelWidth - markLength, pixelHeight - bleedPx);
    ctx.stroke();
  }

  // Print info header overlay if dimensions guide is checked
  if (settings.includeDimensionsGuide) {
    ctx.fillStyle = '#090d16';
    ctx.font = `600 ${Math.round(dpi / 18)}px 'JetBrains Mono', monospace`;
    ctx.fillText(
      `PRODUCT: ${product.name.toUpperCase()} | PRINT METHOD: ${product.specs.recommendedPrintMethod} | SIZE: ${print.maxPrintWidthInches}" × ${print.maxPrintHeightInches}" | ${dpi} DPI MASTER`,
      bleedPx + 20,
      pixelHeight - bleedPx - 20
    );
  }

  return canvas.toDataURL('image/png', 1.0);
}

export interface LifestyleSceneParams {
  style?: 'neon_cyberpunk' | 'studio_cyclorama' | 'concrete_gallery' | 'sunlit_terrace' | 'cozy_cafe' | 'sunset_beach';
  keyLightColor?: string;
  ambientColor?: string;
  lightingMood?: string;
  photographerNotes?: string;
}

// Render commercial lifestyle photoshoot scenes with realistic backgrounds and lighting
export function renderLifestyleScene(
  product: Product,
  view: ProductView,
  garmentHex: string,
  logoImg: HTMLImageElement | null,
  logoConfig: LogoConfig,
  params: LifestyleSceneParams = {},
  resolution = 1200
): string {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = resolution;
  const h = resolution;
  const style = params.style || 'studio_cyclorama';

  // 1. Draw Environment Backdrop
  switch (style) {
    case 'neon_cyberpunk': {
      // Dark moody night street
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#050508');
      bg.addColorStop(0.5, '#0d0f18');
      bg.addColorStop(1, '#08080f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Blurred Neon Glow Bars in background
      ctx.save();
      ctx.filter = 'blur(60px)';
      // Magenta neon light
      ctx.fillStyle = 'rgba(236, 72, 153, 0.45)';
      ctx.fillRect(w * 0.08, h * 0.1, w * 0.15, h * 0.7);
      // Cyan neon light
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fillRect(w * 0.78, h * 0.15, w * 0.18, h * 0.65);
      // Violet ambient
      ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.fillRect(w * 0.35, h * 0.05, w * 0.3, h * 0.5);
      ctx.restore();

      // Wet pavement reflection floor
      const wetFloor = ctx.createLinearGradient(0, h * 0.7, 0, h);
      wetFloor.addColorStop(0, 'rgba(10, 15, 25, 0.9)');
      wetFloor.addColorStop(1, 'rgba(5, 5, 10, 0.98)');
      ctx.fillStyle = wetFloor;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      // Floor puddle specular streaks
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(w * 0.6, h * 0.78, w * 0.25, 4);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
      ctx.fillRect(w * 0.15, h * 0.82, w * 0.3, 4);
      break;
    }

    case 'concrete_gallery': {
      // Brutalist concrete gallery wall
      const wall = ctx.createLinearGradient(0, 0, w, h);
      wall.addColorStop(0, '#2e3138');
      wall.addColorStop(0.5, '#22252a');
      wall.addColorStop(1, '#181a1f');
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, w, h);

      // Raw architectural concrete texture speckles
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 3, Math.random() * 3);
      }

      // Strong diagonal sunlight window beam
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w * 0.1, 0);
      ctx.lineTo(w * 0.75, 0);
      ctx.lineTo(w, h * 0.6);
      ctx.lineTo(w * 0.45, h);
      ctx.closePath();
      const sunBeam = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, h);
      sunBeam.addColorStop(0, 'rgba(255, 250, 235, 0.22)');
      sunBeam.addColorStop(1, 'rgba(255, 240, 210, 0.0)');
      ctx.fillStyle = sunBeam;
      ctx.fill();
      ctx.restore();

      // Concrete floor pedestal
      ctx.fillStyle = '#1c1e24';
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.82);
      ctx.lineTo(w, h * 0.82);
      ctx.stroke();
      break;
    }

    case 'sunlit_terrace': {
      // Warm Mediterranean golden hour sunlit wall
      const sun = ctx.createRadialGradient(w * 0.85, h * 0.15, w * 0.05, w * 0.85, h * 0.15, w * 0.9);
      sun.addColorStop(0, '#fef3c7');
      sun.addColorStop(0.3, '#fed7aa');
      sun.addColorStop(0.7, '#ea580c');
      sun.addColorStop(1, '#7c2d12');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      // Palm leaf shadow silhouette overlay
      ctx.save();
      ctx.fillStyle = 'rgba(60, 20, 10, 0.35)';
      ctx.filter = 'blur(14px)';
      ctx.beginPath();
      ctx.ellipse(w * 0.15, h * 0.2, w * 0.35, h * 0.1, -0.6, 0, Math.PI * 2);
      ctx.ellipse(w * 0.05, h * 0.35, w * 0.4, h * 0.08, -0.4, 0, Math.PI * 2);
      ctx.ellipse(w * 0.1, h * 0.5, w * 0.35, h * 0.09, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sun flare optical glow
      const flare = ctx.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.85, h * 0.15, w * 0.4);
      flare.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      flare.addColorStop(0.4, 'rgba(254, 215, 170, 0.25)');
      flare.addColorStop(1, 'rgba(254, 215, 170, 0)');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'cozy_cafe': {
      // Artisan coffee shop background
      const cafe = ctx.createLinearGradient(0, 0, w, h);
      cafe.addColorStop(0, '#1c130d');
      cafe.addColorStop(0.5, '#2e1c12');
      cafe.addColorStop(1, '#180f0a');
      ctx.fillStyle = cafe;
      ctx.fillRect(0, 0, w, h);

      // Warm bokeh circles in background
      ctx.save();
      ctx.filter = 'blur(20px)';
      const bokehColors = ['rgba(251, 191, 36, 0.28)', 'rgba(245, 158, 11, 0.22)', 'rgba(217, 119, 6, 0.3)'];
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = bokehColors[i % bokehColors.length];
        ctx.beginPath();
        ctx.arc(w * 0.15 + (i * w * 0.1), h * 0.15 + ((i % 3) * h * 0.1), 35 + (i * 8), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Walnut timber counter tabletop
      const wood = ctx.createLinearGradient(0, h * 0.78, 0, h);
      wood.addColorStop(0, '#452b1e');
      wood.addColorStop(1, '#2c180e');
      ctx.fillStyle = wood;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      break;
    }

    case 'studio_cyclorama':
    default: {
      // High-end minimalist studio infinity cove cyclorama
      const studio = ctx.createRadialGradient(w * 0.5, h * 0.35, w * 0.05, w * 0.5, h * 0.45, w * 0.8);
      studio.addColorStop(0, '#2d3342');
      studio.addColorStop(0.4, '#1b202c');
      studio.addColorStop(0.85, '#0d1017');
      studio.addColorStop(1, '#07090e');
      ctx.fillStyle = studio;
      ctx.fillRect(0, 0, w, h);

      // Studio softbox overhead reflection arc
      const overhead = ctx.createLinearGradient(w * 0.3, 0, w * 0.7, 0);
      overhead.addColorStop(0, 'rgba(255,255,255,0)');
      overhead.addColorStop(0.5, 'rgba(255,255,255,0.06)');
      overhead.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = overhead;
      ctx.fillRect(0, 0, w, h * 0.4);
      break;
    }
  }

  // 2. Render Product with Logo
  // Create an offscreen product canvas with transparent backing
  const prodCanvas = document.createElement('canvas');
  prodCanvas.width = w;
  prodCanvas.height = h;
  const prodCtx = prodCanvas.getContext('2d');
  if (prodCtx) {
    // Draw the product using our master renderer
    renderPreviewCanvas(prodCanvas, product, view, garmentHex, logoImg, logoConfig);

    // Drop shadow under the product on the lifestyle floor
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.86, w * 0.36, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.filter = 'blur(24px)';
    ctx.fill();
    ctx.restore();

    // Composite product onto lifestyle environment
    ctx.drawImage(prodCanvas, 0, 0);
  }

  // 3. Environmental Light Tint & Lens Bloom
  if (params.keyLightColor) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = params.keyLightColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 4. Subtle Film Grain Vignette
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.4, w * 0.5, h * 0.5, w * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  return canvas.toDataURL('image/png', 1.0);
}
