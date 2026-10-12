import React, { useState } from 'react';
import { Shirt, ShoppingBag, Coffee, Frame, Check, Palette } from 'lucide-react';
import { Product, ProductCategory, ProductView } from '../types/merch';

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  selectedView: ProductView;
  onSelectView: (view: ProductView) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  selectedColor,
  onSelectColor,
  selectedView,
  onSelectView,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  const categories: { id: ProductCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Merch', icon: null },
    { id: 'apparel', label: 'Apparel', icon: <Shirt className="w-3.5 h-3.5" /> },
    { id: 'accessories', label: 'Bags & Hats', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'drinkware', label: 'Drinkware', icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'prints', label: 'Art Prints', icon: <Frame className="w-3.5 h-3.5" /> },
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5">
      {/* Category Pills */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-100">Product Catalog</h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredProducts.length} Blanks Available
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {filteredProducts.map((product) => {
          const isSelected = selectedProduct.id === product.id;
          return (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className={`relative flex flex-col p-3 rounded-xl border text-left transition group ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              {product.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {product.badge}
                </span>
              )}

              <div className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1 pr-4">
                {product.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {product.specs.recommendedPrintMethod} • {product.specs.targetResolutionDpi} DPI
              </div>

              {/* Color swatches preview */}
              <div className="flex items-center space-x-1 mt-2.5">
                {product.availableColors.slice(0, 4).map((col) => (
                  <span
                    key={col.hex}
                    className="w-2.5 h-2.5 rounded-full border border-slate-700/80 shadow-sm"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
                {product.availableColors.length > 4 && (
                  <span className="text-[9px] text-slate-500 font-mono">
                    +{product.availableColors.length - 4}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Garment Color Swatches & Custom Color Picker */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Garment Colorway</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {selectedProduct.availableColors.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name ||
              selectedColor.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedProduct.availableColors.map((color) => {
            const isPicked = selectedColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() => onSelectColor(color.hex)}
                className={`group relative flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                  isPicked
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
                title={`${color.name} (${color.pantone || color.hex})`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-slate-700/80 shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                >
                  {isPicked && (
                    <Check
                      className={`w-2.5 h-2.5 ${
                        color.hex === '#ffffff' || color.hex.toLowerCase() === '#f4f4ee'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </span>
                <span className="text-[11px]">{color.name.split(' ')[0]}</span>
              </button>
            );
          })}

          {/* Custom Hex Color Picker */}
          <div className="relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onSelectColor(e.target.value)}
              className="w-4 h-4 rounded-full border-0 cursor-pointer p-0 bg-transparent"
              title="Pick custom color"
            />
            <span className="text-[11px] font-mono text-slate-400">Custom</span>
          </div>
        </div>
      </div>

      {/* Multi-Angle Product Views */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-300">Print Shot Angles</label>
          <span className="text-[10px] text-slate-400">
            {selectedProduct.views.length} Perspectives
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedProduct.views.map((view) => {
            const isCurrent = selectedView.id === view.id;
            return (
              <button
                key={view.id}
                onClick={() => onSelectView(view)}
                className={`flex-1 py-2 px-3 rounded-xl border text-center transition ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="text-xs">{view.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                  {view.printArea.maxPrintWidthInches}" × {view.printArea.maxPrintHeightInches}"
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
