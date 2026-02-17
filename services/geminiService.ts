
import { GoogleGenAI, Type } from "@google/genai";
import { TafsirResult, TafsirSource, ThematicResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to handle Quota limits with Retry logic
async function generateContentWithRetry(model: string, contents: any, config: any) {
  let retries = 0;
  const maxRetries = 3;

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
        let delay = 5000;

        const details = error.details || error.error?.details || error.response?.data?.error?.details;
        
        if (details && Array.isArray(details)) {
          const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo') || d.retryDelay);
          if (retryInfo && retryInfo.retryDelay) {
            const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
            if (!isNaN(seconds)) {
              delay = (seconds * 1000) + 2000;
            }
          }
        } 
        
        if (delay === 5000 && error.message) {
          const match = error.message.match(/retry in (\d+(\.\d+)?)s/);
          if (match && match[1]) {
            delay = (parseFloat(match[1]) * 1000) + 2000;
          }
        }

        console.warn(`[Gemini Service] Quota exceeded. Retrying in ${(delay/1000).toFixed(1)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
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

  const model = "gemini-3-flash-preview";
  
  if (source === TafsirSource.AL_MUNJID) {
    const prompt = `
      Anda adalah ahli linguistik bahasa Arab, mufassir, dan leksikografer.
      Tugas: Lakukan analisis Mufradat (kamus per kata) untuk ayat Al-Quran berikut.
      Surah: ${surahName}, Ayat: ${verseNumber}
      Teks: "${verseText}"
      
      Referensi Utama: Kamus Al-Munjid (Luwis Ma'luf) dan Lisanul Arab.
      
      Instruksi:
      1. Pecah ayat menjadi kata-kata (unit makna terkecil).
      2. Tentukan Akar Kata (Jizr) 3 huruf untuk setiap kata.
      3. Klasifikasikan jenis kata (Ism/Fi'il/Harf).
      4. Berikan transliterasi dan arti harfiah.
      5. Berikan penjelasan morfologi singkat (misal: ini adalah fi'il madhi, atau jamak taksir).
      
      Format Output JSON Only.
    `;

    try {
      const response = await generateContentWithRetry(model, prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  root: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  wordType: { type: Type.STRING, enum: ["Ism (Kata Benda)", "Fi'il (Kata Kerja)", "Harf (Huruf/Partikel)"] },
                  munjidDefinition: { type: Type.STRING },
                  grammarNote: { type: Type.STRING }
                },
                required: ["word", "root", "translation", "wordType"]
              }
            },
            generalSummary: { type: Type.STRING }
          }
        }
      });

      const json = JSON.parse(response.text || '{}');
      
      return {
        source,
        text: json.generalSummary || "Analisis Kamus Per Kata",
        keyPoints: [],
        vocabulary: json.vocabulary || []
      };

    } catch (error) {
      console.error("Error fetching Vocabulary:", error);
      throw error;
    }
  }

  const prompt = `
    Bertindaklah sebagai ahli tafsir Al-Quran. Berikan penjelasan tafsir mendalam untuk Surah ${surahName} Ayat ${verseNumber}.
    Sumber: ${source}. Bahasa: Indonesia.
    Output: JSON.
  `;

  try {
    const response = await generateContentWithRetry(model, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
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

  const model = "gemini-3-flash-preview";

  const prompt = `
    Kajian Tafsir Tematik tentang: "${theme}". Sumber: ${source}.
    Pilih 3-5 ayat relevan, jelaskan kaitannya, dan buat kesimpulan.
    Bahasa: Indonesia. Format: JSON.
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
                relevance: { type: Type.STRING }
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
