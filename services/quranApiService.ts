
import { SurahData, Verse } from "../types";

const BASE_URL = "https://equran.id/api/v2";

// Cache keys
const SURAH_CACHE_PREFIX = "quran_surah_";
const SURAH_LIST_KEY = "quran_surah_list";

export const getSurahList = async () => {
  const cached = localStorage.getItem(SURAH_LIST_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await fetch(`${BASE_URL}/surat`);
    const json = await response.json();
    if (json.code === 200) {
      localStorage.setItem(SURAH_LIST_KEY, JSON.stringify(json.data));
      return json.data;
    }
  } catch (error) {
    console.error("Failed to fetch surah list", error);
    throw error;
  }
};

export const getSurahDetail = async (surahNumber: number): Promise<SurahData> => {
  // 1. Check Local Storage (Offline Mode)
  const cacheKey = `${SURAH_CACHE_PREFIX}${surahNumber}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Fetch from API (Online Mode)
  try {
    const response = await fetch(`${BASE_URL}/surat/${surahNumber}`);
    const json = await response.json();
    
    if (json.code === 200) {
      const data = json.data;
      
      // Transform API response to our app's format
      const formattedData: SurahData = {
        meta: {
          number: data.nomor,
          name: data.namaLatin,
          englishName: data.nama, // Using Arabic name as secondary
          verseCount: data.jumlahAyat,
          meaning: data.arti,
        },
        verses: data.ayat.map((a: any) => ({
          number: a.nomorAyat,
          text: a.teksArab,
          translation: a.teksIndonesia,
        })),
      };

      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify(formattedData));
      return formattedData;
    }
    throw new Error("API Error");
  } catch (error) {
    console.error(`Failed to fetch surah ${surahNumber}`, error);
    throw error;
  }
};

export const downloadAllSurahs = async (onProgress: (progress: number, current: string) => void) => {
  const allSurahs = await getSurahList();
  let completed = 0;

  for (const surah of allSurahs) {
    onProgress(Math.round((completed / 114) * 100), surah.namaLatin);
    
    // Check if already cached to avoid redundant requests
    const cacheKey = `${SURAH_CACHE_PREFIX}${surah.nomor}`;
    if (!localStorage.getItem(cacheKey)) {
      await getSurahDetail(surah.nomor);
      // Small delay to be gentle on the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    completed++;
  }
  
  onProgress(100, "Selesai");
};

export const isSurahDownloaded = (surahNumber: number): boolean => {
  return !!localStorage.getItem(`${SURAH_CACHE_PREFIX}${surahNumber}`);
};
