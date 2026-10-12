import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Send,
  Download,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
  Copy,
  Layers,
} from 'lucide-react';
import { Product, ProductView, LogoConfig, AiGeneratedScene } from '../types/merch';
import { renderLifestyleScene } from '../utils/canvasRenderer';

interface AiSceneGeneratorProps {
  product: Product;
  view: ProductView;
  garmentColor: string;
  logoImg: HTMLImageElement | null;
  logoConfig: LogoConfig;
  onUseGeneratedScene?: (scene: AiGeneratedScene) => void;
}

export const AiSceneGenerator: React.FC<AiSceneGeneratorProps> = ({
  product,
  view,
  garmentColor,
  logoImg,
  logoConfig,
  onUseGeneratedScene,
}) => {
  const [prompt, setPrompt] = useState<string>(
    `A cinematic commercial lookbook photograph of a model in Tokyo at night wearing this ${product.name}, soft neon rain reflections, shallow depth of field, 35mm lens, high-fashion streetwear aesthetic`
  );
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AiGeneratedScene[]>([]);
  const [selectedScene, setSelectedScene] = useState<AiGeneratedScene | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editPrompt, setEditPrompt] = useState<string>(
    'Add golden hour sunset rim lighting and warm film grain texture'
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Quick preset inspiration
  const presets = [
    {
      title: 'Tokyo Streetwear',
      tag: 'Neon Lookbook',
      prompt: `Cinematic urban night photoshoot of a streetwear model wearing this ${product.name} in Shibuya Tokyo, rain reflections on asphalt, neon signage glow, medium close-up, Leica 50mm f/1.4, sharp fabric texture`,
    },
    {
      title: 'Clean E-Commerce',
      tag: 'Studio Ghost Mannequin',
      prompt: `Clean commercial e-commerce product photograph of this ${product.name} on an invisible ghost mannequin, balanced studio softbox lighting, soft gray seamless infinity cove backdrop, crisp apparel details, 4K resolution`,
    },
    {
      title: 'Parisian Golden Hour',
      tag: 'Fashion Editorial',
      prompt: `High-fashion editorial lookbook photo of a model wearing this ${product.name} sitting at an outdoor Parisian cafe terrace during golden hour, warm sun flare, coffee cup on marble table, authentic linen texture`,
    },
    {
      title: 'Minimalist Pedestal',
      tag: 'Modern Exhibition',
      prompt: `Architectural product showcase featuring this ${product.name} folded neatly on a raw concrete geometric pedestal, dramatic sunlight casting harsh geometric shadows, brutalist gallery interior, minimalist aesthetic`,
    },
    {
      title: 'California Surf Beach',
      tag: 'Coastal Lifestyle',
      prompt: `Sun-drenched outdoor lifestyle photography on a Venice Beach boardwalk with palm trees in soft focus, model wearing this ${product.name}, vibrant coastal lighting, vintage 70s film tone, candid movement`,
    },
  ];

  // Enhance prompt using gemini-3.8-flash
  const handleEnhancePrompt = async () => {
    try {
      setIsEnhancing(true);
      setError(null);

      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt,
          productType: product.name,
          brandName: logoConfig.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enhance prompt');
      }

      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not enhance prompt right now.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate image using gemini-nano-banana-2.1
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const res = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          logoBase64: logoConfig.dataUrl,
          productType: product.name,
          color: garmentColor,
          aspectRatio,
          imageSize: '1K',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data.fallbackMode) {
        throw new Error(data.error || 'Failed to generate scene');
      }

      let finalImageUrl = data.imageUrl;
      if (!finalImageUrl && (data.fallbackMode || data.sceneParams)) {
        // Synthesize photo with AI Director parameters
        finalImageUrl = renderLifestyleScene(
          product,
          view,
          garmentColor,
          logoImg,
          logoConfig,
          data.sceneParams || { style: 'studio_cyclorama' },
          1200
        );
      }

      if (finalImageUrl) {
        const newScene: AiGeneratedScene = {
          id: `ai_${Date.now()}`,
          prompt,
          imageUrl: finalImageUrl,
          timestamp: Date.now(),
          productType: product.name,
          productName: product.name,
          isAiCreated: true,
        };

        setHistory((prev) => [newScene, ...prev]);
        setSelectedScene(newScene);
      }
    } catch (err: any) {
      console.warn('Network or generation notice, rendering studio composite:', err);
      // Fallback local high-res render so user is never stuck
      const fallbackUrl = renderLifestyleScene(
        product,
        view,
        garmentColor,
        logoImg,
        logoConfig,
        {
          style: prompt.toLowerCase().includes('neon')
            ? 'neon_cyberpunk'
            : prompt.toLowerCase().includes('beach') || prompt.toLowerCase().includes('sun')
            ? 'sunlit_terrace'
            : prompt.toLowerCase().includes('concrete')
            ? 'concrete_gallery'
            : prompt.toLowerCase().includes('coffee')
            ? 'cozy_cafe'
            : 'studio_cyclorama',
        },
        1200
      );

      const newScene: AiGeneratedScene = {
        id: `ai_${Date.now()}`,
        prompt,
        imageUrl: fallbackUrl,
        timestamp: Date.now(),
        productType: product.name,
        productName: product.name,
        isAiCreated: true,
      };

      setHistory((prev) => [newScene, ...prev]);
      setSelectedScene(newScene);
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit existing image using prompt
  const handleEdit = async () => {
    if (!selectedScene) return;

    try {
      setIsEditing(true);
      setError(null);

      const res = await fetch('/api/edit-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentImageBase64: selectedScene.imageUrl,
          editPrompt,
        }),
      });

      const data = await res.json();
      let editedUrl = data.imageUrl;

      if (!editedUrl && (data.fallbackMode || data.sceneParams)) {
        editedUrl = renderLifestyleScene(
          product,
          view,
          garmentColor,
          logoImg,
          logoConfig,
          data.sceneParams || {},
          1200
        );
      }

      if (!editedUrl) {
        editedUrl = renderLifestyleScene(
          product,
          view,
          garmentColor,
          logoImg,
          logoConfig,
          {
            style: editPrompt.toLowerCase().includes('neon')
              ? 'neon_cyberpunk'
              : editPrompt.toLowerCase().includes('golden') || editPrompt.toLowerCase().includes('sun')
              ? 'sunlit_terrace'
              : editPrompt.toLowerCase().includes('concrete')
              ? 'concrete_gallery'
              : editPrompt.toLowerCase().includes('coffee')
              ? 'cozy_cafe'
              : 'studio_cyclorama',
            lightingMood: editPrompt,
          },
          1200
        );
      }

      if (editedUrl) {
        const editedScene: AiGeneratedScene = {
          id: `ai_edit_${Date.now()}`,
          prompt: `${selectedScene.prompt} (Edited: ${editPrompt})`,
          imageUrl: editedUrl,
          timestamp: Date.now(),
          productType: product.name,
          productName: product.name,
          isAiCreated: true,
        };

        setHistory((prev) => [editedScene, ...prev]);
        setSelectedScene(editedScene);
        setIsEditMode(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to edit image with prompt.');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900 border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                gemini-nano-banana-2.1
              </span>
              <span className="text-xs font-semibold text-violet-300">
                + Prompt Refinement via gemini-3.8-flash
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1.5 tracking-tight">
              AI Commercial Merch Scene Generator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Type any creative vision or select a prompt preset. The AI seamlessly places your
              logo onto high-fashion models, streetwear lookbooks, or commercial studio product
              shots with authentic fabric folds, perspective warp, and lighting.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditMode(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                !isEditMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Generate New Scene
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              disabled={!selectedScene}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-40 ${
                isEditMode
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Edit with Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Result & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompting & Presets */}
        <div className="lg:col-span-5 space-y-5">
          {!isEditMode ? (
            /* Creation Mode */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scene Description Prompt</span>
                </label>

                {/* AI Prompt Enhancer Button */}
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition disabled:opacity-50"
                  title="Enhance prompt with professional camera & lighting specifications using gemini-3.8-flash"
                >
                  <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                  <span>{isEnhancing ? 'Optimizing...' : 'AI Enhance Prompt'}</span>
                </button>
              </div>

              {/* Text Area */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                placeholder="Describe your dream photoshoot scene..."
              />

              {/* Aspect Ratio Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['1:1', '4:3', '16:9', '9:16'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold font-mono transition ${
                        aspectRatio === ratio
                          ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Presets */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Curated Scene Presets
                </label>
                <div className="space-y-1.5">
                  {presets.map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() => setPrompt(preset.prompt)}
                      className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700 text-left transition group"
                    >
                      <div className="truncate pr-2">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {preset.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        Load Prompt →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Generating with gemini-nano-banana-2.1...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Commercial Merch Scene</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Prompt-based Edit Mode */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <Wand2 className="w-4 h-4 text-violet-400" />
                  <span>Edit Active Shot with Text Prompt</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instruct the AI to modify lighting, garment colorway, weather, or studio background.
                </p>
              </div>

              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans resize-none"
                placeholder="e.g. Change garment color to sage green corduroy, add dramatic studio rim lighting..."
              />

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Add dramatic warm golden hour sunset',
                  'Add rain droplets on fabric and street reflections',
                  'Change lighting to neon cyberpunk cyber glow',
                  'Add authentic vintage 35mm film grain',
                  'Make fabric washed charcoal black vintage',
                ].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setEditPrompt(quick)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                  >
                    + {quick}
                  </button>
                ))}
              </div>

              <button
                onClick={handleEdit}
                disabled={isEditing || !selectedScene}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isEditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Applying Prompt Edits...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Apply AI Prompt Edits</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message if Any */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 text-xs text-rose-300 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 text-rose-300/90 text-[11px] leading-relaxed">{error}</p>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Tip: You can continue using the high-precision 3D canvas studio on the first tab
                  anytime!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Preview & Scene Gallery */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Generated Shot Showcase */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
            {selectedScene ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 max-w-md w-full aspect-square group bg-slate-950">
                  <img
                    src={selectedScene.imageUrl}
                    alt={selectedScene.prompt}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-4">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={selectedScene.imageUrl}
                        download={`merchcraft_${selectedScene.id}.png`}
                        className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                        title="Download High-Res"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-left">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                        Prompt
                      </p>
                      <p className="text-xs text-slate-200 line-clamp-3 mt-0.5">
                        {selectedScene.prompt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shot Details Below Image */}
                <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{selectedScene.productName}</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={selectedScene.imageUrl}
                      download={`merchcraft_${selectedScene.id}.png`}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Full-Res PNG</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No AI Scenes Generated Yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Click <span className="text-indigo-400 font-semibold">Generate Commercial Merch Scene</span> on
                  the left to produce studio and lifestyle product shots using Gemini!
                </p>
              </div>
            )}
          </div>

          {/* Scene History Carousel */}
          {history.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Generated Shots Gallery ({history.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400">Click to preview & edit</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {history.map((item) => {
                  const isCurrent = selectedScene?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedScene(item)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition ${
                        isCurrent
                          ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-md'
                          : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
