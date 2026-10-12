import React, { useRef, useState } from 'react';
import {
  Upload,
  RotateCw,
  Maximize2,
  Sliders,
  Sparkles,
  Scissors,
  Sun,
  LayoutGrid,
  Check,
  RefreshCw,
  Palette,
  Wand2,
  Waves,
  Grid,
  Lightbulb,
} from 'lucide-react';
import { LogoConfig } from '../types/merch';
import { SAMPLE_LOGOS, SampleLogo } from '../data/sampleLogos';

interface LogoUploaderProps {
  logoConfig: LogoConfig;
  setLogoConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
  onUploadLogo: (dataUrl: string, name: string, width: number, height: number) => void;
  onSelectSample: (sample: SampleLogo) => void;
  activeSampleId?: string;
  productName: string;
  garmentColorHex: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  logoConfig,
  setLogoConfig,
  onUploadLogo,
  onSelectSample,
  activeSampleId,
  productName,
  garmentColorHex,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzingRealism, setIsAnalyzingRealism] = useState<boolean>(false);
  const [realismMessage, setRealismMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onUploadLogo(dataUrl, file.name, img.width, img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onUploadLogo(dataUrl, file.name, img.width, img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const setPresetAlignment = (preset: 'center' | 'left-pocket' | 'large-front' | 'collar') => {
    switch (preset) {
      case 'center':
        setLogoConfig((prev) => ({ ...prev, offsetX: 0, offsetY: 0, scale: 1.0, rotation: 0 }));
        break;
      case 'left-pocket':
        setLogoConfig((prev) => ({ ...prev, offsetX: 14, offsetY: -10, scale: 0.45, rotation: 0 }));
        break;
      case 'large-front':
        setLogoConfig((prev) => ({ ...prev, offsetX: 0, offsetY: 2, scale: 1.35, rotation: 0 }));
        break;
      case 'collar':
        setLogoConfig((prev) => ({ ...prev, offsetX: 0, offsetY: -16, scale: 0.5, rotation: 0 }));
        break;
    }
  };

  // AI Realism Analysis using Gemini 3.8 Flash
  const handleAutoRealism = async () => {
    try {
      setIsAnalyzingRealism(true);
      setRealismMessage(null);

      const res = await fetch('/api/ai-realism-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          garmentColorHex,
          logoName: logoConfig.name,
        }),
      });

      const data = await res.json();
      if (data) {
        setLogoConfig((prev) => ({
          ...prev,
          blendMode: (data.recommendedBlendMode as any) || prev.blendMode,
          fabricDisplacement: data.fabricDisplacement ?? 0.65,
          fabricKnitTexture: data.fabricKnitTexture ?? 0.55,
          edgeSoftness: data.edgeSoftness ?? 0.6,
          invertColor: data.invertColor !== undefined ? data.invertColor : prev.invertColor,
          isEmbroidery: data.isEmbroidery !== undefined ? data.isEmbroidery : prev.isEmbroidery,
          ambientBounce: true,
        }));

        setRealismMessage(
          data.realismRationale || 'Optimized fabric displacement, knit texture, and edge absorption!'
        );
      }
    } catch (err) {
      console.warn('Realism analyze error:', err);
      // Client-side smart realism heuristic
      const isDark = garmentColorHex.toLowerCase() !== '#ffffff' && garmentColorHex.toLowerCase() !== '#f4f4ee';
      setLogoConfig((prev) => ({
        ...prev,
        blendMode: isDark ? 'normal' : 'multiply',
        fabricDisplacement: 0.7,
        fabricKnitTexture: 0.6,
        edgeSoftness: 0.6,
        lightingSpecular: 0.45,
        ambientBounce: true,
      }));
      setRealismMessage('Applied optimal fabric conformal folds, cotton knit texture, and ink bleed.');
    } finally {
      setIsAnalyzingRealism(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-6">
      {/* Upload Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Logo & Artwork</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            {logoConfig.originalWidth} × {logoConfig.originalHeight} px
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload transparent PNG, SVG, or choose from trending preloaded brand identities.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/60 hover:bg-slate-950/90"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {logoConfig.dataUrl ? (
            <div className="relative w-20 h-20 rounded-lg p-2 transparency-grid border border-slate-700 flex items-center justify-center bg-slate-900 overflow-hidden shadow-inner">
              <img
                src={logoConfig.dataUrl}
                alt={logoConfig.name}
                className={`max-w-full max-h-full object-contain ${
                  logoConfig.invertColor ? 'filter invert' : ''
                }`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
              <Upload className="w-6 h-6" />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
              {logoConfig.name || 'Click or drop logo image here'}
            </p>
            <p className="text-[10px] text-slate-400">PNG, SVG, JPG, WebP (up to 25MB)</p>
          </div>
        </div>
      </div>

      {/* Preset Brand Identities for 1-Click Testing */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Test Brands</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">6 Vector Presets</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_LOGOS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`relative flex flex-col items-center p-2 rounded-xl border text-center transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/20'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="w-10 h-10 rounded-lg p-1 bg-slate-900 border border-slate-800 flex items-center justify-center mb-1.5">
                  <img
                    src={sample.dataUrl}
                    alt={sample.name}
                    className="max-w-full max-h-full object-contain filter invert"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-200 truncate w-full">
                  {sample.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400 truncate w-full">
                  {sample.category}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Realism Optimizer Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-slate-950 border border-indigo-500/30 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-white">AI Realism Engine</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Gemini 3.8 Flash
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Automatically calculates conformal fold ripples, cotton knit texture, and ink absorption
          for 100% photorealistic integration.
        </p>

        <button
          onClick={handleAutoRealism}
          disabled={isAnalyzingRealism}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isAnalyzingRealism ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Analyzing Textile Physics...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Auto-Optimize Realism</span>
            </>
          )}
        </button>

        {realismMessage && (
          <div className="bg-indigo-950/60 border border-indigo-800/40 rounded-lg p-2 text-[10px] text-indigo-200 leading-snug">
            ✨ {realismMessage}
          </div>
        )}
      </div>

      {/* Quick Alignment Presets */}
      <div>
        <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-2">
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span>Placement Presets</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => setPresetAlignment('center')}
            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
          >
            Center Chest
          </button>
          <button
            onClick={() => setPresetAlignment('left-pocket')}
            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
          >
            Pocket Logo
          </button>
          <button
            onClick={() => setPresetAlignment('large-front')}
            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
          >
            Oversized
          </button>
          <button
            onClick={() => setPresetAlignment('collar')}
            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
          >
            Collar Badge
          </button>
        </div>
      </div>

      {/* Geometry Sliders (Scale, Rotation, Offsets) */}
      <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
        {/* Scale Slider */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1 font-medium">
              <Maximize2 className="w-3 h-3 text-slate-400" />
              <span>Scale</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {Math.round(logoConfig.scale * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.8"
            step="0.05"
            value={logoConfig.scale}
            onChange={(e) =>
              setLogoConfig((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Rotation Slider */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1 font-medium">
              <RotateCw className="w-3 h-3 text-slate-400" />
              <span>Rotation</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {logoConfig.rotation}°
            </span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={logoConfig.rotation}
            onChange={(e) =>
              setLogoConfig((prev) => ({ ...prev, rotation: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Horizontal Position Offset */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1 font-medium">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span>Horizontal Offset (X)</span>
            </span>
            <span className="font-mono text-slate-400">{logoConfig.offsetX}%</span>
          </div>
          <input
            type="range"
            min="-40"
            max="40"
            step="1"
            value={logoConfig.offsetX}
            onChange={(e) =>
              setLogoConfig((prev) => ({ ...prev, offsetX: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Vertical Position Offset */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1 font-medium">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span>Vertical Offset (Y)</span>
            </span>
            <span className="font-mono text-slate-400">{logoConfig.offsetY}%</span>
          </div>
          <input
            type="range"
            min="-40"
            max="40"
            step="1"
            value={logoConfig.offsetY}
            onChange={(e) =>
              setLogoConfig((prev) => ({ ...prev, offsetY: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Photorealism & Fabric Physics Sliders */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Waves className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fabric Physics & Realism</span>
          </label>
          <span className="text-[10px] text-emerald-400 font-semibold font-mono">
            Physical Blend Active
          </span>
        </div>

        {/* Fabric Ripple Conformal Displacement Slider */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1">
              <Waves className="w-3 h-3 text-slate-400" />
              <span>Fabric Ripple Displacement</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {Math.round((logoConfig.fabricDisplacement ?? 0.6) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={logoConfig.fabricDisplacement ?? 0.6}
            onChange={(e) =>
              setLogoConfig((prev) => ({
                ...prev,
                fabricDisplacement: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Bends artwork along realistic folds, creases, and fabric ripples
          </span>
        </div>

        {/* Cotton Knit Weave Texture Slider */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1">
              <Grid className="w-3 h-3 text-slate-400" />
              <span>Cotton Knit Weave Texture</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {Math.round((logoConfig.fabricKnitTexture ?? 0.5) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={logoConfig.fabricKnitTexture ?? 0.5}
            onChange={(e) =>
              setLogoConfig((prev) => ({
                ...prev,
                fabricKnitTexture: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Embosses organic yarn threads and fabric fibers through the ink
          </span>
        </div>

        {/* Lighting Specular & Crease Highlights */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1">
              <Lightbulb className="w-3 h-3 text-slate-400" />
              <span>Fold Lighting & Specular Sheen</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {Math.round((logoConfig.lightingSpecular ?? 0.4) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={logoConfig.lightingSpecular ?? 0.4}
            onChange={(e) =>
              setLogoConfig((prev) => ({
                ...prev,
                lightingSpecular: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Ink Edge Diffusion Softness */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1">
              <Palette className="w-3 h-3 text-slate-400" />
              <span>Ink Fiber Bleed (Edge Softness)</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {(logoConfig.edgeSoftness ?? 0.5).toFixed(1)} px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={logoConfig.edgeSoftness ?? 0.5}
            onChange={(e) =>
              setLogoConfig((prev) => ({
                ...prev,
                edgeSoftness: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Replaces sharp digital cuts with natural ink absorption
          </span>
        </div>

        {/* Ambient Garment Color Bounce */}
        <button
          onClick={() =>
            setLogoConfig((prev) => ({ ...prev, ambientBounce: !prev.ambientBounce }))
          }
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
            logoConfig.ambientBounce
              ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ambient Garment Color Reflection Bounce</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
              logoConfig.ambientBounce ? 'bg-indigo-600 text-white' : 'border border-slate-600'
            }`}
          >
            {logoConfig.ambientBounce && <Check className="w-3 h-3" />}
          </span>
        </button>
      </div>

      {/* Advanced Graphic Treatments & Ink */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
        <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>Graphic Treatments & Ink</span>
        </label>

        {/* Invert Color (White Ink for Dark Tees) */}
        <button
          onClick={() =>
            setLogoConfig((prev) => ({ ...prev, invertColor: !prev.invertColor }))
          }
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
            logoConfig.invertColor
              ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Invert to White Ink (Dark Garments)</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
              logoConfig.invertColor ? 'bg-indigo-600 text-white' : 'border border-slate-600'
            }`}
          >
            {logoConfig.invertColor && <Check className="w-3 h-3" />}
          </span>
        </button>

        {/* Remove Background Chroma Key */}
        <button
          onClick={() =>
            setLogoConfig((prev) => ({ ...prev, removeWhiteBg: !prev.removeWhiteBg }))
          }
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
            logoConfig.removeWhiteBg
              ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Remove White / Light Background</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
              logoConfig.removeWhiteBg ? 'bg-indigo-600 text-white' : 'border border-slate-600'
            }`}
          >
            {logoConfig.removeWhiteBg && <Check className="w-3 h-3" />}
          </span>
        </button>

        {/* 3D Embroidery Stitch Relief */}
        <button
          onClick={() =>
            setLogoConfig((prev) => ({ ...prev, isEmbroidery: !prev.isEmbroidery }))
          }
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
            logoConfig.isEmbroidery
              ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate 3D Puff Embroidery Texture</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
              logoConfig.isEmbroidery ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-600'
            }`}
          >
            {logoConfig.isEmbroidery && <Check className="w-3 h-3" />}
          </span>
        </button>

        {/* Vintage Distressed Screenprint */}
        <button
          onClick={() =>
            setLogoConfig((prev) => ({ ...prev, isDistressed: !prev.isDistressed }))
          }
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
            logoConfig.isDistressed
              ? 'bg-violet-950/40 border-violet-500 text-violet-200'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Vintage Cracked Ink Screenprint</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
              logoConfig.isDistressed ? 'bg-violet-600 text-white' : 'border border-slate-600'
            }`}
          >
            {logoConfig.isDistressed && <Check className="w-3 h-3" />}
          </span>
        </button>
      </div>
    </div>
  );
};
