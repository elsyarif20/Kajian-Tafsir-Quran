
import React, { useState } from 'react';
import { ALL_SURAHS } from './constants';
import { SurahCard } from './components/SurahCard';
import { Reader } from './components/Reader';
import { TafsirPanel } from './components/TafsirPanel';
import { ThematicTafsir } from './components/ThematicTafsir';
import { TahlilView } from './components/TahlilView';
import { RiyadhushShalihinView } from './components/RiyadhushShalihinView';
import { SurahMeta, Verse, TafsirSource } from './types';
import { Search, BookOpen, LayoutGrid, LibraryBig, ScrollText, Book, Download, CheckCircle, Loader2 } from 'lucide-react';
import { downloadAllSurahs } from './services/quranApiService';

type AppMode = 'surah' | 'theme' | 'tahlil' | 'riyadhush';

export default function App() {
  const [mode, setMode] = useState<AppMode>('surah');
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [initialTafsirSource, setInitialTafsirSource] = useState<TafsirSource | undefined>(undefined);

  const filteredSurahs = ALL_SURAHS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  const handleOpenTafsir = (verse: Verse, surahName: string, initialSource?: TafsirSource) => {
    setSelectedVerse(verse);
    setInitialTafsirSource(initialSource);
    setIsTafsirOpen(true);
  };

  const handleDownloadOffline = async () => {
    setIsDownloading(true);
    try {
      await downloadAllSurahs((progress, current) => {
        setDownloadProgress(progress);
        setDownloadStatus(current);
      });
      setIsOfflineReady(true);
    } catch (error) {
      alert("Gagal mengunduh data. Periksa koneksi internet Anda.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'theme': return <ThematicTafsir />;
      case 'tahlil': return <TahlilView />;
      case 'riyadhush': return <RiyadhushShalihinView />;
      case 'surah':
      default:
        return (
          <main className="max-w-4xl mx-auto px-4 -mt-10 pb-20 relative z-20 animate-in fade-in duration-500">
            {(isDownloading || isOfflineReady) && (
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDownloading ? <Loader2 className="animate-spin text-emerald-500" size={20} /> : <CheckCircle className="text-emerald-500" size={20} />}
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{isDownloading ? 'Mengunduh Al-Qur\'an...' : 'Siap Digunakan Offline'}</p>
                    <p className="text-xs text-slate-500">{isDownloading ? `Memproses: ${downloadStatus} (${downloadProgress}%)` : 'Semua surat telah tersimpan.'}</p>
                  </div>
                </div>
                {isDownloading && (
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map((surah) => (
                <SurahCard key={surah.number} surah={surah} onClick={setSelectedSurah} />
              ))}
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <div className="flex-grow">
        {selectedSurah ? (
          <Reader surah={selectedSurah} onBack={() => setSelectedSurah(null)} onSelectVerse={handleOpenTafsir} />
        ) : (
          <>
            <header className="bg-emerald-600 text-white pb-24 pt-8 px-4 relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"><BookOpen size={400} /></div>
              <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold font-arabic mb-3">Tafsir & Kamus Al-Qur'an</h1>
                    <p className="text-white font-bold text-lg md:text-xl mb-2 tracking-wide opacity-95">Developed @2025 by Liyas Syarifudin, M.Pd.</p>
                  </div>
                  {mode === 'surah' && !isOfflineReady && !isDownloading && (
                    <button onClick={handleDownloadOffline} className="hidden md:flex flex-col items-center gap-1 text-xs text-emerald-100 bg-emerald-700/30 p-2 rounded-lg"><Download size={20} /><span>Offline</span></button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row p-1 bg-emerald-700/50 backdrop-blur-sm rounded-xl mb-6 w-full gap-1 overflow-x-auto">
                  <button onClick={() => setMode('surah')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'surah' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-emerald-600/50'}`}><LayoutGrid size={18} /><span>Al-Qur'an</span></button>
                  <button onClick={() => setMode('riyadhush')} className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'riyadhush' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-emerald-600/50'}`}><Book size={18} /><span>Riyadhus Shalihin</span></button>
                  <button onClick={() => setMode('theme')} className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'theme' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-emerald-600/50'}`}><LibraryBig size={18} /><span>Tafsir Tematik</span></button>
                  <button onClick={() => setMode('tahlil')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'tahlil' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-emerald-600/50'}`}><ScrollText size={18} /><span>Tahlil NU</span></button>
                </div>

                {mode === 'surah' && (
                  <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <input type="text" placeholder="Cari surat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border-0 text-slate-800 focus:ring-4 focus:ring-emerald-500/30 outline-none" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                )}
              </div>
            </header>
            {renderContent()}
          </>
        )}
      </div>

      <footer className="py-6 bg-slate-100 border-t border-slate-200 mt-auto"><div className="max-w-4xl mx-auto px-4 text-center"><p className="text-slate-400 text-xs">© 2025 Kajian Tafsir Al-Qur'an & Hadits AI</p></div></footer>

      <TafsirPanel 
        isOpen={isTafsirOpen} 
        onClose={() => setIsTafsirOpen(false)} 
        verse={selectedVerse} 
        surahName={selectedSurah?.name || ''}
        initialSource={initialTafsirSource}
      />
    </div>
  );
}
