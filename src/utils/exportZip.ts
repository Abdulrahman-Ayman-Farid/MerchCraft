import JSZip from 'jszip';
import { Product, LogoConfig } from '../types/merch';
import { exportHighResMockup } from './canvasRenderer';

export async function downloadMockupBundleZip(
  products: Product[],
  selectedProduct: Product,
  garmentHex: string,
  logoImg: HTMLImageElement | null,
  logoConfig: LogoConfig,
  onProgress?: (progress: number, statusText: string) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('MerchCraft-Mockups') || zip;

  let completed = 0;
  const total = products.reduce((acc, p) => acc + p.views.length, 0);

  for (const prod of products) {
    const color = prod.id === selectedProduct.id ? garmentHex : prod.baseColor;

    for (const view of prod.views) {
      if (onProgress) {
        onProgress(
          Math.round((completed / total) * 100),
          `Rendering ${prod.name} (${view.name})...`
        );
      }

      const dataUrl = await exportHighResMockup(
        prod,
        view,
        color,
        logoImg,
        logoConfig,
        1800
      );

      // Strip data:image/png;base64,
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const filename = `${prod.id}_${view.id}_${color.replace('#', '')}.png`;
      folder.file(filename, base64Data, { base64: true });

      completed++;
    }
  }

  if (onProgress) {
    onProgress(100, 'Packaging ZIP archive...');
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `MerchCraft_All_Mockups_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
