import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product, ProductView, LogoConfig } from '../types/merch';
import { renderPreviewCanvas, exportHighResMockup } from '../utils/canvasRenderer';

interface MockupCanvasProps {
  product: Product;
  view: ProductView;
  garmentColor: string;
  logoImg: HTMLImageElement | null;
  logoConfig: LogoConfig;
  setLogoConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  product,
  view,
  garmentColor,
  logoImg,
  logoConfig,
  setLogoConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showPrintGuides, setShowPrintGuides] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Redraw canvas whenever dependencies change
  const redraw = useCallback(() => {
    if (!canvasRef.current) return;
    renderPreviewCanvas(
      canvasRef.current,
      product,
      view,
      garmentColor,
      logoImg,
      logoConfig
    );
  }, [product, view, garmentColor, logoImg, logoConfig]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Handle drag-to-position on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Convert pixel delta to percentage offset
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const percentDx = (dx / canvasRect.width) * 100;
    const percentDy = (dy / canvasRect.height) * 100;

    setLogoConfig((prev) => ({
      ...prev,
      offsetX: Math.max(-45, Math.min(45, prev.offsetX + percentDx)),
      offsetY: Math.max(-45, Math.min(45, prev.offsetY + percentDy)),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Download high-resolution PNG of the active preview
  const handleDownloadSnapshot = async () => {
    try {
      setIsDownloading(true);
      const url = await exportHighResMockup(
        product,
        view,
        garmentColor,
        logoImg,
        logoConfig,
        2000
      );

      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.id}_${view.id}_mockup_2000px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Snapshot download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[520px]">
      {/* Top Canvas Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-200">{product.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-indigo-400 font-semibold">{view.label}</span>
          {view.printArea.warpType === 'cylinder' && (
            <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Sparkles className="w-2.5 h-2.5 text-violet-400" />
              <span>3D Cylindrical Warp Active</span>
            </span>
          )}
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Print Guide Toggle */}
          <button
            onClick={() => setShowPrintGuides(!showPrintGuides)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showPrintGuides
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Printable Area Guides"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Instant Snapshot Download */}
          <button
            onClick={handleDownloadSnapshot}
            disabled={isDownloading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition ml-1"
            title="Download this exact 2000px mockup image"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">
              {isDownloading ? 'Saving...' : 'Save PNG'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center p-4 overflow-hidden bg-slate-950 select-none cursor-grab active:cursor-grabbing"
      >
        <div
          className="relative transition-transform duration-100 ease-out shadow-2xl rounded-xl overflow-hidden"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <canvas
            ref={canvasRef}
            width={1000}
            height={1000}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] md:w-[600px] md:h-[600px] max-w-full aspect-square block bg-slate-950"
          />

          {/* Printable Area Dotted Guide Box */}
          {showPrintGuides && (
            <div
              className="absolute pointer-events-none border border-dashed border-indigo-400/50 rounded-sm transition-all"
              style={{
                left: `${view.printArea.x - (view.printArea.width * logoConfig.scale) / 2 + logoConfig.offsetX}%`,
                top: `${view.printArea.y - (view.printArea.height * logoConfig.scale) / 2 + logoConfig.offsetY}%`,
                width: `${view.printArea.width * logoConfig.scale}%`,
                height: `${view.printArea.height * logoConfig.scale}%`,
              }}
            >
              <div className="absolute -top-5 left-0 bg-indigo-600/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow">
                {view.printArea.maxPrintWidthInches}" × {view.printArea.maxPrintHeightInches}"
              </div>
            </div>
          )}
        </div>

        {/* Floating Hint Overlay */}
        <div className="absolute bottom-3 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 flex items-center space-x-2 pointer-events-none">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click & drag logo on garment to adjust placement</span>
        </div>
      </div>

      {/* Bottom Technical Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          <span>Print Spec: </span>
          <span className="text-slate-200">
            {view.printArea.maxPrintWidthInches}" × {view.printArea.maxPrintHeightInches}"
          </span>
          <span className="mx-2 text-slate-700">|</span>
          <span>Method: </span>
          <span className="text-slate-200">{product.specs.recommendedPrintMethod}</span>
        </div>

        <div className="hidden sm:block">
          <span>Resolution: </span>
          <span className="text-emerald-400 font-bold">
            {product.specs.targetResolutionDpi} DPI Print-Ready
          </span>
        </div>
      </div>
    </div>
  );
};
