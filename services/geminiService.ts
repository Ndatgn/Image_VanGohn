import { GoogleGenAI } from "@google/genai";
import { StyleIntensity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transformImageToVanGogh = async (
  base64Image: string,
  intensity: StyleIntensity
): Promise<string> => {
  // Extract the raw base64 data (remove data:image/png;base64, prefix)
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  
  let styleDescription = "";

  // Detailed prompts to capture specific periods and techniques of Van Gogh
  switch (intensity) {
    case StyleIntensity.LOW:
      styleDescription = `
        Target Style: Early Van Gogh / Realistic Impasto.
        Technique: Use heavy, visible brushwork and thick paint texture (impasto).
        Brushstrokes: Short, hatched, distinct strokes that define form and volume.
        Colors: Use somewhat naturalistic but saturated earthy tones (ochres, siennas, olive greens).
        Vibe: Raw, textured, tactile, and grounded. Focus on the physicality of the paint.
      `;
      break;
    case StyleIntensity.HIGH:
      styleDescription = `
        Target Style: Late Van Gogh / Saint-Rémy ('The Starry Night' era).
        Technique: Extreme distortion, exaggerated emotion, and dynamic movement.
        Brushstrokes: Long, swirling, turbulent lines that flow like liquid. The background should swirl dynamically.
        Colors: Intense, hallucinatory contrasts (deep cobalt blues vs. glowing yellows).
        Vibe: Emotional, turbulent, dream-like, and visionary.
      `;
      break;
    case StyleIntensity.MEDIUM:
    default:
      styleDescription = `
        Target Style: Classic Van Gogh (Arles period).
        Technique: The quintessential Post-Impressionist oil painting style with thick paint application.
        Brushstrokes: Rhythmic, directional dashes that follow the contours of the subjects. 
        Colors: Vibrant complementary colors (Chrome Yellow, Prussian Blue, Viridian, Vermilion). 
        Vibe: Bright, vibrating with light, and emotionally charged. The image must look like a painting, not a photo.
      `;
      break;
  }

  const prompt = `
    You are Vincent Van Gogh. Re-paint the provided image in your signature oil painting style.
    ${styleDescription}
    
    CRITICAL INSTRUCTIONS:
    1. Maintain the original composition and subject matter.
    2. Render every pixel as if it were thick oil paint on canvas. 
    3. Ensure brushstrokes are clearly visible, thick, and directional.
    4. Do not just apply a filter; completely reimagine the texture and light.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};