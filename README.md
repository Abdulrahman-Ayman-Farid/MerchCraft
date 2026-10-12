# MerchCraft AI — On-Demand Merch Mockups & Print Studio

> **Photorealistic 3D Merchandise Mockup Engine, AI Commercial Photoshoot Generator, and Pre-Press 300 DPI Production Pipeline.**

---

## 1. Executive Summary & Value Proposition

### The Problem
The global custom apparel and print-on-demand (POD) industry suffers from a critical disconnect between digital design and physical reality:
1. **Flat "Sticker" Mockups**: Conventional mockup tools paste a flat PNG image on top of a product photo. The graphic ignores natural fabric folds, creases, shadows, and yarn textures, producing fake, amateurish images that hurt e-commerce conversion rates.
2. **Pre-Press Production Friction**: Digital designers often export screen-resolution (72 DPI) images without bleed margins, crop marks, or collar-seam placement coordinates. Print shops (screen printers, DTG decorators, and embroidery digitizers) spend hours manually formatting artwork and fixing scale mistakes.
3. **Expensive Lifestyle Photoshoots**: High-end commercial lookbooks require hiring models, photographers, lighting equipment, and studio locations, costing $2,000–$10,000+ per apparel drop.
4. **Fast-Moving Streetwear Trends**: Trends in blanks (e.g., 240+ GSM heavyweight drop-shoulder tees, vintage mineral washes, oversized back graphics) shift rapidly. Designers lack real-time market intelligence grounded in live search data.

### The Solution: MerchCraft AI
**MerchCraft AI** bridges the gap between artistic concept, digital preview, and physical apparel manufacturing:
- **Textile Physics Engine**: Real-time conformal displacement mapping bends and ripples graphics across natural fabric folds. Microscopic cotton knit textures, crease specular roll-off, organic fiber ink bleed, and ambient cloth color reflections make artwork look physically screen-printed or woven into the garment.
- **AI Commercial Photoshoot Studio**: Leverages Google Gemini (`gemini-nano-banana-2.1` and `gemini-3.8-flash`) to generate commercial lookbook scenes (Tokyo night streetwear, Paris golden hour, concrete architectural galleries) and edit scenes with natural language prompts.
- **Google Search-Grounded Trend Radar**: Uses `gemini-3.5-flash` with Google Search grounding to discover real-time streetwear silhouettes, viral colorways, and placement standards with verified web sources and 1-click application to the canvas.
- **Production-Grade Pre-Press Master Files**: Exports transparent 300 DPI PNG masters at true physical dimensions (e.g., 12.0" × 16.0" = 3600 × 4800 px) with 0.125" bleed margins, precision printer crop marks, CMYK gamut simulation, and downloadable manufacturer Tech Packs.

---

## 2. Business Architecture & Market Strategy

### 2.1 Target Customer Personas
1. **Direct-to-Consumer (DTC) Apparel Brands**: Streetwear, luxury athleisure, and band merch brands needing lookbook-quality product shots for Shopify, Instagram, and Lookbooks before physical samples are produced.
2. **Print-on-Demand (POD) Sellers**: Etsy, Amazon Merch, and TikTok Shop creators who require high-converting product listings and 1-click `.zip` mockup bundles across multiple product blanks.
3. **Design Agencies & Freelancers**: Creatives pitching apparel concepts to clients with realistic 3D presentations and accurate manufacturer spec sheets.
4. **Apparel Decorators & Print Shops**: Screen printing and DTG facilities using the auto-generated Tech Pack to verify artwork dimensions, distance from collar, underbase requirements, and Pantone matches.

### 2.2 Market Opportunity
- The global **Custom T-Shirt Printing Market** was valued at **$4.3B in 2022** and is projected to reach **$10.2B by 2030** (CAGR of 11.5%).
- The **Print-on-Demand (POD) Market** is expanding at a CAGR of 26.1%, driven by zero-inventory business models and creator economy commerce.
- MerchCraft AI addresses the high-value bottleneck of conversion-driving visual assets and manufacturing specification accuracy.

### 2.3 Monetization Models (SaaS & B2B)
| Tier | Pricing | Features |
| :--- | :--- | :--- |
| **Free / Starter** | $0/mo | Interactive 3D Canvas, 8 product blanks, 6 vector presets, 150 DPI exports, live Trend Radar. |
| **Pro Creator** | $29/mo | Unlimited 300 DPI master exports, full `.zip` mockup bundles, advanced fabric physics sliders, CMYK gamut simulation. |
| **Studio / Agency** | $79/mo | High-resolution AI lifestyle scene generation (`gemini-nano-banana-2.1`), prompt-based scene editing, custom brand kit storage. |
| **Enterprise / API** | Custom | White-label headless API integrated into POD fulfillment platforms (Printful, Printify, Gelato, Gooten) for automated mockup rendering. |

---

## 3. Technical Architecture

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Layer (Browser)                      │
│  React 19 • TypeScript • Tailwind CSS 4 • HTML5 Canvas Engine   │
│  - Drag-to-Position Canvas    - 3D Conformal Displacement Map   │
│  - Interactive Realism Tuning - JSZip Bundle Packaging Engine   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP REST (JSON / Multipart)
┌────────────────────────────────▼────────────────────────────────┐
│                   Server Layer (Node.js / Express)               │
│  Express 4.21 • tsx runtime • Vite Middleware (Dev)             │
│  - User-Agent: 'aistudio-build' telemetry headers               │
│  - Graceful multi-tier fallback architecture                    │
└──────────────────┬──────────────┬──────────────┬────────────────┘
                   │              │              │
      ┌────────────▼──┐    ┌──────▼──────┐   ┌───▼───────────┐
      │ Gemini Flash  │    │ Gemini 3.5  │   │  Gemini Nano  │
      │   3.8 API     │    │ Flash Search│   │  Banana 2.1   │
      │- Realism Phys │    │- Live Trends│   │- Image-to-Img │
      │- Photo Direct │    │- Grounding  │   │- Scene Edit   │
      │- Prompt Enh   │    │  Citations  │   │- Diffusion    │
      └───────────────┘    └─────────────┘   └───────────────┘
```

### 3.2 Technology Stack
- **Frontend Framework**: React 19 (`react`, `react-dom`) with TypeScript.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` via `@import "tailwindcss";`), custom transparency checkerboard grids, responsive drawer and modal layouts.
- **Vector & UI Icons**: `lucide-react`.
- **Canvas Rendering Engine**: Custom HTML5 2D Context engine with sub-pixel sampling, conformal trigonometric displacement, cross-hatch texture shaders, and cylindrical warp algorithms.
- **Client-Side Archiving**: `jszip` for asynchronous high-resolution bundle packaging without server load.
- **Backend Framework**: Express 4 (`express`, `dotenv`), TypeScript execution via `tsx`.
- **AI SDK**: `@google/genai` (TypeScript SDK v2.4+).

---

## 4. Textile Physics & Photorealistic Rendering Pipeline

To make placed artwork look physical rather than digital, the rendering pipeline executes a multi-layer composite:

```
[Base Canvas: Studio Gradient & Shadow]
        │
        ▼
[Garment Silhouette & Shading (Flat-Lay, Ghost Mannequin, or Cylindrical)]
        │
        ▼
[Conformal Fabric Wave Displacement Mapping]
  (Slices graphic into 35 vertical strips; displaces along sin(θ) fabric drape)
        │
        ▼
[Ink Fiber Bleed & Edge Diffusion]
  (Gaussian edge soften 0.3–1.2px; simulates ink absorption into ring-spun yarns)
        │
        ▼
[Microscopic Cotton / Fleece Knit Weave Bump]
  (Cross-hatch micro-grain overlay with soft-light blending)
        │
        ▼
[Lighting Specular & Crease Shadow Multiplication]
  (Highlights on fold ridges wash over ink; deep creases multiply darken)
        │
        ▼
[Ambient Garment Color Bounce]
  (Garment base pigment bounces 4-6% color temperature into graphic highlights)
```

### 4.1 Cylindrical Conformal Projection (Mugs & Tumblers)
For curved drinkware, the engine divides the logo into 40 horizontal slices and applies a trigonometric cosine projection:
$$\text{factor} = \cos\left(\frac{x_{\text{norm}} \cdot \pi}{2.6}\right)$$
Vertical perspective bowing and a directional specular shine gradient create realistic curved ceramic and metallic reflections.

---

## 5. Gemini AI Integrations

### 5.1 Real-Time Trend Radar (`gemini-3.5-flash` with Google Search Grounding)
- **Endpoint**: `POST /api/search-merch-trends`
- **Model**: `gemini-3.5-flash` with `tools: [{ googleSearch: {} }]`
- **Functionality**: Queries live web data on current 2026 streetwear trends, viral colorways, fabric washes, and graphic placements.
- **Grounding Metadata**: Extracts verified web citations (`groundingChunks` with titles and URLs).
- **1-Click Application**: Automatically transfers recommended garment colors, placement coordinates, and print methods directly to the active canvas.

### 5.2 AI Realism Analysis & Auto-Optimization (`gemini-3.8-flash`)
- **Endpoint**: `POST /api/ai-realism-analyze`
- **Model**: `gemini-3.8-flash` with structured JSON output
- **Functionality**: Acts as a master textile engineer. Evaluates the garment blank (material, weight, color) and logo graphic, outputting optimal values for blend mode, fabric displacement depth, cotton knit intensity, edge softness, and ambient bounce.

### 5.3 Commercial Merch Scene Generator (`gemini-nano-banana-2.1`)
- **Endpoint**: `POST /api/generate-mockup`
- **Model**: `gemini-nano-banana-2.1` with multi-part image reference (`inlineData`) + prompt
- **Prompt Enhancer**: Powered by `gemini-3.8-flash` via `POST /api/enhance-prompt` to enrich user prompts with commercial lighting, 35mm lens specs, depth of field, and styling details.
- **Intelligent Graceful Fallback**: If a paid API key is not present or quota is exhausted, the server seamlessly switches to the Gemini 3.8 Flash AI Art Director and generates high-resolution composite scenes in 5 commercial studio environments (`neon_cyberpunk`, `concrete_gallery`, `sunlit_terrace`, `cozy_cafe`, `studio_cyclorama`) with zero user-facing errors.

### 5.4 Text-Prompt Image Editing (`gemini-nano-banana-2.1` & `gemini-3.8-flash`)
- **Endpoint**: `POST /api/edit-mockup`
- **Functionality**: Takes an existing generated scene and applies natural language modifications (e.g., "Add warm golden hour rim lighting", "Change background to concrete gallery", "Add authentic 35mm film grain").

---

## 6. Pre-Press Manufacturing Specifications

### 6.1 True 300 DPI Master Graphic Export
- **Print Dimensions**: True physical inches converted to pixels at 300 DPI:
  - T-Shirt Front Chest: $12.0'' \times 16.0'' \rightarrow 3600 \times 4800\text{ px}$
  - Oversized Back: $14.0'' \times 17.5'' \rightarrow 4200 \times 5250\text{ px}$
  - Ceramic Mug Wrap: $8.5'' \times 3.5'' \rightarrow 2550 \times 1050\text{ px}$
  - Canvas Tote Face: $11.0'' \times 11.0'' \rightarrow 3300 \times 3300\text{ px}$
- **Pre-Press Guides**:
  - **0.125" Bleed Margins**: Prevents unprinted gaps during cutting.
  - **Printer Crop Marks & Crosshairs**: Corner registration guides for screen positioning.
  - **Technical Spec Footers**: Embedded product name, DPI, print method, and dimensions.

### 6.2 Manufacturer Tech Pack (Spec Sheet Generator)
Generates an interactive, printable manufacturing sheet:
- **Blank Specs**: Style name, fiber content, and GSM weight.
- **Color Matching**: Hex code with estimated Pantone Matching System (PMS) equivalents (e.g., *Black 6 C*, *Warm Gray 1 C*, *5625 C*).
- **Placement Matrix**: Exact offset from collar rib seam (e.g., *"2.5 inches below collar rib seam, centered on placket axis"*).
- **Pre-Press Quality Checklist**: Underbase white ink verification, curing temperature guidelines ($320^\circ\text{F} / 160^\circ\text{C}$ for 90s), and color separation profiles.

---

## 7. Product Catalog Reference

| Product Name | Category | Material / Blank | Available Perspectives | Default Print Method |
| :--- | :--- | :--- | :--- | :--- |
| **Heavyweight Boxy Tee** | Apparel | 100% Combed Ring-Spun Cotton (240 GSM) | Front Center, Back Oversized, Left Pocket | Direct-to-Garment (DTG) |
| **Streetwear Fleece Hoodie** | Apparel | 80/20 Cotton/Poly French Terry (450 GSM) | Front Kangaroo, Oversized Back | DTG / Screenprint |
| **Organic Canvas Tote** | Accessories | 100% GOTS Certified Organic Canvas (12 oz) | Front Body Face | Screenprint |
| **Ceramic Coffee Mug** | Drinkware | Grade A Ceramic Glaze (11 oz / 330 ml) | Cylindrical Front Wrap | Dye Sublimation |
| **6-Panel Twill Dad Hat** | Accessories | Washed Cotton Chino Twill (Unstructured) | Front Crown (3D Embroidery) | 3D Puff Embroidery |
| **20oz Insulated Tumbler** | Drinkware | 18/8 Stainless Steel (Powder Coated) | Cylindrical Front Wrap | UV Rotary Print |
| **Gallery Framed Art Print** | Prints | 250 GSM Archival Rag Paper with Oak Frame | Gallery Wall Showcase | Giclée Pigment Print |
| **Die-Cut Vinyl Sticker** | Accessories | 6 mil Weatherproof Vinyl with UV Laminate | Die-Cut Contour with Drop Shadow | UV Vinyl Print |

---

## 8. API Reference

### `POST /api/search-merch-trends`
Searches real-time apparel and merchandise market trends using Google Search Grounding.
- **Request Body**:
  ```json
  { "query": "current 2026 apparel merchandise trends streetwear colorways placements" }
  ```
- **Response**:
  ```json
  {
    "trends": [
      {
        "title": "Heavyweight Drop-Shoulder Tees & Vintage Washes",
        "category": "Streetwear",
        "summary": "240+ GSM boxy fits with garment-dyed faded tones...",
        "recommendedColorHex": "#27272a",
        "recommendedColorName": "Washed Charcoal",
        "recommendedPlacement": "large-front",
        "recommendedScale": 1.25,
        "printMethodRecommendation": "DTG / Screenprint"
      }
    ],
    "marketInsight": "High-density fabrics, vintage wash dyes...",
    "sources": [
      { "title": "Streetwear Trends 2026", "url": "https://..." }
    ]
  }
  ```

### `POST /api/ai-realism-analyze`
Calculates optimal physical placement and fabric absorption parameters.
- **Request Body**:
  ```json
  {
    "productName": "Heavyweight Boxy Tee",
    "garmentColorHex": "#18181b",
    "logoName": "Aura Coffee Roasters"
  }
  ```
- **Response**:
  ```json
  {
    "recommendedBlendMode": "multiply",
    "fabricDisplacement": 0.65,
    "fabricKnitTexture": 0.55,
    "edgeSoftness": 0.6,
    "invertColor": true,
    "isEmbroidery": false,
    "realismRationale": "Dark vintage black cotton requires white ink inversion..."
  }
  ```

### `POST /api/generate-mockup`
Generates a commercial photoshoot scene featuring the user's logo.
- **Request Body**:
  ```json
  {
    "prompt": "Cinematic photo of model in Tokyo wearing this tee at night",
    "logoBase64": "data:image/png;base64,...",
    "productType": "Heavyweight Boxy Tee",
    "color": "#18181b",
    "aspectRatio": "1:1",
    "imageSize": "1K"
  }
  ```

---

## 9. Development & Deployment

### 9.1 Environment Variables
Create a `.env` file based on `.env.example`:
```bash
GEMINI_API_KEY="your-google-gemini-api-key"
APP_URL="http://localhost:3000"
PORT=3000
```

### 9.2 Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express + Vite)
npm run dev

# 3. Type check & Lint
npm run lint

# 4. Production build
npm run build
npm run start
```

---

## 10. License & Intellectual Property
- **Engine License**: Apache-2.0
- **Vector Assets & Templates**: Included brand identities (Aura Coffee, Neon Tokyo, North Peak, Hyperion Labs, Surf Club, Zenith) are open-source vector demo assets created for MerchCraft AI.
