
import { GoogleGenAI, Type } from "@google/genai";
import { TafsirResult, TafsirSource, ThematicResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to handle Quota limits with Retry logic
async function generateContentWithRetry(model: string, contents: any, config: any) {
  let retries = 0;
  const maxRetries = 3; // Increased to ensure we can handle at least one long wait

  while (true) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config
      });
    } catch (error: any) {
      const isQuotaError = error.code === 429 || 
                           error.status === "RESOURCE_EXHAUSTED" || 
                           (error.message && error.message.toLowerCase().includes("quota")) ||
                           (error.message && error.message.includes("429"));

      if (isQuotaError && retries < maxRetries) {
        retries++;
        let delay = 5000; // Default 5s fallback

        // 1. Try to extract delay from 'details' object (Google RPC standard)
        // Check both root details and nested error.details
        const details = error.details || error.error?.details || error.response?.data?.error?.details;
        
        if (details && Array.isArray(details)) {
          // Look for RetryInfo which contains retryDelay
          const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo') || d.retryDelay);
          if (retryInfo && retryInfo.retryDelay) {
            const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
            if (!isNaN(seconds)) {
              delay = (seconds * 1000) + 2000; // Add 2s buffer to be safe
            }
          }
        } 
        
        // 2. Fallback: Parse from error message string "Please retry in 51.53s"
        if (delay === 5000 && error.message) {
          const match = error.message.match(/retry in (\d+(\.\d+)?)s/);
          if (match && match[1]) {
            delay = (parseFloat(match[1]) * 1000) + 2000;
          }
        }

        console.warn(`[Gemini Service] Quota exceeded. Retrying in ${(delay/1000).toFixed(1)}s... (Attempt ${retries}/${maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a quota error or retries exhausted, throw it
      throw error;
    }
  }
}

export const fetchTafsir = async (
  surahName: string,
  verseNumber: number,
  verseText: string,
  source: TafsirSource
): Promise<TafsirResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  
  const prompt = `
    Bertindaklah sebagai ahli tafsir Al-Quran.
    Berikan penjelasan tafsir yang mendalam untuk:
    Surah: ${surahName}, Ayat: ${verseNumber}
    Bunyi Ayat: "${verseText}"
    
    Sumber Tafsir yang diminta: ${source}.
    
    Instruksi:
    1. Jelaskan ayat ini berdasarkan perspektif dan gaya bahasa dari ${source}.
    2. PENTING: Anda WAJIB mencantumkan nama kitab atau sumber tafsir (${source}) secara eksplisit di dalam teks penjelasan. Contoh: "Menurut Tafsir Ibn Kathir...", atau "Dalam pandangan Buya Hamka...".
    3. Jika sumber spesifik tidak memiliki komentar langsung untuk ayat ini, sintetiskan pandangan umum dari mazhab pemikiran yang diwakili oleh sumber tersebut, namun tetap sebutkan bahwa ini adalah pandangan berdasarkan manhaj ${source}.
    
    Bahasa: Indonesia.
    Format output: JSON.
  `;

  try {
    const response = await generateContentWithRetry(model, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "Detailed comprehensive explanation (Tafsir) explicitly referencing the source" },
          keyPoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3-5 concise key takeaways or lessons from this verse"
          }
        },
        required: ["text", "keyPoints"]
      }
    });

    const json = JSON.parse(response.text || '{}');

    return {
      source,
      text: json.text,
      keyPoints: json.keyPoints || []
    };
  } catch (error) {
    console.error("Error fetching Tafsir:", error);
    throw error;
  }
};

export const generateThematicTafsir = async (
  theme: string,
  source: TafsirSource
): Promise<ThematicResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";

  const prompt = `
    Anda adalah asisten studi Al-Quran yang ahli.
    Tugas: Buatlah kajian Tafsir Tematik (Maudhu'i) tentang tema: "${theme}".
    Batasan: Gunakan ayat-ayat dari seluruh Al-Qur'an (Surah 1 s.d. 114) yang paling relevan.
    Sumber Rujukan: ${source}.
    
    Instruksi:
    1. Pilih 3-5 ayat paling relevan dari Al-Qur'an yang membahas tema ini.
    2. Jelaskan kaitan ayat tersebut dengan tema.
    3. Buat sintesis tafsir yang menghubungkan ayat-ayat tersebut menjadi satu pemahaman utuh berdasarkan ${source}.
    4. PENTING: Dalam teks penjelasan (explanation), Anda WAJIB menyebutkan secara eksplisit bahwa kajian ini merujuk pada pandangan atau kitab ${source}. Jangan lupakan atribusi ini.
    5. Bahasa: Indonesia yang akademis namun mudah dipahami untuk ceramah.

    Format JSON:
    - theme: Judul tema
    - introduction: Pengantar singkat tentang tema ini dalam konteks Al-Qur'an.
    - verses: Array berisi ayat-ayat relevan (surahName, verseNumber, text (Arabic), translation, relevance).
    - explanation: Penjelasan tafsir mendalam (paragraf panjang) yang menyebutkan sumber.
    - conclusion: Kesimpulan utama atau pesan moral.
  `;

  try {
    const response = await generateContentWithRetry(model, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING },
          introduction: { type: Type.STRING },
          verses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                surahName: { type: Type.STRING },
                verseNumber: { type: Type.NUMBER },
                text: { type: Type.STRING },
                translation: { type: Type.STRING },
                relevance: { type: Type.STRING, description: "Why this verse fits the theme" }
              }
            }
          },
          explanation: { type: Type.STRING },
          conclusion: { type: Type.STRING }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');

    return {
      theme: json.theme,
      introduction: json.introduction,
      verses: json.verses || [],
      explanation: json.explanation,
      conclusion: json.conclusion,
      source: source
    };

  } catch (error) {
    console.error("Error fetching Thematic Tafsir:", error);
    throw error;
  }
};
