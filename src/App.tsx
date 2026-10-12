import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LogoUploader } from './components/LogoUploader';
import { ProductSelector } from './components/ProductSelector';
import { MockupCanvas } from './components/MockupCanvas';
import { AiSceneGenerator } from './components/AiSceneGenerator';
import { ExportModal } from './components/ExportModal';
import { TechPackModal } from './components/TechPackModal';
import { TrendRadarModal } from './components/TrendRadarModal';
import { PRODUCTS } from './data/products';
import { SAMPLE_LOGOS, SampleLogo } from './data/sampleLogos';
import { Product, ProductView, LogoConfig, TrendTopic } from './types/merch';
import { loadImage } from './utils/canvasRenderer';
import { downloadMockupBundleZip } from './utils/exportZip';

export default function App() {
  const [products] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [selectedView, setSelectedView] = useState<ProductView>(PRODUCTS[0].views[0]);
  const [garmentColor, setGarmentColor] = useState<string>(PRODUCTS[0].baseColor);

  // Logo state initialized with first sample logo ("Aura Coffee Roasters")
  const defaultSample = SAMPLE_LOGOS[0];
  const [activeSampleId, setActiveSampleId] = useState<string>(defaultSample.id);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);

  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    dataUrl: defaultSample.dataUrl,
    name: defaultSample.name,
    originalWidth: 500,
    originalHeight: 500,
    scale: 1.0,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    opacity: 1.0,
    blendMode: 'multiply',
    invertColor: false,
    isEmbroidery: false,
    isDistressed: false,
    removeWhiteBg: false,
    fabricDisplacement: 0.65,
    fabricKnitTexture: 0.55,
    lightingSpecular: 0.4,
    edgeSoftness: 0.5,
    ambientBounce: true,
  });

  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<'studio' | 'ai-generator' | 'techpack'>('studio');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isTrendRadarOpen, setIsTrendRadarOpen] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{ percent: number; status: string } | null>(null);

  // Load image object whenever dataUrl changes
  useEffect(() => {
    if (!logoConfig.dataUrl) return;
    loadImage(logoConfig.dataUrl)
      .then((img) => setLogoImg(img))
      .catch((err) => console.error('Failed to load logo image:', err));
  }, [logoConfig.dataUrl]);

  // Handle user uploading custom file
  const handleUploadLogo = (
    dataUrl: string,
    name: string,
    width: number,
    height: number
  ) => {
    setActiveSampleId('');
    setLogoConfig((prev) => ({
      ...prev,
      dataUrl,
      name,
      originalWidth: width,
      originalHeight: height,
    }));
  };

  // Handle user picking preset sample
  const handleSelectSample = (sample: SampleLogo) => {
    setActiveSampleId(sample.id);
    setLogoConfig((prev) => ({
      ...prev,
      dataUrl: sample.dataUrl,
      name: sample.name,
      originalWidth: 500,
      originalHeight: 500,
    }));
  };

  // Handle changing product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedView(product.views[0]);
    setGarmentColor(product.baseColor);
  };

  // Apply real-time trend recommendation from Google Search Grounding
  const handleApplyTrend = (trend: TrendTopic) => {
    // 1. Set Garment colorway
    if (trend.recommendedColorHex) {
      setGarmentColor(trend.recommendedColorHex);
    }

    // 2. Set Placement
    if (trend.recommendedPlacement) {
      switch (trend.recommendedPlacement) {
        case 'left-pocket':
          setLogoConfig((prev) => ({
            ...prev,
            offsetX: 14,
            offsetY: -10,
            scale: trend.recommendedScale || 0.45,
            isEmbroidery: trend.printMethodRecommendation?.includes('Embroidery') || prev.isEmbroidery,
          }));
          break;
        case 'large-front':
          setLogoConfig((prev) => ({
            ...prev,
            offsetX: 0,
            offsetY: 2,
            scale: trend.recommendedScale || 1.35,
          }));
          break;
        case 'collar':
          setLogoConfig((prev) => ({
            ...prev,
            offsetX: 0,
            offsetY: -16,
            scale: trend.recommendedScale || 0.5,
          }));
          break;
        case 'center':
        default:
          setLogoConfig((prev) => ({
            ...prev,
            offsetX: 0,
            offsetY: 0,
            scale: trend.recommendedScale || 1.0,
          }));
          break;
      }
    }
  };

  // Compute live DPI rating based on logo pixel dimensions vs print box
  const calculateDpiRating = () => {
    const targetWidthPx = selectedView.printArea.maxPrintWidthInches * 300;
    const currentLogoWidth = logoConfig.originalWidth * logoConfig.scale;
    const actualDpi = Math.round(
      (currentLogoWidth / (selectedView.printArea.maxPrintWidthInches * logoConfig.scale)) *
        (logoConfig.originalWidth / 500)
    );

    if (logoConfig.originalWidth >= 1200 || currentLogoWidth >= targetWidthPx * 0.7) {
      return { dpi: 300, label: 'Print Ready', status: 'good' as const };
    } else if (logoConfig.originalWidth >= 600) {
      return { dpi: 200, label: 'Good Quality', status: 'acceptable' as const };
    } else {
      return { dpi: 150, label: 'Draft Res', status: 'low' as const };
    }
  };

  // Handle downloading all mockups as a ZIP bundle
  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadMockupBundleZip(
        products,
        selectedProduct,
        garmentColor,
        logoImg,
        logoConfig,
        (percent, status) => {
          setZipProgress({ percent, status });
        }
      );
    } catch (err) {
      console.error('Failed to export mockups bundle:', err);
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportModalOpen(true)}
        onExportZip={handleExportZip}
        onOpenTrendRadar={() => setIsTrendRadarOpen(true)}
        isExportingZip={isExportingZip}
        zipProgress={zipProgress}
        dpiRating={calculateDpiRating()}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Logo & Placement Customization */}
            <div className="lg:col-span-4 space-y-6">
              <LogoUploader
                logoConfig={logoConfig}
                setLogoConfig={setLogoConfig}
                onUploadLogo={handleUploadLogo}
                onSelectSample={handleSelectSample}
                activeSampleId={activeSampleId}
                productName={selectedProduct.name}
                garmentColorHex={garmentColor}
              />
            </div>

            {/* Right Column: Interactive Canvas & Product Selector */}
            <div className="lg:col-span-8 space-y-6">
              <MockupCanvas
                product={selectedProduct}
                view={selectedView}
                garmentColor={garmentColor}
                logoImg={logoImg}
                logoConfig={logoConfig}
                setLogoConfig={setLogoConfig}
              />

              <ProductSelector
                products={products}
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
                selectedColor={garmentColor}
                onSelectColor={setGarmentColor}
                selectedView={selectedView}
                onSelectView={setSelectedView}
              />
            </div>
          </div>
        )}

        {/* AI Scene Generator Tab */}
        {activeTab === 'ai-generator' && (
          <AiSceneGenerator
            product={selectedProduct}
            view={selectedView}
            garmentColor={garmentColor}
            logoImg={logoImg}
            logoConfig={logoConfig}
          />
        )}

        {/* Manufacturer Tech Pack Tab */}
        {activeTab === 'techpack' && (
          <TechPackModal
            product={selectedProduct}
            view={selectedView}
            garmentColor={garmentColor}
            logoConfig={logoConfig}
          />
        )}
      </main>

      {/* Print-Ready Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        product={selectedProduct}
        view={selectedView}
        garmentColor={garmentColor}
        logoImg={logoImg}
        logoConfig={logoConfig}
        onExportZip={handleExportZip}
        isExportingZip={isExportingZip}
      />

      {/* Live Trend Radar Modal (Google Search Grounded) */}
      <TrendRadarModal
        isOpen={isTrendRadarOpen}
        onClose={() => setIsTrendRadarOpen(false)}
        products={products}
        onApplyTrend={handleApplyTrend}
      />
    </div>
  );
}
