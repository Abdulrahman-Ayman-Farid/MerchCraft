import React from 'react';
import { FileText, Printer, Download, CheckCircle2, Ruler, Tag } from 'lucide-react';
import { Product, ProductView, LogoConfig } from '../types/merch';

interface TechPackModalProps {
  product: Product;
  view: ProductView;
  garmentColor: string;
  logoConfig: LogoConfig;
}

export const TechPackModal: React.FC<TechPackModalProps> = ({
  product,
  view,
  garmentColor,
  logoConfig,
}) => {
  const printArea = view.printArea;
  const colorObj = product.availableColors.find(
    (c) => c.hex.toLowerCase() === garmentColor.toLowerCase()
  );

  const printWidthCm = (printArea.maxPrintWidthInches * 2.54).toFixed(1);
  const printHeightCm = (printArea.maxPrintHeightInches * 2.54).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Manufacturing Ready
            </span>
            <span className="text-xs text-slate-400 font-mono">SPEC-REV 2026.1</span>
          </div>
          <h2 className="text-lg font-extrabold text-white mt-1">
            Production Tech Pack & Spec Sheet
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed manufacturing instructions for screenprinters, embroidery digitizers, and DTG
            facilities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Tech Pack Document Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 font-sans print:bg-white print:text-black print:border-none">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              MerchCraft Studio • Production Spec
            </span>
            <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {product.specs.material} {product.specs.weightGsm ? `(${product.specs.weightGsm} GSM)` : ''}
            </p>
          </div>

          <div className="text-left md:text-right text-xs font-mono text-slate-400 space-y-1">
            <div>
              Date:{' '}
              <span className="text-slate-200">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div>
              Artwork: <span className="text-slate-200 font-bold">{logoConfig.name}</span>
            </div>
            <div>
              Location: <span className="text-indigo-400 font-bold">{view.label}</span>
            </div>
          </div>
        </div>

        {/* 4-Box Technical Spec Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Garment Colorway */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Garment Blank Color
            </span>
            <div className="flex items-center space-x-2.5 mt-2">
              <span
                className="w-5 h-5 rounded-full border border-slate-700 shadow"
                style={{ backgroundColor: garmentColor }}
              />
              <span className="text-sm font-bold text-white">
                {colorObj?.name || 'Custom Garment Color'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-indigo-400 mt-1.5">
              Pantone Approx: {colorObj?.pantone || 'Custom'}
            </div>
          </div>

          {/* Print Method */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Print Method
            </span>
            <div className="text-sm font-bold text-emerald-400 mt-2">
              {product.specs.recommendedPrintMethod}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              {product.specs.targetResolutionDpi} DPI Minimum File Resolution
            </div>
          </div>

          {/* Maximum Print Dimensions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Finished Graphic Dimensions
            </span>
            <div className="text-sm font-bold text-white mt-2 font-mono">
              {printArea.maxPrintWidthInches}" × {printArea.maxPrintHeightInches}"
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1.5">
              {printWidthCm} cm × {printHeightCm} cm
            </div>
          </div>

          {/* Placement Margin */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Placement Reference
            </span>
            <div className="text-sm font-bold text-white mt-2">
              {product.specs.suggestedMarginFromCollar || 'Centered on Print Box'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Centered on placket axis
            </div>
          </div>
        </div>

        {/* Detailed Pre-Press Inspection Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pre-Press Quality Checklist
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
            {[
              {
                step: 'Color Mode & Separation',
                spec: 'RGB Master provided with simulated CMYK Gamut proofing profile.',
                status: 'Verified',
              },
              {
                step: 'Underbase White Ink',
                spec:
                  colorObj?.name.toLowerCase().includes('white') || garmentColor === '#ffffff'
                    ? 'None required (Natural substrate).'
                    : '100% Solid White Underbase required for opacity on dark garment.',
                status: 'Required',
              },
              {
                step: 'Bleed Margins',
                spec: '0.125 inch (3.175 mm) perimeter bleed embedded with crop marks.',
                status: 'Embedded',
              },
              {
                step: 'Curing & Inks',
                spec: 'Water-based NeoPigment or Plastisol cured at 320°F (160°C) for 90 seconds.',
                status: 'Standard',
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div className="font-semibold text-slate-200 w-48">{row.step}</div>
                <div className="text-slate-400 flex-1">{row.spec}</div>
                <div className="text-emerald-400 font-mono font-bold">{row.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
