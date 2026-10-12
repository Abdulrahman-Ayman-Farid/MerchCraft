import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Check,
  Printer,
  Archive,
  Layers,
  Sliders,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { Product, ProductView, LogoConfig, ExportSettings } from '../types/merch';
import { exportPrintReadyGraphic } from '../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  view: ProductView;
  garmentColor: string;
  logoImg: HTMLImageElement | null;
  logoConfig: LogoConfig;
  onExportZip: () => void;
  isExportingZip: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  product,
  view,
  garmentColor,
  logoImg,
  logoConfig,
  onExportZip,
  isExportingZip,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    dpi: 300,
    format: 'png',
    includeBleed: true,
    includeCropMarks: true,
    includeDimensionsGuide: true,
    colorProfile: 'sRGB',
  });

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);

  // Generate preview of print-ready master
  useEffect(() => {
    if (!isOpen || !logoImg) return;
    setIsRendering(true);
    try {
      const url = exportPrintReadyGraphic(product, view, logoImg, logoConfig, settings);
      setPreviewDataUrl(url);
    } catch (e) {
      console.error('Failed to generate export preview:', e);
    } finally {
      setIsRendering(false);
    }
  }, [isOpen, product, view, logoImg, logoConfig, settings]);

  if (!isOpen) return null;

  const printArea = view.printArea;
  const pixelWidth = Math.round((printArea.maxPrintWidthInches + (settings.includeBleed ? 0.25 : 0)) * settings.dpi);
  const pixelHeight = Math.round((printArea.maxPrintHeightInches + (settings.includeBleed ? 0.25 : 0)) * settings.dpi);

  const handleDownloadMaster = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `${product.id}_${view.id}_${printArea.maxPrintWidthInches}x${printArea.maxPrintHeightInches}in_${settings.dpi}DPI_PrintReady.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Export Print-Ready Production Master
              </h2>
              <p className="text-xs text-slate-400">
                True physical dimensions, 300 DPI vector clarity, crop marks & bleed margins.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Settings Column */}
          <div className="md:col-span-6 space-y-5">
            {/* DPI Quality Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Resolution & Print DPI
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { dpi: 150, label: '150 DPI', sub: 'Proofing' },
                  { dpi: 300, label: '300 DPI', sub: 'Industry Standard' },
                  { dpi: 600, label: '600 DPI', sub: 'Fine Art' },
                ].map((item) => (
                  <button
                    key={item.dpi}
                    onClick={() => setSettings((s) => ({ ...s, dpi: item.dpi as any }))}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      settings.dpi === item.dpi
                        ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Print Guides & Bleeds Toggles */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                Pre-Press Production Specs
              </label>

              {/* Include 0.125" Bleed Margins */}
              <button
                onClick={() => setSettings((s) => ({ ...s, includeBleed: !s.includeBleed }))}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                  settings.includeBleed
                    ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-200">Include 0.125" Bleed Margins</div>
                  <div className="text-[10px] text-slate-400">
                    Safe printing margins for automated cutting & garment alignment
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    settings.includeBleed ? 'bg-indigo-600 text-white' : 'border border-slate-700'
                  }`}
                >
                  {settings.includeBleed && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Include Crop Marks & Crosshairs */}
              <button
                onClick={() =>
                  setSettings((s) => ({ ...s, includeCropMarks: !s.includeCropMarks }))
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                  settings.includeCropMarks
                    ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-200">
                    Printer Crop Marks & Crosshairs
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Standard pre-press corner guides for screen positioning
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    settings.includeCropMarks ? 'bg-indigo-600 text-white' : 'border border-slate-700'
                  }`}
                >
                  {settings.includeCropMarks && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Include Dimensions Guide Footer */}
              <button
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    includeDimensionsGuide: !s.includeDimensionsGuide,
                  }))
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                  settings.includeDimensionsGuide
                    ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-200">Technical Dimension Footer</div>
                  <div className="text-[10px] text-slate-400">
                    Embeds product specs & DPI directly in margin info line
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    settings.includeDimensionsGuide
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-700'
                  }`}
                >
                  {settings.includeDimensionsGuide && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            {/* Spec Summary Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Physical Size:</span>
                <span className="font-bold text-white">
                  {printArea.maxPrintWidthInches}" × {printArea.maxPrintHeightInches}"
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canvas Pixels:</span>
                <span className="font-bold text-indigo-400">
                  {pixelWidth} × {pixelHeight} px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Print Method:</span>
                <span className="text-emerald-400">{product.specs.recommendedPrintMethod}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Master Preview Canvas & Download Action */}
          <div className="md:col-span-6 flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 relative min-h-[320px]">
              <div className="relative max-w-[280px] max-h-[320px] w-full aspect-[3/4] rounded-lg overflow-hidden transparency-grid border border-slate-700/80 shadow-inner flex items-center justify-center">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Print Ready Master"
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Generating Proof...</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-mono">
                Transparent Alpha Master Proof
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              <button
                onClick={handleDownloadMaster}
                disabled={!previewDataUrl || isRendering}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download 300 DPI Print Master (PNG)</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onExportZip();
                }}
                disabled={isExportingZip}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-2"
              >
                <Archive className="w-4 h-4 text-indigo-400" />
                <span>Download All Product Mockups (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
