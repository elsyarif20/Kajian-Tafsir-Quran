
import React, { useState, useEffect } from 'react';
import { TafsirSource, TafsirResult, Verse } from '../types';
import { fetchTafsir } from '../services/geminiService';
import { X, Loader2, Sparkles, Book, ChevronDown, Download, FileText, Share2, Check, AlertTriangle, BookA, GraduationCap, Tag } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface TafsirPanelProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse | null;
  surahName: string;
  initialSource?: TafsirSource;
}

export const TafsirPanel: React.FC<TafsirPanelProps> = ({ isOpen, onClose, verse, surahName, initialSource }) => {
  const [selectedSource, setSelectedSource] = useState<TafsirSource>(initialSource || TafsirSource.IBN_KATHIR);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [result, setResult] = useState<TafsirResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && verse) {
      setError(null);
      setResult(null);
      const sourceToUse = initialSource || selectedSource;
      setSelectedSource(sourceToUse);
      handleFetchTafsir(sourceToUse);
    }
  }, [isOpen, verse, initialSource]);

  const handleFetchTafsir = async (source: TafsirSource) => {
    if (!verse) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedSource(source);

    try {
      const data = await fetchTafsir(surahName, verse.number, verse.text, source);
      setResult(data);
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        setError("Batas kuota AI tercapai. Mohon tunggu 1 menit.");
      } else {
        setError("Gagal memuat konten. Periksa koneksi internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result || !verse) return;
    const shareTitle = `${result.source === TafsirSource.AL_MUNJID ? 'Kamus' : 'Tafsir'} ${surahName}: ${verse.number}`;
    let shareText = `*${shareTitle}*\n\n${verse.text}\n\n`;
    
    if (result.vocabulary) {
      shareText += result.vocabulary.map(v => `${v.word} (${v.root}): ${v.translation}`).join('\n');
    } else {
      shareText += `${result.text.substring(0, 300)}...`;
    }

    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, text: shareText }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !verse) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {selectedSource === TafsirSource.AL_MUNJID ? 'Kamus Al-Qur\'an' : 'Tafsir & Tadabbur'}
            </h2>
            <p className="text-sm text-slate-500">{surahName}: Ayat {verse.number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-arabic text-2xl text-right text-slate-800 mb-3 leading-loose">{verse.text}</p>
              <p className="text-slate-600 italic">"{verse.translation}"</p>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <select
                  value={selectedSource}
                  onChange={(e) => handleFetchTafsir(e.target.value as TafsirSource)}
                  className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-3 px-4 pr-8 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  disabled={loading}
                >
                  {Object.values(TafsirSource).map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            {loading && (
              <div className="py-20 flex flex-col items-center text-slate-400">
                <Loader2 className="animate-spin mb-3 text-emerald-500" size={32} />
                <p className="font-medium">Menganalisis bahasa Al-Qur'an...</p>
              </div>
            )}

            {error && !loading && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button onClick={() => handleFetchTafsir(selectedSource)} className="px-6 py-2 bg-red-600 text-white rounded-lg">Coba Lagi</button>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                <div className="flex justify-end gap-2">
                  <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                    {copied ? <Check size={16} /> : <Share2 size={16} />} <span>Share</span>
                  </button>
                </div>

                {result.source === TafsirSource.AL_MUNJID && result.vocabulary ? (
                   <div className="space-y-6">
                     <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 -mr-10 -mt-10"><BookA size={180} /></div>
                        <h3 className="font-bold text-xl flex items-center gap-2 relative z-10"><GraduationCap /> Analisis Linguistik</h3>
                        <p className="text-indigo-100 text-sm mt-1 relative z-10">{result.text}</p>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {result.vocabulary.map((vocab, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:bg-emerald-50 transition-colors"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                              <div className="flex flex-wrap gap-2 relative z-10">
                                <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-1 rounded shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                                  <Tag size={10} /> {vocab.wordType || 'Kalimat'}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-widest">
                                  Akar: {vocab.root}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-arabic text-4xl text-slate-800 group-hover:text-indigo-700 transition-colors leading-normal">{vocab.word}</p>
                                <p className="text-[10px] text-slate-400 font-mono tracking-wider">{vocab.transliteration}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                 <p className="font-bold text-slate-700 mb-1">{vocab.translation}</p>
                                 <p className="text-xs text-slate-500 leading-relaxed italic">"{vocab.munjidDefinition}"</p>
                               </div>
                               {vocab.grammarNote && (
                                 <div className="flex items-start gap-2 text-[10px] text-slate-400">
                                   <div className="w-1 h-1 rounded-full bg-indigo-300 mt-1.5 flex-shrink-0"></div>
                                   <span>{vocab.grammarNote}</span>
                                 </div>
                               )}
                            </div>
                          </div>
                        ))}
                     </div>
                   </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-emerald-50/50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
                        <Book size={18} className="text-emerald-600" />
                        <h3 className="font-semibold text-emerald-900">Penjelasan ({result.source})</h3>
                      </div>
                      <div className="p-5 prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result.text}</p>
                      </div>
                    </div>

                    {result.keyPoints.length > 0 && (
                      <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                        <div className="flex items-center gap-2 mb-3 text-amber-800 font-semibold"><Sparkles size={18} /><h3>Poin Hikmah</h3></div>
                        <ul className="space-y-2">
                          {result.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex gap-3 text-amber-900/80 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 bg-amber-200/50 rounded-full flex items-center justify-center text-xs font-bold text-amber-800">{idx + 1}</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Generated by Gemini AI @2025</p>
        </div>
      </div>
    </div>
  );
};
