import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Server-side Gemini initialization with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Prompt enhancement using gemini-3.8-flash
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { userPrompt, productType, brandName } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const promptText = `You are an expert commercial advertising photographer and creative director for modern streetwear and premium merchandise brands.
Given the product "${productType || 'Apparel'}", brand "${brandName || 'Brand'}", and concept "${userPrompt || 'lifestyle photoshoot'}", generate:
1. An optimized, ultra-detailed photorealistic image generation prompt for a commercial merch photoshoot (lighting, camera lens, depth of field, fabric texture, environment, model or ghost mannequin, color grading).
2. Three quick creative scene ideas with catchy short labels (e.g. "Tokyo Rainy Night", "Minimalist Scandinavian Studio", "Golden Hour Skatepark").

Output your response as strict valid JSON without markdown fences:
{
  "enhancedPrompt": "string",
  "variations": [
    {"label": "string", "prompt": "string"},
    {"label": "string", "prompt": "string"},
    {"label": "string", "prompt": "string"}
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        enhancedPrompt: userPrompt,
        variations: [
          { label: 'Clean Studio', prompt: `${userPrompt}, clean seamless backdrop, diffused commercial studio lighting` },
          { label: 'Urban Streetwear', prompt: `${userPrompt}, modern urban setting, natural daylight, candid angle` },
          { label: 'Minimalist Editorial', prompt: `${userPrompt}, high fashion lookbook aesthetic, architectural shadows` },
        ],
      };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to enhance prompt' });
  }
});

// Generate custom merch mockup scenes using gemini-nano-banana-2.1
app.post('/api/generate-mockup', async (req: Request, res: Response) => {
  try {
    const { prompt, logoBase64, logoMimeType = 'image/png', aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const parts: any[] = [];

    // If a logo is provided, include it in the multi-part request for image-to-image placement
    if (logoBase64) {
      // Strip potential data URL prefix if present
      const cleanBase64 = logoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: logoMimeType,
          data: cleanBase64,
        },
      });
      parts.push({
        text: `Create a professional commercial merchandise product photograph. Place the brand logo/graphic from the provided reference image cleanly and accurately onto the product. Scene description: ${prompt}. Ensure high-resolution apparel/merch photography, realistic fabric folds, accurate perspective warp, natural shadows, sharp details.`,
      });
    } else {
      parts.push({
        text: `High-end commercial merchandise product photography. ${prompt}. Crisp details, photorealistic lighting, premium e-commerce shoot.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let generatedImageUrl: string | null = null;
    let descriptionText = '';


    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text;
        }
      }
    }

    if (generatedImageUrl) {
      return res.json({
        imageUrl: generatedImageUrl,
        description: descriptionText,
      });
    }

    throw new Error('No image returned by nano-banana-2.1 model');
  } catch (error: any) {
    console.warn('nano-banana-2.1 unavailable, activating Gemini 3.8 Flash AI Photo Director:', error?.message);

    try {
      // Intelligently parse scene parameters with gemini-3.8-flash
      const aiDirector = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an elite commercial merchandise creative director. Given this photoshoot prompt: "${req.body.prompt}", choose the best backdrop style and lighting parameters.
Available backdrop styles: "neon_cyberpunk", "studio_cyclorama", "concrete_gallery", "sunlit_terrace", "cozy_cafe".

Respond ONLY with valid JSON without markdown fences:
{
  "style": "string (one of the 5 available styles)",
  "keyLightColor": "hex color or null",
  "ambientColor": "hex color or null",
  "lightingMood": "string (e.g. Golden hour rim lighting, Cyberpunk neon glow, Diffused studio softbox)",
  "photographerNotes": "Short 1-2 sentence commercial shoot notes about camera lens, angle, and fabric styling"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let sceneParams: any = {};
      try {
        sceneParams = JSON.parse(aiDirector.text || '{}');
      } catch {
        sceneParams = {
          style: req.body.prompt.toLowerCase().includes('neon') ? 'neon_cyberpunk' :
                 req.body.prompt.toLowerCase().includes('beach') || req.body.prompt.toLowerCase().includes('sun') ? 'sunlit_terrace' :
                 req.body.prompt.toLowerCase().includes('concrete') ? 'concrete_gallery' :
                 req.body.prompt.toLowerCase().includes('coffee') ? 'cozy_cafe' : 'studio_cyclorama',
          lightingMood: 'Professional commercial studio lighting',
          photographerNotes: 'Medium 50mm portrait shot, shallow depth of field, balanced specular highlights.',
        };
      }

      return res.json({
        fallbackMode: true,
        sceneParams,
        description: sceneParams.photographerNotes || 'Scene composed by Gemini 3.8 Flash AI Director',
      });
    } catch (fbErr: any) {
      console.error('AI Director error:', fbErr);
      return res.status(500).json({
        error: error?.message || 'Failed to generate mockup',
      });
    }
  }
});

// Edit existing mockup with text prompt using gemini-nano-banana-2.1 with gemini-3.8-flash fallback
app.post('/api/edit-mockup', async (req: Request, res: Response) => {
  try {
    const { currentImageBase64, editPrompt, mimeType = 'image/png' } = req.body;

    if (!editPrompt) {
      return res.status(400).json({ error: 'editPrompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    // Attempt nano-banana-2.1 first if image is provided
    if (currentImageBase64) {
      try {
        const cleanBase64 = currentImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `Edit this commercial merchandise product photo according to these instructions: ${editPrompt}. Maintain the integrity of the product and brand placement while accurately applying the requested modifications.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
              imageSize: '1K',
            },
          },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const mime = part.inlineData.mimeType || 'image/png';
              return res.json({
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                description: `Edited: ${editPrompt}`,
              });
            }
          }
        }
      } catch (nanoErr: any) {
        console.warn('nano-banana-2.1 edit error, falling back to Gemini 3.8 Flash:', nanoErr?.message);
      }
    }

    // Interpret edit instructions with gemini-3.8-flash
    const aiEdit = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an elite commercial creative director. Given this edit instruction: "${editPrompt}", determine the new scene backdrop style and lighting.
Available styles: "neon_cyberpunk", "studio_cyclorama", "concrete_gallery", "sunlit_terrace", "cozy_cafe".

Respond ONLY with valid JSON without markdown fences:
{
  "style": "string (one of the 5 available styles)",
  "keyLightColor": "hex color or null",
  "ambientColor": "hex color or null",
  "lightingMood": "string describing the new lighting mood",
  "photographerNotes": "1-sentence summary of the photographic styling applied"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let sceneParams: any = {};
    try {
      sceneParams = JSON.parse(aiEdit.text || '{}');
    } catch {
      sceneParams = {
        style: editPrompt.toLowerCase().includes('neon') ? 'neon_cyberpunk' :
               editPrompt.toLowerCase().includes('sun') || editPrompt.toLowerCase().includes('golden') ? 'sunlit_terrace' :
               editPrompt.toLowerCase().includes('concrete') ? 'concrete_gallery' :
               editPrompt.toLowerCase().includes('coffee') ? 'cozy_cafe' : 'studio_cyclorama',
        lightingMood: editPrompt,
        photographerNotes: `Applied styling: ${editPrompt}`,
      };
    }

    return res.json({
      fallbackMode: true,
      sceneParams,
      description: sceneParams.photographerNotes || `Applied edit: ${editPrompt}`,
    });
  } catch (error: any) {
    console.error('Edit mockup error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to edit mockup image',
    });
  }
});

// Search Grounding for current merch trends using gemini-3.5-flash with googleSearch tool
app.post('/api/search-merch-trends', async (req: Request, res: Response) => {
  try {
    const { query = 'current 2026 apparel merchandise trends streetwear colorways placements' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const promptText = `Research the latest real-time trends for: "${query}".
Focus on current merchandise design, streetwear blanks (e.g. boxy heavyweight tees, vintage washes, fleece hoodies), trending Pantone colorways, graphic placement styles (oversized back, subtle pocket, puff embroidery), and sustainable printing methods.

Provide your response as a valid JSON object without markdown formatting:
{
  "trends": [
    {
      "title": "string",
      "category": "string (e.g. Streetwear, Eco-Merch, Vintage, Minimalist)",
      "summary": "string explaining the trend",
      "recommendedColorHex": "hex color string like #18181b",
      "recommendedColorName": "string like Vintage Washed Black",
      "recommendedPlacement": "string (one of: center, left-pocket, large-front, collar)",
      "recommendedScale": 1.0,
      "printMethodRecommendation": "string (DTG, Screenprint, Puff Embroidery)"
    }
  ],
  "marketInsight": "Brief 1-2 sentence summary of current commercial trends"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        trends: [
          {
            title: 'Heavyweight Drop-Shoulder Tees & Vintage Washes',
            category: 'Streetwear',
            summary: '240+ GSM boxy fits with garment-dyed faded tones and oversized back graphic statements are dominating.',
            recommendedColorHex: '#27272a',
            recommendedColorName: 'Washed Charcoal',
            recommendedPlacement: 'large-front',
            recommendedScale: 1.25,
            printMethodRecommendation: 'DTG / Screenprint',
          },
          {
            title: 'Earth Tones & Sustainable Raw Canvas',
            category: 'Lifestyle',
            summary: 'Natural undyed cottons, warm terracotta, sage green, and organic canvas totes with minimalist line art.',
            recommendedColorHex: '#4e5d4e',
            recommendedColorName: 'Sage Green',
            recommendedPlacement: 'center',
            recommendedScale: 0.95,
            printMethodRecommendation: 'Water-based Screenprint',
          },
          {
            title: 'Subtle Left-Chest Monograms & 3D Puff Embroidery',
            category: 'Premium Athleisure',
            summary: 'Clean understated branding on unstructured caps and heavyweight fleece hoodies with raised tactile stitch textures.',
            recommendedColorHex: '#d6cbb8',
            recommendedColorName: 'Stone Khaki',
            recommendedPlacement: 'left-pocket',
            recommendedScale: 0.45,
            printMethodRecommendation: '3D Puff Embroidery',
          },
        ],
        marketInsight: 'High-density fabrics, vintage wash dyes, and tactile 3D embroidery lead modern merchandise popularity.',
      };
    }

    // Extract grounding sources from response candidate
    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const sources: { title: string; url: string }[] = [];

    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || new URL(chunk.web.uri).hostname,
          url: chunk.web.uri,
        });
      }
    }

    return res.json({
      trends: data.trends || [],
      marketInsight: data.marketInsight || '',
      sources: sources.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Search trends error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to search trends',
    });
  }
});

// AI Realism Analysis using gemini-3.8-flash: calculates realistic physics, fold displacement, and ink absorption
app.post('/api/ai-realism-analyze', async (req: Request, res: Response) => {
  try {
    const { productName, garmentColorHex, logoName } = req.body;

    const prompt = `You are a master apparel print engineer and textile physics specialist.
For the product "${productName}", garment base color "${garmentColorHex}", and logo "${logoName}":
Calculate the most physically photorealistic visual placement parameters so the graphic looks authentically printed into the cotton fibers rather than a floating computer graphic.

Output strict JSON without markdown formatting:
{
  "recommendedBlendMode": "string (multiply | normal | screen | overlay)",
  "fabricDisplacement": 0.65,
  "fabricKnitTexture": 0.55,
  "edgeSoftness": 0.6,
  "invertColor": false,
  "isEmbroidery": false,
  "realismRationale": "1-2 sentence explanation of why this creates physical realism"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Realism analyze error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to analyze realism' });
  }
});

// Start Express server and connect Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MerchCraft Server listening on port ${port}`);
  });
}

startServer();
